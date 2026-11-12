import Image from "next/image";
import symbol from "@/assets/brand/symbol.png";
import wordmark from "@/assets/brand/wordmark.png";
import { tagline, waMessages } from "@/content/home";
import { mapsSearchUrl, nav, site, whatsappLink } from "@/lib/site";
import { WhatsAppIcon } from "./WhatsAppIcon";

/** Encerramento institucional claro: logo original, posicionamento, contato e endereço. */
export function Footer() {
  return (
    <footer className="bg-bege-2">
      <div className="mx-auto max-w-[1320px] px-5 pb-8 pt-14 md:px-8 lg:pt-16">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <div className="flex items-center gap-3" translate="no">
              <Image src={symbol} alt="" className="size-12" sizes="48px" />
              <Image src={wordmark} alt="Alta Vista" className="h-9 w-auto" sizes="170px" />
            </div>
            <p className="title mt-6 max-w-[22ch] text-2xl text-balance">{tagline}</p>
            <a
              href={site.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2.5 font-semibold text-marrom-letra transition-colors hover:text-marrom"
            >
              <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
              Siga-nos no Instagram
              <span className="font-normal text-cafe/75">@altavista_coffe</span>
            </a>
          </div>

          <div className="lg:col-span-3">
            <h2 className="kicker">Contato comercial</h2>
            <a
              href={whatsappLink(waMessages.vender)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex min-h-12 items-center gap-2.5 rounded-full bg-marrom-letra px-5 py-3 font-semibold text-gelo transition-colors hover:bg-marrom"
            >
              <WhatsAppIcon className="size-5" />
              <span className="tabular">{site.whatsapp.display}</span>
            </a>
          </div>

          <div className="lg:col-span-3">
            <h2 className="kicker">Endereço</h2>
            <address className="mt-3 text-[0.9375rem] not-italic leading-relaxed text-cafe/85">
              {site.address.lines.map((l) => (
                <span key={l} className="block">
                  {l}
                </span>
              ))}
            </address>
            <a href={mapsSearchUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-[0.9375rem] font-semibold text-marrom-letra underline decoration-marrom-letra/40 underline-offset-4">
              Ver no Google Maps
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-5 border-t border-cafe/15 pt-6 md:flex-row md:items-center md:justify-between">
          <nav aria-label="Rodapé">
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[0.9375rem] text-cafe/80">
              {nav.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="hover:text-marrom-letra">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <p className="text-[0.8125rem] text-cafe/70">© {site.legalName} Todos os direitos reservados.</p>
        </div>
        <p className="mt-3 text-[0.8125rem] text-cafe/65">
          Cotações de referência: AwesomeAPI (dólar) e ICE NY via Yahoo Finance (café). Valores informativos.
        </p>
      </div>
    </footer>
  );
}
