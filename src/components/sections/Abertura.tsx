import Image from "next/image";
import lavoura from "@/assets/photos/lavoura.webp";
import { facts, hero, waMessages } from "@/content/home";
import { whatsappLink } from "@/lib/site";
import { Bean } from "../Bean";
import { NegocieButton } from "../form/FormDialog";
import { QuotesPanel } from "../market/QuotesPanel";
import { WhatsAppIcon } from "../WhatsAppIcon";

const d = (s: number) => ({ "--d": `${s}s` }) as React.CSSProperties;

/**
 * Abertura — a lavoura ocupa toda a seção como fundo (cover), sob um véu gelo
 * que garante a leitura. Título e texto à esquerda; painel de cotações em
 * vidro claro à direita. Os grãos ficam presos aos cantos do painel, ATRÁS
 * dele: aparecem com profundidade, mas nunca sobre textos ou valores.
 */
export function Abertura() {
  return (
    <section id="inicio" aria-labelledby="hero-title" className="relative isolate overflow-hidden bg-gelo pt-(--header-h)">
      {/* fundo: fotografia em toda a largura e altura da abertura */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <Image src={lavoura} alt="" fill preload sizes="100vw" className="object-cover object-[center_60%]" />
        {/* véu gelo ~50% + reforço à esquerda/embaixo, onde está o texto */}
        <div className="absolute inset-0 bg-gelo/50" />
        <div className="absolute inset-0 bg-gradient-to-b from-gelo/55 via-gelo/10 to-gelo/60 lg:bg-gradient-to-r lg:from-gelo/75 lg:via-gelo/25 lg:to-transparent" />
      </div>

      {/* abaixo de 1024 px: coluna única em flex; o bloco de texto vira "contents" para
          que os botões (order-last) desçam para baixo do painel sem duplicar elementos.
          A partir de 1024 px: a grade de duas colunas de sempre. */}
      <div className="mx-auto flex max-w-[1320px] flex-col px-5 pb-16 pt-10 md:px-8 md:pt-14 lg:grid lg:min-h-[620px] lg:grid-cols-12 lg:items-center lg:gap-10 lg:py-16">
        {/* texto */}
        <div className="max-lg:contents lg:col-span-6">
          <p className="kicker rise" style={d(0.05)}>
            {hero.context}
          </p>
          <h1 id="hero-title" className="title rise mt-4 max-w-[16ch] text-h1 text-balance" style={d(0.12)}>
            {hero.title}
          </h1>
          <p className="rise mt-5 max-w-[44ch] text-pretty text-lead font-medium text-cafe/90" style={d(0.2)}>
            {hero.lead}
          </p>
          {/* celular: abaixo do painel, empilhados, na largura do painel (20 px de respiro);
              desktop: lado a lado sob o texto, como antes */}
          <div
            className="rise relative z-20 mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap max-lg:order-last max-lg:mx-auto max-lg:mt-5 max-lg:w-full max-lg:max-w-[520px] sm:max-lg:*:flex-1"
            style={d(0.28)}
          >
            <a
              href={whatsappLink(waMessages.vender)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full bg-marrom-letra px-7 py-3.5 text-base font-semibold text-gelo shadow-[0_10px_24px_-12px_rgba(108,48,24,0.7)] transition-colors hover:bg-marrom"
            >
              <WhatsAppIcon className="size-5" />
              Venda seu café
            </a>
            <NegocieButton className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-full border-[1.5px] border-marrom-letra bg-gelo/60 px-7 py-3 text-base font-semibold text-marrom-letra backdrop-blur-sm transition-colors hover:bg-marrom-letra hover:text-gelo" />
          </div>
        </div>

        {/* cotações, com grãos atrás dos cantos do painel */}
        <div className="rise relative mx-auto w-full max-w-[520px] max-lg:mt-14 sm:max-lg:mt-16 lg:col-span-6 lg:mr-0" style={d(0.18)}>
          <Bean n={1} depth="mid" rotate={22} float floatDuration={9} parallax={0.08} className="-left-5 -top-9 z-0 w-14 sm:-left-10 sm:w-20" />
          {/* celular: no canto superior direito, para não ficar atrás dos botões logo abaixo do painel */}
          <Bean n={3} depth="near" rotate={-18} float floatDuration={10} floatDelay={1.4} className="-right-4 z-0 w-14 max-lg:-top-7 sm:-right-10 sm:w-20 lg:-bottom-8" />
          <Bean n={4} depth="far" rotate={12} float floatDuration={12} floatDelay={0.6} className="-right-14 top-[18%] z-0 w-8 max-lg:hidden" />
          <Bean n={2} depth="far" rotate={-30} float floatDuration={11} floatDelay={2} className="-left-16 bottom-[22%] z-0 w-9 max-lg:hidden" />
          <div className="relative z-10">
            <QuotesPanel />
          </div>
        </div>
      </div>

      {/* faixa de três fatos do material institucional */}
      <div className="border-t border-cafe/10 bg-gelo">
        <ul className="mx-auto grid max-w-[1320px] gap-6 px-5 py-8 sm:grid-cols-3 md:px-8">
          {facts.map((f) => (
            <li key={f.title} className="flex gap-3">
              <span aria-hidden className="mt-2.5 size-2 shrink-0 rounded-full bg-amarelo" />
              <p>
                <strong className="block font-semibold">{f.title}</strong>
                <span className="text-[0.9375rem] text-cafe/75">{f.text}</span>
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
