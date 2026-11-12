import { connection } from "next/server";
import type { MarketPayload, Quote } from "@/lib/market-types";
import { deriveCoffeeBrl, fetchCoffeeIce, fetchUsdBrl } from "./sources";

/**
 * GET /api/market
 * Roda sempre no servidor: o navegador nunca fala com as fontes.
 * As fontes são cacheadas por 60 s ("use cache" em sources.ts) e a
 * resposta ganha Cache-Control para a CDN da Vercel absorver o tráfego.
 */
export async function GET() {
  // força execução no momento da requisição (nunca pré-renderizar no build,
  // senão um erro de rede no deploy viraria resposta estática)
  await connection();

  const [usd, ice] = await Promise.allSettled([fetchUsdBrl(), fetchCoffeeIce()]);

  const quotes: Quote[] = [];
  const unavailable: MarketPayload["unavailable"] = [];

  if (usd.status === "fulfilled") quotes.push(usd.value);
  else {
    console.error("[market] USD/BRL indisponível:", usd.reason);
    unavailable.push({ id: "usdbrl", label: "Dólar comercial" });
  }

  if (ice.status === "fulfilled") quotes.push(ice.value);
  else {
    console.error("[market] Café ICE indisponível:", ice.reason);
    unavailable.push({ id: "coffee-ice", label: "Café Arábica · ICE NY" });
  }

  if (usd.status === "fulfilled" && ice.status === "fulfilled") {
    quotes.push(deriveCoffeeBrl(ice.value, usd.value));
  } else {
    unavailable.push({ id: "coffee-brl", label: "Café Arábica em reais" });
  }

  const body: MarketPayload = { quotes, unavailable, generatedAt: new Date().toISOString() };

  return Response.json(body, {
    status: quotes.length ? 200 : 503,
    headers: {
      "Cache-Control": quotes.length
        ? "public, s-maxage=60, stale-while-revalidate=120"
        : "no-store",
    },
  });
}
