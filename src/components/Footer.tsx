import Image from "next/image";
import symbol from "@/assets/brand/symbol.png";
import wordmark from "@/assets/brand/wordmark.png";
import { tagline } from "@/content/home";
import { mapsSearchUrl, nav, site, whatsappLink } from "@/lib/site";
import { WhatsAppIcon } from "./WhatsAppIcon";

/** Ícone social: só o símbolo, área de toque de 44 px, nome acessível no aria-label. */
const social =
  "inline-flex size-11 items-center justify-center rounded-full border border-cafe/20 text-marrom-letra transition-colors hover:border-marrom-letra hover:bg-marrom-letra hover:text-gelo focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marrom-letra";

/** Encerramento institucional claro: logo original, navegação, endereço, redes e créditos. */
export function Footer() {
  return (
    <footer className="bg-bege-2">
      <div className="mx-auto max-w-[1320px] px-5 pb-8 pt-14 md:px-8 lg:pt-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* marca */}
          <div className="sm:col-span-2 lg:col-span-6">
            <div className="flex items-center gap-3" translate="no">
              <Image src={symbol} alt="" className="size-12" sizes="48px" />
              <Image src={wordmark} alt="Alta Vista" className="h-9 w-auto" sizes="170px" />
            </div>
            <p className="title mt-6 max-w-[22ch] text-2xl text-balance">{tagline}</p>
          </div>

          {/* navegação em coluna */}
          <nav aria-labelledby="rodape-nav" className="lg:col-span-3">
            <h2 id="rodape-nav" className="kicker">
              Navegação
            </h2>
            <ul className="mt-3 flex flex-col gap-2.5 text-[0.9375rem] text-cafe/85">
              {nav.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="transition-colors hover:text-marrom-letra">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* endereço + redes */}
          <div className="lg:col-span-3">
            <h2 className="kicker">Endereço</h2>
            <address className="mt-3 text-[0.9375rem] not-italic leading-relaxed text-cafe/85">
              {site.address.lines.map((l) => (
                <span key={l} className="block">
                  {l}
                </span>
              ))}
            </address>
            <a
              href={mapsSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-[0.9375rem] font-semibold text-marrom-letra underline decoration-marrom-letra/40 underline-offset-4"
            >
              Ver no Google Maps
            </a>
            <ul className="mt-5 flex items-center gap-3">
              <li>
                <a href={site.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram da Alta Vista Coffee" className={social}>
                  <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                  </svg>
                </a>
              </li>
              <li>
                <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp comercial da Alta Vista Coffee" className={social}>
                  <WhatsAppIcon className="size-5" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* créditos: lado a lado no desktop, empilhados no celular */}
        <div className="mt-12 flex flex-col gap-2 border-t border-cafe/15 pt-6 text-[0.8125rem] text-cafe/70 md:flex-row md:items-center md:justify-between">
          <p>© {site.legalName} Todos os direitos reservados.</p>
          <p>
            Desenvolvido por:{" "}
            <a
              href="https://www.instagram.com/linko.ag/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-marrom-letra underline decoration-marrom-letra/40 underline-offset-4 transition-colors hover:decoration-marrom-letra"
            >
              Linko Hub
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
