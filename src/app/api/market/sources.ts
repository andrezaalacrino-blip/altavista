import { cacheLife } from "next/cache";
import type { Quote } from "@/lib/market-types";

/**
 * Busca das cotações reais. Cada função lança erro em qualquer falha:
 * erros NÃO entram no cache ("use cache" só guarda retornos), então uma
 * fonte fora do ar nunca fica "presa" como valor válido.
 */

const TIMEOUT_MS = 6000;
/** 1 saca = 60 kg = 132,277 lb */
const LB_PER_SACK = 60 / 0.45359237;

async function getJson(url: string, init?: RequestInit): Promise<unknown> {
  const res = await fetch(url, {
    ...init,
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0 (compatible; AltaVistaSite/1.0)", ...init?.headers },
  });
  if (!res.ok) {
    // sem query string: a URL pode conter chave de API (ex.: Barchart) e iria parar nos logs
    const { origin, pathname } = new URL(url);
    throw new Error(`${origin}${pathname} -> HTTP ${res.status}`);
  }
  return res.json();
}

/**
 * Mercado aberto agora? Pelo horário oficial de negociação no fuso do
 * mercado (segunda a sexta). Feriados não são conhecidos pelas fontes
 * gratuitas: nesse caso a interface ainda mostra o horário real da última
 * cotação, então nada é inventado.
 */
function isOpenNow(timeZone: string, open: [number, number], close: [number, number], now = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  );
  if (parts.weekday === "Sat" || parts.weekday === "Sun") return false;
  const minutes = (Number(parts.hour) % 24) * 60 + Number(parts.minute);
  return minutes >= open[0] * 60 + open[1] && minutes < close[0] * 60 + close[1];
}

function num(v: unknown): number {
  const n = typeof v === "string" ? Number(v) : v;
  if (typeof n !== "number" || !Number.isFinite(n) || n <= 0) {
    throw new Error(`valor inválido: ${String(v)}`);
  }
  return n;
}

/**
 * Cache por fonte e por situação do mercado (auditoria de 18/11/2026):
 * - mercado aberto: revalida em segundos, para o site acompanhar a fonte;
 * - mercado fechado: o preço não muda, então consulta bem menos;
 * - `expire` limita quanto tempo um valor velho pode ser servido se a
 *   fonte falhar: depois disso o painel mostra "indisponível", nunca um número parado.
 */
const OPEN = (revalidate: number) => ({ stale: 10, revalidate, expire: 300 });
const CLOSED = { stale: 60, revalidate: 120, expire: 900 };

/**
 * Dólar comercial (USD/BRL) — AwesomeAPI.
 * Auditoria:
 * - SEM chave: toda resposta passa pela CDN deles com max-age=300 (medido:
 *   `Age: 221`, `cf-cache-status: HIT`) — o valor pode estar até ~5 min velho
 *   na própria fonte, e consultar mais rápido não traz nada novo.
 * - COM chave gratuita (AWESOMEAPI_KEY, header x-api-key): "100 mil requisições
 *   mensais gratuitas sem cache". Com 20 s no pregão e 120 s fora dele, o
 *   consumo fica em ~52 mil/mês por instância do servidor.
 * O horário exibido/guardado é o `timestamp` da fonte, nunca o da consulta.
 */
export async function fetchUsdBrl(): Promise<Quote> {
  "use cache";
  const key = process.env.AWESOMEAPI_KEY;
  const open = isOpenNow("America/Sao_Paulo", [9, 0], [18, 0]);
  if (open) cacheLife(OPEN(key ? 20 : 60));
  else cacheLife(CLOSED);

  const data = (await getJson(
    "https://economia.awesomeapi.com.br/json/last/USD-BRL",
    key ? { headers: { "x-api-key": key } } : undefined,
  )) as {
    USDBRL?: { bid?: string; pctChange?: string; timestamp?: string };
  };
  const q = data.USDBRL;
  if (!q) throw new Error("AwesomeAPI: resposta sem USDBRL");

  return {
    id: "usdbrl",
    label: "Dólar comercial",
    value: num(q.bid),
    unit: "R$",
    changePct: q.pctChange != null ? Number(q.pctChange) : null,
    source: "AwesomeAPI",
    sourceUrl: "https://docs.awesomeapi.com.br/api-de-moedas",
    quotedAt: new Date(num(q.timestamp) * 1000).toISOString(),
    note: "Cotação de compra (bid)",
    digits: 4,
    // câmbio comercial: dias úteis, horário de negociação em Brasília
    marketOpen: open,
    sourceDelayMin: null,
    realtime: false,
  };
}

/**
 * Café Arábica — contrato futuro ICE NY (KC, 1º vencimento), via Yahoo Finance.
 * Auditoria: a origem responde `no-store` (sem cache intermediário), mas o
 * dado é ATRASADO: a ICE só libera cotação gratuita com atraso (medido em
 * ~20 min com o pregão aberto). Endpoint público sem contrato nem limite
 * documentado — por isso no máximo 1 consulta a cada 20 s no pregão.
 * Tempo real exige fornecedor licenciado (ver fetchCoffeeLicensed).
 */
