import type { HistoryPoint } from "@/lib/market-types";

const W = 100;
const H = 32;
const PAD = 3; // folga vertical para o traço não encostar na borda

/**
 * Caminho suavizado MONÓTONO (Fritsch–Carlson): a curva passa exatamente por
 * cada ponto real e nunca cria picos ou vales que não existem nos dados.
 */
function monotonePath(xs: number[], ys: number[]) {
  const n = xs.length;
  const d: number[] = [];
  for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i] || 1));
  const m = [d[0], ...xs.slice(1, -1).map((_, i) => (d[i] * d[i + 1] <= 0 ? 0 : (d[i] + d[i + 1]) / 2)), d[n - 2]];
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) {
      m[i] = m[i + 1] = 0;
      continue;
    }
    const a = m[i] / d[i];
    const b = m[i + 1] / d[i];
    const s = a * a + b * b;
    if (s > 9) {
      const t = 3 / Math.sqrt(s);
      m[i] = t * a * d[i];
      m[i + 1] = t * b * d[i];
    }
  }
  let path = `M${xs[0].toFixed(2)},${ys[0].toFixed(2)}`;
  for (let i = 0; i < n - 1; i++) {
    const h = (xs[i + 1] - xs[i]) / 3;
    path += `C${(xs[i] + h).toFixed(2)},${(ys[i] + m[i] * h).toFixed(2)} ${(xs[i + 1] - h).toFixed(2)},${(ys[i + 1] - m[i + 1] * h).toFixed(2)} ${xs[i + 1].toFixed(2)},${ys[i + 1].toFixed(2)}`;
  }
  return path;
}

/**
 * Minigráfico de tendência — só dados reais, em ordem cronológica, eixo X em
 * tempo real (sem espaçar pontos artificialmente). Cor pela variação real:
 * verde em alta, vermelho em queda, neutro quando a variação exibida é 0,00%.
 * Oculto quando não há histórico suficiente ou quando a linha contradiria a
 * variação exibida (nunca sugere uma tendência diferente da mostrada).
 */
export function Sparkline({ points, changePct }: { points: HistoryPoint[] | null | undefined; changePct: number | null }) {
  if (!points || points.length < 4 || changePct == null) return null;
  const series = [...points].sort((a, b) => a.t - b.t);

  // mesma regra de arredondamento do percentual exibido (2 casas)
  const shown = Math.round(changePct * 100) / 100;
  const dir = Math.sign(shown);
  const lineDir = Math.sign(series[series.length - 1].v - series[0].v);
  if (dir !== 0 && lineDir !== dir) return null;

  const t0 = series[0].t;
  const tSpan = series[series.length - 1].t - t0 || 1;
  const vs = series.map((p) => p.v);
  const lo = Math.min(...vs);
  const vSpan = Math.max(...vs) - lo || 1;
  const xs = series.map((p) => ((p.t - t0) / tSpan) * W);
  const ys = series.map((p) => PAD + (1 - (p.v - lo) / vSpan) * (H - PAD * 2));

  const color = dir > 0 ? "text-verde" : dir < 0 ? "text-queda" : "text-cafe/45";

  return (
    <svg
      aria-hidden
      data-sparkline={dir > 0 ? "alta" : dir < 0 ? "queda" : "neutro"}
      data-points={series.length}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className={`h-8 w-full overflow-visible ${color}`}
    >
      <path
        d={monotonePath(xs, ys)}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
