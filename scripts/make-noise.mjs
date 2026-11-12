// Gera a textura de grão (PNG pequeno e repetível) — substitui o SVG com
// feTurbulence, caro de rasterizar. Uso: node scripts/make-noise.mjs
import sharp from "sharp";

const size = 128;
const buf = Buffer.alloc(size * size * 2);
let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
for (let i = 0; i < size * size; i++) {
  buf[i * 2] = Math.round(rand() * 255); // luminância
  buf[i * 2 + 1] = 255; // alfa
}
await sharp(buf, { raw: { width: size, height: size, channels: 2 } })
  .png({ compressionLevel: 9 })
  .toFile("public/noise.png");
console.log("public/noise.png");
