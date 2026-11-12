"use client";

import { useEffect, useState } from "react";
import type { Quote } from "@/lib/market-types";
import { getQuoteStatus, type QuoteStatus } from "@/lib/market-status";

/**
 * O status depende do "agora" do visitante; calculamos só após montar
 * (evita divergência de hidratação) e recalculamos a cada 30 s.
 */
export function useQuoteStatus(quote: Quote | undefined): QuoteStatus | null {
  const [status, setStatus] = useState<QuoteStatus | null>(null);
  useEffect(() => {
    if (!quote) return;
    const update = () => setStatus(getQuoteStatus(quote, new Date()));
    update();
    const t = setInterval(update, 30_000);
    return () => clearInterval(t);
  }, [quote]);
  return status;
}

export function LiveDot({ status }: { status: QuoteStatus | null }) {
  if (status !== "live") {
    return <span aria-hidden className="inline-block size-1.5 rounded-full bg-creme/30" />;
  }
  return (
    <span aria-hidden className="relative inline-flex size-1.5">
      <span className="absolute inset-0 animate-ping rounded-full bg-lavoura/70" />
      <span className="relative inline-block size-1.5 rounded-full bg-lavoura" />
    </span>
  );
}

export function statusLabel(status: QuoteStatus | null) {
  if (status === "live") return "Ao vivo";
  if (status === "delayed") return "Com atraso";
  if (status === "closed") return "Fechamento";
  return "";
}
