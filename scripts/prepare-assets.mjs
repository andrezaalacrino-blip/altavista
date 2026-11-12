// Prepara os assets da marca a partir de /assets-src.
// - separa cada grão do arquivo de grãos em um PNG próprio (camadas de parallax)
// - recorta o símbolo e o lettering do logo (versão original + versão creme para fundo escuro)
// - remove a margem transparente do saco
// Uso: node scripts/prepare-assets.mjs
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const SRC = path.resolve("assets-src");
const OUT = path.resolve("src/assets/brand");
const CREME = { r: 244, g: 236, b: 223 };

await mkdir(OUT, { recursive: true });

/** Rótulo de componentes conectados sobre o canal alfa. */
async function components(file, alphaMin = 24) {
  const { data, info } = await sharp(file)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const labels = new Int32Array(w * h).fill(-1);
  const comps = [];
  const stack = [];
  for (let i = 0; i < w * h; i++) {
    if (labels[i] !== -1 || data[i * 4 + 3] < alphaMin) continue;
    const id = comps.length;
    const c = { id, x0: w, y0: h, x1: 0, y1: 0, area: 0 };
    labels[i] = id;
    stack.push(i);
    while (stack.length) {
      const p = stack.pop();
      const x = p % w;
      const y = (p / w) | 0;
      c.area++;
      if (x < c.x0) c.x0 = x;
      if (y < c.y0) c.y0 = y;
      if (x > c.x1) c.x1 = x;
      if (y > c.y1) c.y1 = y;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const n = ny * w + nx;
        if (labels[n] === -1 && data[n * 4 + 3] >= alphaMin) {
          labels[n] = id;
          stack.push(n);
        }
      }
    }
    comps.push(c);
  }
  return { comps, labels, data, width: w, height: h };
}

const union = (list) => ({
  x0: Math.min(...list.map((c) => c.x0)),
  y0: Math.min(...list.map((c) => c.y0)),
  x1: Math.max(...list.map((c) => c.x1)),
  y1: Math.max(...list.map((c) => c.y1)),
});

function region(b, pad, w, h) {
  const left = Math.max(0, b.x0 - pad);
  const top = Math.max(0, b.y0 - pad);
  return {
    left,
    top,
    width: Math.min(w, b.x1 + pad + 1) - left,
    height: Math.min(h, b.y1 + pad + 1) - top,
  };
}

/** Recolore preservando o alfa (versão negativa do lettering). */
async function tint(input, { r, g, b }) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }
  return sharp(data, { raw: info }).png();
}

// ---------- Grãos ----------
{
  const file = path.join(SRC, "beans.png");
  const { comps, labels, data, width, height } = await components(file);
  const beans = comps.filter((c) => c.area > 150).sort((a, b) => b.area - a.area);
  let i = 0;
  for (const c of beans) {
    const name = `bean-${String(++i).padStart(2, "0")}.png`;
    const r = region(c, 6, width, height);
    // copia só os pixels deste componente (vizinhos dentro do bbox ficam transparentes)
    const out = Buffer.alloc(r.width * r.height * 4);
    for (let y = 0; y < r.height; y++) {
      for (let x = 0; x < r.width; x++) {
        const src = (r.top + y) * width + (r.left + x);
        const dst = (y * r.width + x) * 4;
        data.copy(out, dst, src * 4, src * 4 + 4);
        // mantém a borda antialias (alfa baixo) que encosta no componente
        if (labels[src] !== c.id && labels[src] !== -1) out[dst + 3] = 0;
      }
    }
    await sharp(out, { raw: { width: r.width, height: r.height, channels: 4 } })
      .png({ compressionLevel: 9 })
      .toFile(path.join(OUT, name));
    console.log(name, `${r.width}x${r.height}`);
  }
}

// ---------- Logo ----------
{
  const file = path.join(SRC, "logo.png");
  const { comps, width, height } = await components(file, 40);
  const real = comps.filter((c) => c.area > 80);
  // símbolo = maior componente à esquerda; lettering = componentes à direita dele
  const symbol = real.reduce((a, b) => (b.area > a.area ? b : a));
  const symbolParts = real.filter((c) => c.x1 <= symbol.x1 + 4);
  const textParts = real.filter(
    (c) => c.x0 > symbol.x1 + 4 && c.y0 < symbol.y1 && c.y1 > symbol.y0,
  );
  const sym = union(symbolParts);
  const txt = union(textParts);
  const full = union([sym, txt]);

  await sharp(file).extract(region(sym, 4, width, height)).png().toFile(path.join(OUT, "symbol.png"));
  await sharp(file).extract(region(txt, 4, width, height)).png().toFile(path.join(OUT, "wordmark.png"));
  await sharp(file).extract(region(full, 4, width, height)).png().toFile(path.join(OUT, "logo.png"));
  const wordBuf = await sharp(file).extract(region(txt, 4, width, height)).png().toBuffer();
  await (await tint(wordBuf, CREME)).toFile(path.join(OUT, "wordmark-creme.png"));

  // ícone do site a partir do símbolo
  await sharp(file)
    .extract(region(sym, 4, width, height))
    .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.resolve("src/app/icon.png"));
  console.log("logo ok", { sym, txt });
}

// ---------- Saco ----------
{
  await sharp(path.join(SRC, "bag.webp"))
    .trim({ threshold: 1 })
    .webp({ quality: 92, alphaQuality: 100 })
    .toFile(path.join(OUT, "bag.webp"));
  const m = await sharp(path.join(OUT, "bag.webp")).metadata();
  console.log("bag.webp", `${m.width}x${m.height}`, "alpha:", m.hasAlpha);
}
