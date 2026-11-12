import type { Quote } from "./market-types";

/**
 * Como a interface apresenta uma cotação, conforme a idade dela.
 * - "live":    recente — ponto verde "Ao vivo"
 * - "delayed": válida, mas com atraso perceptível
 * - "closed":  último fechamento (fim de semana, feriado, fora do pregão)
 */
export type QuoteStatus = "live" | "delayed" | "closed";

const MIN = 60_000;

/** Idade máxima para "ao vivo" e para "com atraso", por indicador. */
const LIMITS: Record<Quote["id"], { live: number; delayed: number }> = {
  // dólar comercial atualiza a cada poucos segundos em dia útil
  usdbrl: { live: 10 * MIN, delayed: 60 * MIN },
  // ICE NY já chega com ~15 min de atraso pela fonte gratuita
  "coffee-ice": { live: 30 * MIN, delayed: 90 * MIN },
  // derivado: herda o quotedAt mais antigo entre os dois
  "coffee-brl": { live: 30 * MIN, delayed: 90 * MIN },
};

/**
 * Regra por idade: mais honesta do que tentar adivinhar calendários de
 * pregão e feriados. Uma cotação velha nunca aparece como "ao vivo".
 * (Ajustável: altere LIMITS se a Alta Vista preferir outros limites.)
 */
export function getQuoteStatus(quote: Quote, now: Date): QuoteStatus {
  const age = now.getTime() - new Date(quote.quotedAt).getTime();
  const limit = LIMITS[quote.id];
  if (age <= limit.live) return "live";
  if (age <= limit.delayed) return "delayed";
  return "closed";
}
