import Image from "next/image";
import armazem from "@/assets/photos/armazem.webp";
import { diferencial, principles } from "@/content/home";
import { Bean } from "../Bean";

/**
 * Diferencial — a foto do armazém (onde acontece a conferência) ao lado do
 * texto oficial; os três diferenciais em linha, sem cards.
 */
export function Diferencial() {
  return (
    <section id="diferencial" aria-labelledby="diferencial-title" className="relative bg-gelo">
      <div className="mx-auto grid max-w-[1320px] gap-10 px-5 py-16 md:px-8 lg:grid-cols-12 lg:items-center lg:gap-12 lg:py-24">
        <figure className="relative lg:col-span-6">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[6px] shadow-[0_30px_60px_-30px_rgba(42,27,19,0.4)]">
            <Image
              src={armazem}
              alt="Armazém com sacas de café empilhadas em paletes"
              fill
              sizes="(max-width: 1023px) 92vw, 600px"
              className="object-cover"
            />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-gelo/35 via-transparent to-transparent" />
          </div>
          <figcaption className="mt-3 text-sm text-cafe/70">A conferência acontece onde está seu café.</figcaption>
          <Bean n={3} depth="near" rotate={14} float floatDuration={8} parallax={0.08} className="-bottom-5 -right-4 w-14 md:w-16" />
        </figure>

        <div className="lg:col-span-6">
          <p className="kicker">{diferencial.kicker}</p>
          <h2 id="diferencial-title" className="title mt-3 max-w-[18ch] text-h2 text-balance">
            {diferencial.title}
          </h2>
          <p className="mt-5 max-w-[48ch] text-pretty text-cafe/80">{diferencial.text}</p>

          <ul className="mt-9 grid gap-6 border-t border-cafe/10 pt-7 sm:grid-cols-3 sm:gap-5">
            {principles.map((p) => (
              <li key={p.title}>
                <h3 className="font-semibold text-marrom-letra">{p.title}</h3>
                <p className="mt-1 text-[0.9375rem] leading-relaxed text-cafe/75">{p.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
