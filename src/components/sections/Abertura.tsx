import Image from "next/image";
import bag from "@/assets/brand/bag-cut.webp";
import lavoura from "@/assets/photos/lavoura.webp";
import { facts, hero, waMessages } from "@/content/home";
import { whatsappLink } from "@/lib/site";
import { Bean } from "../Bean";
import { WhatsAppIcon } from "../WhatsAppIcon";

const d = (s: number) => ({ "--d": `${s}s` }) as React.CSSProperties;

/**
 * Abertura — clara, equilibrada, sem tela cheia. Texto à esquerda; à
 * direita a lavoura emoldurada, o big bag oficial pousado na borda da foto
 * (nunca sobre o texto) e poucos grãos reais com profundidade.
 */
export function Abertura() {
  return (
    <section id="inicio" aria-labelledby="hero-title" className="relative overflow-hidden bg-gelo pt-[calc(var(--bar-h)+var(--header-h))]">
      <div className="mx-auto grid max-w-[1320px] gap-12 px-5 pb-14 pt-10 md:px-8 lg:grid-cols-12 lg:items-center lg:gap-8 lg:pb-16 lg:pt-14">
        {/* texto */}
        <div className="lg:col-span-6 lg:pr-6">
          <p className="kicker rise" style={d(0.05)}>
            {hero.context}
          </p>
          <h1 id="hero-title" className="title rise mt-4 max-w-[16ch] text-h1 text-balance" style={d(0.12)}>
            {hero.title}
          </h1>
          <p className="rise mt-5 max-w-[44ch] text-pretty text-lead text-cafe/80" style={d(0.2)}>
            {hero.lead}
          </p>
          <div className="rise mt-8 flex flex-col gap-3 sm:flex-row" style={d(0.28)}>
            <a
              href={whatsappLink(waMessages.vender)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full bg-marrom-letra px-7 py-3.5 text-base font-semibold text-gelo shadow-[0_10px_24px_-12px_rgba(108,48,24,0.7)] transition-colors hover:bg-marrom"
            >
              <WhatsAppIcon className="size-5" />
              Venda seu café
            </a>
            <a
              href={whatsappLink(waMessages.materia)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center rounded-full border-[1.5px] border-marrom-letra/70 px-7 py-3 text-base font-semibold text-marrom-letra transition-colors hover:border-marrom-letra hover:bg-marrom-letra hover:text-gelo"
            >
              Negocie sua matéria-prima
            </a>
          </div>
        </div>

        {/* cena: lavoura + big bag + grãos */}
        <div className="rise relative mx-auto aspect-[10/9] w-full max-w-[560px] sm:aspect-[5/4] lg:col-span-6 lg:max-w-none" style={d(0.18)}>
          <figure className="absolute right-0 top-0 h-[84%] w-[86%] overflow-hidden rounded-[6px] shadow-[0_30px_60px_-30px_rgba(42,27,19,0.45)]">
            <Image
              src={lavoura}
              alt="Lavoura de café em curvas de nível, ao pôr do sol"
              fill
              preload
              sizes="(max-width: 1023px) 86vw, 560px"
              className="object-cover"
            />
            {/* overlay claro: funde a foto com o fundo do lado do saco */}
            <div aria-hidden className="absolute inset-0 bg-gradient-to-tr from-gelo/75 via-gelo/10 to-transparent" />
          </figure>

          {/* sombra de chão do saco */}
          <div aria-hidden className="absolute bottom-[2%] left-[6%] h-[5%] w-[38%] rounded-[50%] bg-cafe/25 blur-md" />
          <Image
            src={bag}
            alt="Big bag de café com a marca Alta Vista Coffee Ltda., cheio de grãos"
            loading="eager"
            sizes="(max-width: 1023px) 40vw, 260px"
            className="absolute bottom-[3%] left-[4%] h-[78%] w-auto drop-shadow-[0_18px_22px_rgba(42,27,19,0.3)]"
          />

          {/* grãos: perto do saco (nítidos), um à frente da foto, um ao fundo desfocado */}
          <Bean n={3} depth="near" rotate={-18} className="bottom-[1%] left-[39%] w-[9%]" />
          <Bean n={5} depth="near" rotate={30} className="bottom-[0%] left-[1%] w-[5%]" />
          <Bean n={1} depth="mid" rotate={22} float floatDuration={8} parallax={0.12} className="left-[30%] top-[8%] w-[11%] max-lg:hidden" />
          <Bean n={2} depth="mid" rotate={-28} float floatDuration={9} floatDelay={1.2} parallax={0.08} className="right-[-3%] top-[62%] w-[8%]" />
          <Bean n={4} depth="far" rotate={12} float floatDuration={10} floatDelay={0.6} className="right-[20%] top-[-4%] w-[4%] max-lg:hidden" />
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
