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
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  return res.json();
}

function num(v: unknown): number {
  const n = typeof v === "string" ? Number(v) : v;
  if (typeof n !== "number" || !Number.isFinite(n) || n <= 0) {
    throw new Error(`valor inválido: ${String(v)}`);
  }
  return n;
}

/** Dólar comercial (USD/BRL) — AwesomeAPI, atualizado a cada poucos segundos. */
export async function fetchUsdBrl(): Promise<Quote> {
  "use cache";
  cacheLife({ stale: 60, revalidate: 60, expire: 600 });

  const data = (await getJson("https://economia.awesomeapi.com.br/json/last/USD-BRL")) as {
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
  };
}

/** Café Arábica — contrato futuro ICE NY (KC, 1º vencimento), via Yahoo Finance. */
export async function fetchCoffeeIce(): Promise<Quote> {
  "use cache";
  cacheLife({ stale: 60, revalidate: 60, expire: 600 });

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
    note: meta.shortName ? `Contrato ${meta.shortName.replace("Coffee ", "")} · atraso de até 15 min` : "Atraso de até 15 min",
    digits: 2,
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
