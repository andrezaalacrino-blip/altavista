import { revalidateTag } from "next/cache";
import { connection } from "next/server";
import type { Quote } from "@/lib/market-types";
import { COFFEE_TAG, fetchCoffeeIce, isOpenNow, loadCoffeeIce, resolveCoffeeContract } from "../sources";

/**
 * GET /api/market/health — validação completa do café ICE NY (KC=F).
 * Diagnóstico SOB DEMANDA — não há Cron Job (o plano Hobby da Vercel só aceita
 * agendamentos diários). Pode ser chamada por um agendador externo, se desejado.
 * Compara três camadas com a fonte consultada AGORA, sem cache:
 *   1. fonte    — o Yahoo respondeu com preço, variação e horário válidos?
 *   2. servidor — o cache do Next ("use cache") está com o mesmo negócio?
 *   3. CDN      — o que os navegadores recebem em /api/market está em dia?
 * Se o cache do Next estiver travado, força a renovação (revalidateTag).
 * Nunca altera valores: só diagnostica e, se preciso, descarta cache velho.
 *
 * Protegida por CRON_SECRET: exige "Authorization: Bearer <segredo>".
 */

/** atraso típico do Yahoo (~20 min) + margem: acima disso, a fonte parou */
const MAX_TRADE_AGE_MIN = 45;
/** cache do Next revalida a cada 20 s no pregão: 2 min de diferença = travado */
const MAX_CACHE_LAG_MS = 2 * 60_000;
/** CDN: s-maxage 10 s + stale-while-revalidate 10 s, com folga */
const MAX_CDN_LAG_MS = 60_000;

type Snap = { price: number; changePct: number | null; tradeTime: string };
const snap = (q: Quote): Snap => ({ price: q.value, changePct: q.changePct, tradeTime: q.quotedAt });
const same = (a: Snap, b: Snap) => a.price === b.price && a.changePct === b.changePct && a.tradeTime === b.tradeTime;

export async function GET(req: Request) {
  await connection();

  const secret = process.env.CRON_SECRET;
  const authorized = secret
    ? req.headers.get("authorization") === `Bearer ${secret}`
    : process.env.NODE_ENV !== "production"; // sem segredo, só em desenvolvimento
  if (!authorized) return Response.json({ error: "não autorizado" }, { status: 401 });

  const now = Date.now();
  const open = isOpenNow("America/New_York", [4, 15], [13, 30]);
  const problems: string[] = [];

  // 0. qual contrato específico o KC=F está cotando (preço, variação e série vêm dele)
  const contractR = await Promise.allSettled([resolveCoffeeContract()]).then(([r]) => r);
  const contract = contractR.status === "fulfilled" ? contractR.value : null;
  if (!contract) problems.push("contrato_nao_identificado");
  else if (!contract.matchedGeneric) problems.push("kc_f_sem_contrato_correspondente_usando_maior_volume");

  // 1. fonte, sem cache
  const [freshR, cachedR] = await Promise.allSettled([
    contract ? loadCoffeeIce(contract.symbol, contract.name) : Promise.reject(new Error("sem contrato")),
    fetchCoffeeIce(),
  ]);
  const fresh = freshR.status === "fulfilled" ? snap(freshR.value) : null;
  if (!fresh) problems.push(`fonte_falhou: ${String((freshR as PromiseRejectedResult).reason?.message ?? freshR)}`);
  const freshQ = freshR.status === "fulfilled" ? freshR.value : null;

  const tradeAgeMin = fresh ? Math.round((now - Date.parse(fresh.tradeTime)) / 60_000) : null;
  if (fresh && open && tradeAgeMin! > MAX_TRADE_AGE_MIN) problems.push(`fonte_parada: ultimo_negocio_ha_${tradeAgeMin}_min_com_pregao_aberto`);
  if (fresh && fresh.changePct == null) problems.push("fonte_sem_variacao");

  // 2. cache do servidor (Next "use cache")
  const cached = cachedR.status === "fulfilled" ? snap(cachedR.value) : null;
  let nextCache: "em_dia" | "atrasado_revalidado" | "diferente_dentro_da_janela" | "falhou" = "falhou";
  if (fresh && cached) {
    if (same(fresh, cached)) nextCache = "em_dia";
    else if (Date.parse(fresh.tradeTime) - Date.parse(cached.tradeTime) > MAX_CACHE_LAG_MS) {
      revalidateTag(COFFEE_TAG, { expire: 0 }); // próxima leitura busca na fonte
      nextCache = "atrasado_revalidado";
      problems.push("cache_next_atrasado");
    } else nextCache = "diferente_dentro_da_janela"; // a fonte publicou há segundos
  }

  // 3. o que a CDN/navegador recebe
  let cdn: Record<string, unknown> = { status: "nao_verificado" };
  try {
    const res = await fetch(new URL("/api/market", req.url), { cache: "no-store", signal: AbortSignal.timeout(8000) });
    const body = (await res.json()) as { quotes?: Quote[]; generatedAt?: string };
    const q = body.quotes?.find((x) => x.id === "coffee-ice");
    const served = q ? snap(q) : null;
    const lag = fresh && served ? Date.parse(fresh.tradeTime) - Date.parse(served.tradeTime) : null;
    cdn = {
      status: !served ? "sem_cafe" : lag! > MAX_CDN_LAG_MS ? "atrasada" : "em_dia",
      cacheControl: res.headers.get("cache-control"),
      vercelCache: res.headers.get("x-vercel-cache"),
      age: res.headers.get("age"),
      geradoEm: body.generatedAt,
      servido: served,
    };
    if (cdn.status !== "em_dia") problems.push(`cdn_${cdn.status}`);
  } catch (e) {
    cdn = { status: "falhou", erro: (e as Error).message };
    problems.push("cdn_falhou");
  }

  const report = {
    ok: problems.length === 0,
    verificadoEm: new Date(now).toISOString(),
    contrato: contract ? { ...contract, viaGenerico: "KC=F" } : null,
    pregaoAberto: open,
    fonte: fresh,
    variacao: freshQ
      ? {
          referencia: freshQ.reference, // ajuste da sessão anterior do mesmo contrato
          calculada: freshQ.changePct, // último ÷ ajuste anterior − 1
          informadaPeloYahoo: freshQ.sourceChangePct, // muda de referência após o ajuste do dia
        }
      : null,
    atrasoDoUltimoNegocioMin: tradeAgeMin,
    cacheNext: { status: nextCache, valor: cached },
    cdn,
    problemas: problems,
  };
  // uma linha por execução nos logs da Vercel (sem segredos)
  console.log("[market-health]", JSON.stringify({ ok: report.ok, pregaoAberto: open, atrasoMin: tradeAgeMin, cacheNext: nextCache, cdn: cdn.status, problemas: problems }));

  return Response.json(report, { status: report.ok ? 200 : 503, headers: { "Cache-Control": "no-store" } });
}
