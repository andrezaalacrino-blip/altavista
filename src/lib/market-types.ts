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
  /**
   * Mercado aberto agora, segundo o horário oficial de negociação do ativo
   * (calculado no servidor). null = não determinável.
   */
  marketOpen?: boolean | null;
  /** Atraso típico da fonte em minutos (dados não-licenciados), quando conhecido. */
  sourceDelayMin?: number | null;
  /** true quando a fonte é um fornecedor licenciado em tempo real. */
  realtime?: boolean;
  /**
   * Série histórica REAL da sessão, em ordem cronológica (t = epoch ms, v = valor
   * da fonte). Só pontos publicados pelo fornecedor, nunca interpolados.
   * null/ausente = histórico indisponível → o minigráfico fica oculto.
   */
  history?: HistoryPoint[] | null;
  /** Contrato específico cotado (ex.: KCH27.NYB) — preço, variação e série são dele. */
  contract?: string;
  /** Referência da variação: ajuste da sessão anterior do mesmo contrato. */
  reference?: HistoryPoint | null;
  /** Diagnóstico: variação como o fornecedor informa (pode mudar de referência). */
  sourceChangePct?: number | null;
};

export type HistoryPoint = { t: number; v: number };

export type MarketPayload = {
  quotes: Quote[];
  /** Fontes que falharam nesta atualização (sem número inventado no lugar). */
  unavailable: { id: QuoteId; label: string }[];
  /** Quando o servidor montou esta resposta (ISO 8601). */
  generatedAt: string;
};
