// Converte as cenas do Google Flow em sequências de quadros WebP para o
// vídeo guiado pelo scroll (canvas). Uso: node scripts/build-sequences.mjs
// Requer ffmpeg com libwebp no PATH.
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import path from "node:path";

const SRC = path.resolve("assets-src/video");
const OUT = path.resolve("public/seq");
const FPS = 12;

/** Capítulos na ordem da narrativa. */
const CHAPTERS = [
  { id: "a1", file: "01-saco-tombando.mp4" }, // o saco tomba
  { id: "a2", file: "02-graos-aproximando.mp4" }, // grãos vêm à câmera
  { id: "a3", file: "extra-revelacao-graos.mp4" }, // grãos se afastam → revela Quem somos
  { id: "b1", file: "04-armazem.mp4" }, // armazém
];

const SIZES = [
  { id: "lg", width: 1280, quality: 72 },
  { id: "sm", width: 800, quality: 64 },
];

rmSync(OUT, { recursive: true, force: true });
const manifest = {};

for (const ch of CHAPTERS) {
  for (const s of SIZES) {
    const dir = path.join(OUT, ch.id, s.id);
    mkdirSync(dir, { recursive: true });
    execFileSync("ffmpeg", [
      "-v", "error", "-y",
      "-i", path.join(SRC, ch.file),
      "-t", "8",
      "-vf", `fps=${FPS},scale=${s.width}:-2:flags=lanczos`,
      "-an",
      "-c:v", "libwebp", "-quality", String(s.quality), "-compression_level", "6",
      path.join(dir, "%03d.webp"),
    ]);
    const files = readdirSync(dir);
    const bytes = files.reduce((n, f) => n + statSync(path.join(dir, f)).size, 0);
    manifest[ch.id] = files.length;
    console.log(`${ch.id}/${s.id}: ${files.length} quadros, ${(bytes / 1048576).toFixed(1)} MB`);
  }
}
console.log("contagem por capítulo:", JSON.stringify(manifest));
