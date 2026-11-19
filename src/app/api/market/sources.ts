import { cacheLife, cacheTag } from "next/cache";
import type { HistoryPoint, Quote } from "@/lib/market-types";

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
export function isOpenNow(timeZone: string, open: [number, number], close: [number, number], now = new Date()) {
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

/*
 * Café Arábica — contrato futuro ICE NY via Yahoo Finance.
 * Auditoria: a origem responde `no-store` (sem cache intermediário), mas o
 * dado é ATRASADO: a ICE só libera cotação gratuita com atraso (medido em
 * ~20 min com o pregão aberto). Endpoint público sem contrato nem limite
 * documentado. Tempo real exige fornecedor licenciado (ver fetchCoffeeLicensed).
 *
 * CORREÇÃO (18/11/2026) — dois defeitos do símbolo genérico `KC=F`:
 * 1. Depois que a ICE publica o ajuste do dia, o Yahoo troca `previousClose`
 *    pelo AJUSTE DE HOJE (275,45), e `regularMarketChangePercent` passa a
 *    comparar o último negócio com o próprio ajuste do dia (+0,218%) — não é
 *    mais a variação diária. A variação correta (Barchart, KCH27): último
 *    276,05 contra o ajuste anterior 281,40 = −1,90%.
 * 2. Na rolagem de vencimento, `KC=F` mistura contratos: o rótulo dizia
 *    "Dec 26", o preço era do Mar/27 e as barras intradiárias começavam no
 *    Dez/26 (280,75, acima da máxima do Mar/27 no dia).
 * Solução: descobrir QUAL contrato o `KC=F` está cotando e ler tudo — preço,
 * ajuste anterior e série — desse mesmo contrato específico (ex.: KCH27.NYB).
 * A variação é: último preço ÷ ajuste da sessão anterior do MESMO contrato − 1.
 * Os dois números vêm da fonte (o ajuste anterior é o fechamento diário do
 * contrato, conferido com o "Previous Close" da Barchart).
 */

export const COFFEE_TAG = "coffee-ice";
const coffeeOpen = () => isOpenNow("America/New_York", [4, 15], [13, 30]);

type YahooChart = {
  chart?: {
    result?: {
      meta?: {
        symbol?: string;
        shortName?: string;
        currency?: string;
        regularMarketPrice?: number;
        regularMarketTime?: number;
        regularMarketChangePercent?: number;
        regularMarketVolume?: number;
      };
      timestamp?: number[];
      indicators?: { quote?: { close?: (number | null)[] }[] };
    }[];
  };
};
const yahoo = async (symbol: string, query: string) =>
  ((await getJson(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?${query}`)) as YahooChart)
    .chart?.result?.[0];

/** Data do pregão em Nova York (AAAA-MM-DD) — o calendário da ICE. */
const nyDay = (ms: number) => new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(ms);

/** Próximos vencimentos do café "C": mar (H), mai (K), jul (N), set (U), dez (Z). */
function nextContracts(now = new Date(), count = 4): string[] {
  const months: [number, string][] = [[3, "H"], [5, "K"], [7, "N"], [9, "U"], [12, "Z"]];
  const out: string[] = [];
  for (let y = now.getUTCFullYear(); out.length < count; y++) {
    for (const [m, code] of months) {
      if (out.length < count && (y > now.getUTCFullYear() || m >= now.getUTCMonth() + 1)) {
        out.push(`KC${code}${String(y).slice(-2)}.NYB`);
      }
    }
  }
  return out;
}

/**
 * Qual contrato o `KC=F` está cotando agora? O que tiver o MESMO último preço
 * e horário. Sem coincidência (ex.: falha do genérico), usa o de maior volume
 * no dia — o contrato ativo. Cache de 30 min: a rolagem acontece raramente.
 */
export async function resolveCoffeeContract(): Promise<{ symbol: string; name: string; matchedGeneric: boolean }> {
  "use cache";
  cacheTag(COFFEE_TAG);
  cacheLife({ stale: 300, revalidate: 1800, expire: 7200 });

  const [generic, ...cands] = await Promise.allSettled([
    yahoo("KC=F", "interval=1d&range=1d"),
    ...nextContracts().map(async (s) => ({ s, m: (await yahoo(s, "interval=1d&range=1d"))?.meta })),
  ]);
  const g = generic.status === "fulfilled" ? generic.value?.meta : undefined;
  const ok = cands
    .flatMap((c) => (c.status === "fulfilled" && c.value.m?.regularMarketPrice ? [c.value] : []))
    .filter((c) => c.m?.currency === "USX");
  const same = ok.filter(
    (c) => g && c.m!.regularMarketPrice === g.regularMarketPrice && Math.abs((c.m!.regularMarketTime ?? 0) - (g.regularMarketTime ?? 0)) <= 120,
  );
  const pick = (same.length ? same : ok).sort((a, b) => (b.m!.regularMarketVolume ?? 0) - (a.m!.regularMarketVolume ?? 0))[0];
  if (!pick) throw new Error("Yahoo: nenhum contrato de café disponível");
  return { symbol: pick.s, name: pick.m!.shortName ?? pick.s, matchedGeneric: same.length > 0 };
}

export async function fetchCoffeeIce(): Promise<Quote> {
  "use cache";
  // a etiqueta permite à validação periódica forçar a renovação se o cache travar
  cacheTag(COFFEE_TAG);
  if (coffeeOpen()) cacheLife(OPEN(20));
  else cacheLife(CLOSED);
  const c = await resolveCoffeeContract();
  return loadCoffeeIce(c.symbol, c.name);
}

/**
 * Leitura do café SEM cache, de um contrato específico — usada pelo
 * fetchCoffeeIce (com cache) e pela validação periódica.
 */
export async function loadCoffeeIce(symbol: string, name: string): Promise<Quote> {
  const r = await yahoo(symbol, "interval=1d&range=10d");
  const meta = r?.meta;
  if (!meta) throw new Error("Yahoo: resposta sem meta");
  if (meta.currency && meta.currency !== "USX") throw new Error(`Yahoo: unidade inesperada ${meta.currency}`);

  const price = num(meta.regularMarketPrice);
  const tradeMs = num(meta.regularMarketTime) * 1000;
  const session = nyDay(tradeMs);

  // ajuste da sessão ANTERIOR do mesmo contrato = último fechamento diário antes do dia do negócio
  const ts = r.timestamp ?? [];
  const close = r.indicators?.quote?.[0]?.close ?? [];
  let prev: HistoryPoint | null = null;
  for (let i = ts.length - 1; i >= 0; i--) {
    const v = close[i];
    if (typeof v === "number" && v > 0 && nyDay(ts[i] * 1000) < session) {
      // barra diária marca a meia-noite do pregão em NY; o ajuste sai no fim do pregão (13h30)
      prev = { t: ts[i] * 1000 + 13.5 * 3600_000, v };
      break;
    }
  }
  if (!prev) throw new Error(`Yahoo: sem ajuste anterior para ${symbol}`);

  const code = symbol.replace(".NYB", "");
  return {
    id: "coffee-ice",
    label: "Café Arábica · ICE NY",
    value: price,
    unit: "US¢/lb",
    // variação diária oficial: último preço contra o ajuste anterior do MESMO contrato
    changePct: (price / prev.v - 1) * 100,
    source: "ICE Futures US via Yahoo Finance",
    sourceUrl: `https://finance.yahoo.com/quote/${encodeURIComponent(symbol)}/`,
    quotedAt: new Date(tradeMs).toISOString(),
    note: `Contrato ${name.replace("Coffee ", "")} (${code}) · dados com atraso`,
    digits: 2,
    // pregão do café arábica (ICE Futures US): 4h15–13h30, horário de Nova York
    marketOpen: coffeeOpen(),
    sourceDelayMin: null,
    realtime: false,
    contract: symbol,
    reference: prev,
    // diagnóstico: o que o Yahoo informa (muda de referência após o ajuste)
    sourceChangePct: typeof meta.regularMarketChangePercent === "number" ? meta.regularMarketChangePercent : null,
  };
}

/* ──────────────────────────── séries para os minigráficos ──────────────────────────── */

/** Máximo de pontos enviados por série — suficiente para uma linha de ~100 px. */
const MAX_POINTS = 96;

/**
 * Reduz a série escolhendo PONTOS REAIS (nunca médias ou interpolações):
 * divide o tempo em faixas e fica com o último ponto publicado em cada uma,
 * sempre preservando o primeiro e o último.
 */
function thin(points: HistoryPoint[]): HistoryPoint[] {
  if (points.length <= MAX_POINTS) return points;
  const first = points[0];
  const last = points[points.length - 1];
  const span = last.t - first.t || 1;
  const buckets = new Map<number, HistoryPoint>();
  for (const p of points.slice(1, -1)) buckets.set(Math.floor(((p.t - first.t) / span) * (MAX_POINTS - 2)), p);
  return [first, ...buckets.values(), last];
}

/** Cache das séries: o gráfico não precisa do ritmo de 20 s do preço. */
const HIST_OPEN = { stale: 60, revalidate: 300, expire: 900 };
const HIST_CLOSED = { stale: 300, revalidate: 1800, expire: 7200 };

/**
 * Café ICE — barras de 5 min da última sessão, MESMO endpoint `chart` do
 * preço, do MESMO contrato específico da cotação (não do genérico `KC=F`,
 * que mistura vencimentos na rolagem). A linha começa no ajuste da sessão
 * anterior — a mesma referência da variação exibida — e segue pelas barras
 * reais da sessão; assim a direção da linha sempre bate com a variação.
 */
export async function fetchCoffeeHistory(symbol: string, reference: HistoryPoint): Promise<HistoryPoint[]> {
  "use cache";
  if (coffeeOpen()) cacheLife(HIST_OPEN);
  else cacheLife(HIST_CLOSED);

  const r = await yahoo(symbol, "interval=5m&range=1d");
  if (r?.meta?.currency && r.meta.currency !== "USX") throw new Error(`Yahoo: unidade inesperada ${r.meta.currency}`);
  const ts = r?.timestamp ?? [];
  const close = r?.indicators?.quote?.[0]?.close ?? [];
  // barras sem negócio vêm null: são descartadas, nunca preenchidas
  const session = ts
    .map((t, i) => ({ t: t * 1000, v: close[i] }))
    .filter((p): p is HistoryPoint => typeof p.v === "number" && Number.isFinite(p.v) && p.v > 0 && p.t > reference.t);
  return thin([reference, ...session]);
}

/**
 * Dólar — cotações sequenciais (1 por minuto) da AwesomeAPI, a partir do
 * fechamento do dia anterior. Auditoria (18/11/2026): `bid − varBid` do dia
 * é EXATAMENTE o último registro do dia anterior no endpoint `daily`, então a
 * linha começa num ponto real e termina no preço atual: a direção da linha
 * sempre bate com a variação mostrada. Com chave: `no-store` na origem.
 * Consumo: 2 requisições a cada 5 min no pregão / 30 min fora (~4 mil/mês).
 */
export async function fetchUsdHistory(): Promise<HistoryPoint[]> {
  "use cache";
  if (isOpenNow("America/Sao_Paulo", [9, 0], [18, 0])) cacheLife(HIST_OPEN);
  else cacheLife(HIST_CLOSED);

  const key = process.env.AWESOMEAPI_KEY;
  const init = key ? { headers: { "x-api-key": key } } : undefined;
  type Row = { bid?: string; timestamp?: string };
  const [daily, seq] = (await Promise.all([
    getJson("https://economia.awesomeapi.com.br/json/daily/USD-BRL/2", init),
    // sem chave a fonte limita a 100 itens; com chave, até 1.500
    getJson(`https://economia.awesomeapi.com.br/json/USD-BRL/${key ? 1000 : 100}`, init),
  ])) as [Row[], Row[]];

  const toPoint = (r: Row): HistoryPoint | null => {
    const v = Number(r.bid);
    const t = Number(r.timestamp) * 1000;
    return Number.isFinite(v) && v > 0 && Number.isFinite(t) && t > 0 ? { t, v } : null;
  };
  const prevClose = daily?.[1] ? toPoint(daily[1]) : null;
  if (!prevClose) throw new Error("AwesomeAPI: sem fechamento anterior");
  const session = (seq ?? [])
    .map(toPoint)
    .filter((p): p is HistoryPoint => p != null && p.t > prevClose.t)
    .sort((a, b) => a.t - b.t);
  return thin([prevClose, ...session]);
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
