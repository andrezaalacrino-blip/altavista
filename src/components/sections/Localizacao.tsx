"use client";

import dynamic from "next/dynamic";
import { mapsDirectionsUrl, mapsEmbedUrl, mapsSearchUrl, site, whatsappLink } from "@/lib/site";
import { WhatsAppIcon } from "../WhatsAppIcon";

/** Leaflet só no navegador — e só quando houver coordenadas confirmadas. */
const LeafletMap = dynamic(() => import("../location/LeafletMap"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 animate-pulse bg-bege-2" />,
});

/** Localização — endereço legível, mapa real e as duas ações que o visitante procura. */
export function Localizacao() {
  const coords = site.address.coordinates;

  return (
    <section id="localizacao" aria-labelledby="localizacao-title" className="bg-bege">
      <div className="mx-auto grid max-w-[1320px] gap-10 px-5 py-16 md:px-8 lg:grid-cols-12 lg:items-center lg:gap-12 lg:py-24">
        <div className="lg:col-span-5">
          <p className="kicker">Localização</p>
          <h2 id="localizacao-title" className="title mt-3 text-h2">
            Onde estamos
          </h2>
          <address className="mt-5 text-lg not-italic leading-relaxed">
            {site.address.lines.map((l) => (
              <span key={l} className="block">
                {l}
              </span>
            ))}
          </address>

          {!coords && (
            <p role="note" className="mt-4 max-w-[42ch] text-[0.9375rem] leading-relaxed text-cafe/75">
              A localização exata do sítio está em confirmação. O mapa mostra o resultado da busca pelo endereço.
            </p>
          )}

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a
              href={mapsSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-marrom-letra px-6 py-3.5 text-base font-semibold text-gelo transition-colors hover:bg-marrom"
            >
              Abrir no Google Maps
            </a>
            <a
              href={mapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center rounded-full border-[1.5px] border-marrom-letra/70 px-6 py-3 text-base font-semibold text-marrom-letra transition-colors hover:bg-marrom-letra hover:text-gelo"
            >
              Como chegar
            </a>
          </div>

          <a
            href={whatsappLink("Olá! Gostaria de combinar uma visita à Alta Vista Coffee.")}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 text-[0.9375rem] font-semibold text-marrom-letra underline decoration-marrom-letra/40 underline-offset-4 hover:decoration-marrom-letra"
          >
            <WhatsAppIcon className="size-4" />
            Combinar uma visita
          </a>
        </div>

        <div className="lg:col-span-7">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[6px] border border-cafe/10 bg-bege-2 shadow-[0_24px_50px_-34px_rgba(42,27,19,0.45)] sm:aspect-[16/10]">
            {coords ? (
              <LeafletMap lat={coords.lat} lng={coords.lng} label={site.legalName} address={site.address.lines} />
            ) : (
              <iframe
                src={mapsEmbedUrl}
                title={`Mapa: busca pelo endereço ${site.address.query}`}
                className="absolute inset-0 size-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
