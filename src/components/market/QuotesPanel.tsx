"use client";

import { useEffect, useRef, useState } from "react";
import { useMarket } from "./MarketProvider";
import type { Quote, QuoteId } from "@/lib/market-types";
import { formatDateTime, formatNumber, formatPct, formatTime } from "@/lib/format";

const ROWS: { id: QuoteId; label: string; pair: string }[] = [
  { id: "usdbrl", label: "Dólar comercial", pair: "USD/BRL" },
  { id: "coffee-ice", label: "Café arábica", pair: "ICE NY" },
];

function Indicator({ quote, label, pair, failing }: { quote: Quote; label: string; pair: string; failing: boolean }) {
  const up = (quote.changePct ?? 0) >= 0;

  // brilho discreto quando a fonte publica um valor novo
  const prev = useRef(quote.value);
  const [flash, setFlash] = useState(false);
  useEffect(() => {
    if (prev.current === quote.value) return;
    prev.current = quote.value;
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 1600);
    return () => clearTimeout(t);
  }, [quote.value]);

  // Situação curta. O horário do PREÇO (quotedAt, vindo da fonte) só aparece
  // quando importa: mercado fechado ou falha de conexão — aí o visitante precisa
  // saber de quando é o último valor. Nunca é trocado pelo horário da consulta.
  // O café nunca é rotulado como tempo real se o fornecedor entrega com atraso.
  const delayed = quote.id === "coffee-ice" && !quote.realtime;
  const closed = quote.marketOpen === false;
  const status = closed ? "Mercado fechado" : "Mercado aberto";
  const showPriceTime = closed || failing;

  return (
    <div className={`rounded-[12px] px-1 py-4 transition-colors duration-700 sm:px-2 ${flash ? "bg-amarelo/15" : "bg-transparent"}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="font-semibold leading-tight text-cafe">
          {label}
          <span className="block text-sm font-medium text-cafe/80 sm:ml-1.5 sm:inline sm:text-base">{pair}</span>
        </p>
        {quote.changePct != null && (
          <span
            className={`tabular inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-semibold ${
              up ? "bg-verde/12 text-verde" : "bg-queda/12 text-queda"
            }`}
          >
            <svg aria-hidden viewBox="0 0 10 10" className={`size-2.5 ${up ? "" : "rotate-180"}`}>
              <path d="M5 1.5 9 8H1z" fill="currentColor" />
            </svg>
            <span className="sr-only">{up ? "alta de" : "queda de"} </span>
            {formatPct(quote.changePct)}
          </span>
        )}
      </div>

      <p className="mt-1.5 flex items-baseline gap-2">
        {quote.unit === "R$" && <span className="text-lg font-semibold text-cafe/85">R$</span>}
        <span className="tabular text-[clamp(2rem,1.6rem+1.6vw,2.6rem)] font-semibold leading-none tracking-tight text-cafe">
          {formatNumber(quote.value, quote.id === "usdbrl" ? 4 : 2)}
        </span>
        {/* US¢/lb = centavos de dólar por libra-peso (não dólares) */}
        {quote.unit !== "R$" && (
          <abbr title="centavos de dólar por libra-peso" className="text-base font-semibold text-cafe/85 no-underline">
            {quote.unit}
          </abbr>
        )}
      </p>

      <p
        className="mt-2.5 flex flex-wrap items-center gap-x-1.5 text-sm font-medium text-cafe/90"
        data-quoted-at={quote.quotedAt}
        data-source={quote.source}
      >
        <span aria-hidden className={`size-1.5 rounded-full ${closed ? "bg-cafe/45" : "bg-verde"}`} />
        {status}
        {showPriceTime && (
          <span>
            · último preço <time dateTime={quote.quotedAt}>{formatDateTime(quote.quotedAt)}</time>
          </span>
        )}
        {delayed && <span className="font-semibold text-marrom-letra">· Dados com atraso</span>}
      </p>
    </div>
  );
}

/**
 * Painel de cotações do hero — vidro gelo/bege acinzentado sobre a lavoura.
 * Dados reais via /api/market, consultados a cada 15 s sem recarregar a página.
 */
export function QuotesPanel() {
  const market = useMarket();

  return (
    <section
      aria-label="Cotações de referência"
      aria-live="polite"
      aria-busy={market.status === "loading"}
      className="rounded-[20px] border border-white/55 bg-[#e8e2d6]/80 p-5 shadow-[0_30px_70px_-30px_rgba(42,27,19,0.5),inset_0_1px_0_rgba(255,255,255,0.7)] ring-1 ring-cafe/10 backdrop-blur-xl backdrop-saturate-125 sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-cafe/15 pb-3">
        <p className="kicker whitespace-nowrap">Cotações de referência</p>
        {/* horário da CONSULTA ao nosso servidor — não é o horário do preço */}
        <p className="flex items-center gap-2 whitespace-nowrap text-sm font-medium text-cafe/90">
          <span aria-hidden className="relative flex size-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-verde/50" />
            <span className="relative size-2 rounded-full bg-verde" />
          </span>
          {market.status === "ready" ? (
            <span>
              Consultado às <time dateTime={market.data.generatedAt}>{formatTime(market.data.generatedAt)}</time>
            </span>
          ) : (
            "Atualização automática"
          )}
        </p>
      </div>

      <div className="divide-y divide-cafe/15">
        {ROWS.map(({ id, label, pair }) => {
          const quote = market.data?.quotes.find((q) => q.id === id);
          if (quote) return <Indicator key={id} quote={quote} label={label} pair={pair} failing={!!market.error} />;
          return (
            <div key={id} className="px-1 py-4 sm:px-2">
              <p className="font-semibold leading-tight text-cafe">
                {label}
                <span className="block text-sm font-medium text-cafe/80 sm:ml-1.5 sm:inline sm:text-base">{pair}</span>
              </p>
              {market.status === "loading" ? (
                <>
                  <span className="sr-only">Carregando</span>
                  <span className="mt-3 block h-9 w-44 animate-pulse rounded-md bg-cafe/10" />
                  <span className="mt-3 block h-3 w-56 animate-pulse rounded bg-cafe/10" />
                </>
              ) : (
                <p className="mt-2 text-sm font-medium text-cafe/90">
                  Indisponível no momento. Nenhum valor é estimado no lugar; nova tentativa em instantes.
                </p>
              )}
            </div>
          );
        })}
      </div>

      {market.error && (
        <p role="status" className="border-t border-cafe/15 pt-3 text-[0.8125rem] font-semibold text-queda">
          Sem conexão com as fontes. Exibindo os últimos preços recebidos, com o horário de cada um.
        </p>
      )}
    </section>
  );
}
