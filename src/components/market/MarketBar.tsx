"use client";

import { useMarket } from "./MarketProvider";
import type { Quote } from "@/lib/market-types";
import { formatDateTime, formatNumber, formatPct } from "@/lib/format";

/** Só os dois indicadores pedidos: dólar comercial e café arábica (ICE NY). */
const SHOWN: Record<string, { label: string; short: string; source: string }> = {
  usdbrl: { label: "Dólar comercial", short: "Dólar comercial", source: "AwesomeAPI" },
  "coffee-ice": { label: "Café arábica ICE NY", short: "Café arábica ICE", source: "ICE via Yahoo Finance" },
};

/**
 * Mesmo padrão no desktop e no celular: rótulo · valor · variação · fonte/hora.
 * Desktop: tudo numa linha. Celular: cada indicador em duas linhas
 * (rótulo + hora em cima, valor + variação embaixo), lado a lado.
 */
function Item({ quote }: { quote: Quote }) {
  const meta = SHOWN[quote.id];
  const up = (quote.changePct ?? 0) >= 0;
  const [, hora] = formatDateTime(quote.quotedAt).split(", ");
  return (
    <li className="min-w-0 md:flex md:shrink-0 md:items-baseline md:gap-2 md:whitespace-nowrap">
      <span className="flex items-baseline justify-between gap-2 text-[0.8125rem] text-cafe/75">
        <span className="truncate md:hidden">{meta.short}</span>
        <span className="hidden md:inline">{meta.label}</span>
        <time dateTime={quote.quotedAt} className="tabular shrink-0 md:hidden">
          {hora}
        </time>
      </span>
      <span className="flex items-baseline gap-2 md:contents">
        <span className="tabular text-[0.9375rem] font-semibold text-cafe md:text-[0.8125rem]">
          {quote.unit === "R$" ? `R$ ${formatNumber(quote.value, 4)}` : `${formatNumber(quote.value, 2)} US¢/lb`}
        </span>
        {quote.changePct != null && (
          <span className={`tabular text-[0.8125rem] font-medium ${up ? "text-verde" : "text-queda"}`}>
            <span className="sr-only">variação no dia </span>
            {formatPct(quote.changePct)}
          </span>
        )}
      </span>
      <span className="hidden text-[0.8125rem] text-cafe/75 lg:inline">
        <span className="sr-only">fonte </span>
        {meta.source} · {formatDateTime(quote.quotedAt)}
      </span>
    </li>
  );
}

/** Faixa branca no topo com as cotações reais. */
export function MarketBar() {
  const market = useMarket();
  const quotes = market.data?.quotes.filter((q) => q.id in SHOWN) ?? [];

  return (
    <aside
      aria-label="Cotações de referência"
      className="fixed inset-x-0 top-0 z-50 h-(--bar-h) border-b border-cafe/10 bg-white text-[0.8125rem]"
    >
      <div className="mx-auto flex h-full max-w-[1320px] items-center gap-6 px-5 md:px-8">
        <span className="hidden shrink-0 items-center gap-2 font-semibold text-marrom-letra md:flex">
          <span aria-hidden className="relative flex size-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-verde/50" />
            <span className="relative size-2 rounded-full bg-verde" />
          </span>
          Cotações
        </span>
        {market.status === "loading" && (
          <span className="text-cafe/75" aria-busy="true">
            Carregando cotações
          </span>
        )}
        {market.status === "error" && <span className="text-cafe/75">Cotações indisponíveis no momento</span>}
        {market.status === "ready" && (
          <ul className="grid w-full grid-cols-2 gap-x-6 md:flex md:w-auto md:items-center md:gap-8">
            {quotes.map((q) => (
              <Item key={q.id} quote={q} />
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
