import { connection } from "next/server";
import type { HistoryPoint, MarketPayload, Quote } from "@/lib/market-types";
import { fetchCoffeeHistory, fetchCoffeeIce, fetchCoffeeLicensed, fetchUsdBrl, fetchUsdHistory } from "./sources";

/**
 * GET /api/market — dólar comercial e café arábica ICE NY.
 *
 * Roda sempre no servidor (o navegador nunca fala com as fontes). Cada fonte
 * tem cache próprio ("use cache" em sources.ts), mais curto com o mercado
 * aberto e mais longo fechado: o número de chamadas ao fornecedor não cresce
 * com o número de visitantes. O navegador consulta a cada 15 s e a CDN
 * segura no máximo 10 s (+10 s servindo enquanto busca o novo).
 *
 * Café: usa o fornecedor licenciado em tempo real se configurado
 * (COFFEE_PROVIDER=barchart + BARCHART_API_KEY); senão, a fonte gratuita
 * com atraso (Yahoo Finance), rotulada como tal na interface.
 */
export async function GET() {
  // execução por requisição: nunca pré-renderizar no build
  await connection();

  const licensed = process.env.COFFEE_PROVIDER === "barchart" && !!process.env.BARCHART_API_KEY;
  const [usd, ice, usdHist] = await Promise.allSettled([
    fetchUsdBrl(),
    licensed ? fetchCoffeeLicensed() : fetchCoffeeIce(),
    fetchUsdHistory(),
  ]);
  // série do café: do MESMO contrato e a partir da MESMA referência da variação.
  // Com fornecedor licenciado, não mistura a série atrasada do Yahoo com o tempo real.
  const iceQuote = ice.status === "fulfilled" ? ice.value : null;
  const [iceHist] = await Promise.allSettled([
    !licensed && iceQuote?.contract && iceQuote.reference
      ? fetchCoffeeHistory(iceQuote.contract, iceQuote.reference)
      : Promise.reject(new Error("série do café indisponível para esta fonte")),
  ]);

  const quotes: Quote[] = [];
  const unavailable: MarketPayload["unavailable"] = [];

  if (usd.status === "fulfilled") quotes.push(withHistory(usd.value, usdHist));
  else {
    console.error("[market] USD/BRL indisponível:", usd.reason);
    unavailable.push({ id: "usdbrl", label: "Dólar comercial" });
  }

  if (ice.status === "fulfilled") quotes.push(withHistory(ice.value, iceHist));
  else {
    console.error("[market] Café ICE indisponível:", ice.reason);
    unavailable.push({ id: "coffee-ice", label: "Café arábica ICE NY" });
  }

  const body: MarketPayload = { quotes, unavailable, generatedAt: new Date().toISOString() };

  return Response.json(body, {
    status: quotes.length ? 200 : 503,
    headers: {
      "Cache-Control": quotes.length ? "public, max-age=0, s-maxage=10, stale-while-revalidate=10" : "no-store",
    },
  });
}

/**
 * Junta a série (cache de minutos) ao preço (cache de segundos): descarta pontos
 * posteriores ao preço e termina a linha no próprio preço atual — também um
 * ponto real da fonte. Série com falha = sem minigráfico, o preço continua.
 */
function withHistory(quote: Quote, hist: PromiseSettledResult<HistoryPoint[]>): Quote {
  if (hist.status === "rejected") {
    console.error(`[market] série de ${quote.id} indisponível:`, hist.reason);
    return { ...quote, history: null };
  }
  const now = Date.parse(quote.quotedAt);
  const points = hist.value.filter((p) => p.t < now);
  return { ...quote, history: [...points, { t: now, v: quote.value }] };
}
