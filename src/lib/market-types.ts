/** Tipos compartilhados entre a rota /api/market e a interface. */

export type QuoteId = "usdbrl" | "coffee-ice" | "coffee-brl";

export type Quote = {
  id: QuoteId;
  label: string;
  /** Valor numérico como veio da fonte (ou calculado, se `derived`). */
  value: number;
  unit: string;
  /** Variação percentual do dia, quando a fonte informa. */
  changePct: number | null;
  source: string;
  sourceUrl: string;
  /** Momento da cotação segundo a própria fonte (ISO 8601). */
  quotedAt: string;
  /** Aviso de atraso/natureza do dado exibido junto ao valor. */
  note: string;
  /** true quando o valor é uma conversão calculada a partir de outras cotações. */
  derived?: boolean;
  /** Casas decimais de exibição. */
  digits: number;
};

export type MarketPayload = {
  quotes: Quote[];
  /** Fontes que falharam nesta atualização (sem número inventado no lugar). */
  unavailable: { id: QuoteId; label: string }[];
  /** Quando o servidor montou esta resposta (ISO 8601). */
  generatedAt: string;
};
