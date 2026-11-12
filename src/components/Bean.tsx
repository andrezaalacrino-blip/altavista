import Image, { type StaticImageData } from "next/image";
import b1 from "@/assets/brand/bean-01.png";
import b2 from "@/assets/brand/bean-02.png";
import b3 from "@/assets/brand/bean-03.png";
import b4 from "@/assets/brand/bean-04.png";
import b5 from "@/assets/brand/bean-05.png";

/** Grãos reais recortados da foto oficial (fundo transparente). */
const SOURCES: Record<number, StaticImageData> = { 1: b1, 2: b2, 3: b3, 4: b4, 5: b5 };

type Depth = "near" | "mid" | "far";

const DEPTH: Record<Depth, string> = {
  // perto: nítido, sombra mais marcada
  near: "drop-shadow-[0_14px_14px_rgba(42,27,19,0.28)]",
  // meio: sombra suave
  mid: "drop-shadow-[0_8px_10px_rgba(42,27,19,0.22)]",
  // fundo: leve desfoque e menos contraste — dá profundidade sem chamar atenção
  far: "blur-[1.5px] opacity-80 drop-shadow-[0_4px_6px_rgba(42,27,19,0.15)]",
};

/**
 * Grão decorativo. Posição e tamanho vêm de `className` (absolute + left/top + w-*).
 * `float` liga a flutuação lenta; `parallax` (ex.: 0.15) desloca com o scroll.
 * Sempre decorativo: aria-hidden e alt vazio.
 */
export function Bean({
  n = 1,
  depth = "mid",
  rotate = 0,
  float = false,
  parallax,
  className = "",
  floatDuration = 7,
  floatDelay = 0,
}: {
  n?: 1 | 2 | 3 | 4 | 5;
  depth?: Depth;
  rotate?: number;
  float?: boolean;
  parallax?: number;
  className?: string;
  floatDuration?: number;
  floatDelay?: number;
}) {
  return (
    <span
      aria-hidden
      data-bean-parallax={parallax}
      className={`pointer-events-none absolute block select-none ${className}`}
    >
      <span
        className={`block ${float ? "bean-float" : ""}`}
        style={
          {
            "--r": `${rotate}deg`,
            "--fd": `${floatDuration}s`,
            "--fdelay": `${floatDelay}s`,
            transform: float ? undefined : `rotate(${rotate}deg)`,
          } as React.CSSProperties
        }
      >
        <Image src={SOURCES[n]} alt="" sizes="160px" className={`h-auto w-full ${DEPTH[depth]}`} />
      </span>
    </span>
  );
}