export async function fetchCoffeeIce(): Promise<Quote> {
  "use cache";
  const open = isOpenNow("America/New_York", [4, 15], [13, 30]);
  if (open) cacheLife(OPEN(20));
  else cacheLife(CLOSED);

  const data = (await getJson(
    "https://query1.finance.yahoo.com/v8/finance/chart/KC=F?interval=1d&range=5d",
  )) as {
    chart?: {
      result?: {
        meta?: {
          regularMarketPrice?: number;
          regularMarketTime?: number;
          regularMarketChangePercent?: number;
          shortName?: string;
          currency?: string;
        };
      }[];
    };
  };
  const meta = data.chart?.result?.[0]?.meta;
  if (!meta) throw new Error("Yahoo: resposta sem meta");
  if (meta.currency && meta.currency !== "USX") {
    throw new Error(`Yahoo: unidade inesperada ${meta.currency}`);
  }

  return {
    id: "coffee-ice",
    label: "Café Arábica · ICE NY",
    value: num(meta.regularMarketPrice),
    unit: "US¢/lb",
    changePct:
      typeof meta.regularMarketChangePercent === "number" ? meta.regularMarketChangePercent : null,
    source: "ICE Futures US via Yahoo Finance",
    sourceUrl: "https://finance.yahoo.com/quote/KC=F/",
    quotedAt: new Date(num(meta.regularMarketTime) * 1000).toISOString(),
    // Auditoria: fonte gratuita, não licenciada — chega com atraso (medido em
    // ~20 min com o pregão aberto). A interface mostra o atraso real calculado
    // a partir do horário da cotação, sem número fixo inventado.
    note: meta.shortName ? `Contrato ${meta.shortName.replace("Coffee ", "")} · dados com atraso` : "Dados com atraso",
    digits: 2,
    // pregão do café arábica (ICE Futures US): 4h15–13h30, horário de Nova York
    marketOpen: open,
    sourceDelayMin: null,
    realtime: false,
  };
}

/**
 * Integração preparada para um fornecedor LICENCIADO em tempo real
 * (ex.: Barchart OnDemand). Ativada só com as variáveis de ambiente:
 *   COFFEE_PROVIDER=barchart   BARCHART_API_KEY=...
 * Não testada sem chave — confirmar o contrato/formato com o fornecedor.
 */
export async function fetchCoffeeLicensed(): Promise<Quote> {
  "use cache";
  const open = isOpenNow("America/New_York", [4, 15], [13, 30]);
  // limite de chamadas depende do contrato: ajustar aqui ao plano contratado
  if (open) cacheLife(OPEN(15));
  else cacheLife(CLOSED);

  const key = process.env.BARCHART_API_KEY;
  if (!key) throw new Error("BARCHART_API_KEY ausente");
  const data = (await getJson(
    `https://ondemand.websol.barchart.com/getQuote.json?apikey=${encodeURIComponent(key)}&symbols=KC*1`,
  )) as { results?: { lastPrice?: number; percentChange?: number; tradeTimestamp?: string; name?: string }[] };
  const r = data.results?.[0];
  if (!r) throw new Error("Barchart: resposta sem resultado");

  return {
    id: "coffee-ice",
    label: "Café Arábica · ICE NY",
    value: num(r.lastPrice),
    unit: "US¢/lb",
    changePct: typeof r.percentChange === "number" ? r.percentChange : null,
    source: "ICE Futures US via Barchart (licenciado)",
    sourceUrl: "https://www.barchart.com/futures/quotes/KC*1",
    // sem horário da fonte, não há cotação: nunca usar a hora da consulta no lugar
    quotedAt: new Date(r.tradeTimestamp ?? NaN).toISOString(),
    note: "Dados licenciados",
    digits: 2,
    marketOpen: open,
    sourceDelayMin: 0,
    realtime: true,
  };
}

/**
 * Equivalente em R$/saca: ICE (US¢/lb) × lb por saca × câmbio ÷ 100.
 * É uma conversão transparente — não inclui diferencial/prêmio do mercado
 * físico, por isso é rotulada como "calculado".
 */
export function deriveCoffeeBrl(ice: Quote, usd: Quote): Quote {
  const value = (ice.value * LB_PER_SACK * usd.value) / 100;
  const older = ice.quotedAt < usd.quotedAt ? ice.quotedAt : usd.quotedAt;
  return {
    id: "coffee-brl",
    label: "Café Arábica em reais",
    value,
    unit: "R$/saca 60 kg",
    changePct: null,
    source: "Cálculo: ICE NY × dólar comercial",
    sourceUrl: "https://finance.yahoo.com/quote/KC=F/",
    quotedAt: older,
    note: "Conversão direta, sem diferencial do mercado físico",
    derived: true,
    digits: 2,
  };
}
