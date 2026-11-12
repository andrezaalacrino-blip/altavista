"use client";

import { useState, type FormEvent } from "react";
import { closing, waMessages } from "@/content/home";
import { site, whatsappLink } from "@/lib/site";
import { Bean } from "../Bean";
import { WhatsAppIcon } from "../WhatsAppIcon";

const PERFIS = ["Produtor", "Cooperativa / armazém", "Exportador", "Torrefação / indústria", "Outro"];

/** Monta a mensagem do WhatsApp só com o que o visitante preencheu. */
function buildMessage(d: FormData) {
  const quer = d.get("interesse") === "comprar" ? "comprar" : "vender";
  const dados = [
    `Nome: ${d.get("nome")}`,
    d.get("empresa") && `Empresa / fazenda: ${d.get("empresa")}`,
    `Perfil: ${d.get("perfil")}`,
    d.get("volume") && `Volume aproximado: ${d.get("volume")} sacas`,
    d.get("mensagem") && `\nMensagem: ${d.get("mensagem")}`,
  ].filter(Boolean);
  return `Olá, Alta Vista Coffee! Quero ${quer} café e gostaria de conversar.\n\n${dados.join("\n")}`;
}

/**
 * Contato comercial — os dois botões diretos e o formulário que abre o
 * WhatsApp com a mensagem montada. Nenhum dado é enviado a servidor.
 */
export function Contato() {
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      setError("Preencha nome, se quer vender ou comprar, e o perfil.");
      form.reportValidity();
      return;
    }
    setError(null);
    window.open(whatsappLink(buildMessage(new FormData(form))), "_blank", "noopener,noreferrer");
  }

  const field =
    "mt-1.5 w-full rounded-[10px] border border-cafe/15 bg-white/80 px-3.5 py-3 text-base text-cafe placeholder:text-cafe/45 transition-colors focus:border-marrom-letra focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-marrom-letra";
  const label = "text-[0.9375rem] font-semibold";

  return (
    <section id="contato" aria-labelledby="contato-title" className="relative bg-gelo">
      <div className="mx-auto grid max-w-[1320px] gap-12 px-5 py-16 md:px-8 lg:grid-cols-12 lg:gap-12 lg:py-24">
        <div className="lg:col-span-5">
          <p className="kicker">Contato comercial</p>
          <h2 id="contato-title" className="title mt-3 max-w-[16ch] text-h2 text-balance">
            {closing.title.join(" ")}
          </h2>
          <p className="mt-5 max-w-[40ch] text-pretty text-cafe/80">{closing.text}</p>

          <div className="mt-8 flex flex-col gap-3 sm:max-w-sm">
            <a
              href={whatsappLink(waMessages.vender)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full bg-marrom-letra px-7 py-3.5 text-base font-semibold text-gelo transition-colors hover:bg-marrom"
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
          <p className="mt-5 text-[0.9375rem] text-cafe/75">
            WhatsApp comercial <span className="tabular font-semibold text-cafe">{site.whatsapp.display}</span>
          </p>
        </div>

        <div className="relative isolate lg:col-span-7">
          {/* luz quente atrás do card: é o que o vidro desfoca */}
          <div aria-hidden className="pointer-events-none absolute -inset-6 -z-10 md:-inset-10">
            <div className="absolute left-[4%] top-[6%] size-[55%] rounded-full bg-amarelo/30 blur-3xl" />
            <div className="absolute bottom-[4%] right-[2%] size-[50%] rounded-full bg-marrom-letra/20 blur-3xl" />
            <div className="absolute left-[30%] top-[40%] size-[35%] rounded-full bg-verde/10 blur-3xl" />
          </div>
          <Bean n={2} depth="mid" rotate={-32} float floatDuration={11} parallax={0.06} className="-right-2 -top-7 z-10 w-10 md:-right-4 md:-top-9 md:w-14" />
          <form
            onSubmit={onSubmit}
            noValidate
            aria-describedby="form-help"
            className="rounded-[18px] border border-white/70 bg-white/50 p-6 shadow-[0_30px_60px_-30px_rgba(42,27,19,0.35),inset_0_1px_0_rgba(255,255,255,0.9)] ring-1 ring-cafe/5 backdrop-blur-xl backdrop-saturate-150 md:p-8"
          >
            <p className="title text-xl">Solicite um contato</p>
            <p id="form-help" className="mt-1 text-[0.9375rem] text-cafe/75">
              Ao enviar, o WhatsApp abre com a sua mensagem pronta. Nenhum dado fica armazenado no site.
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className={label}>Nome *</span>
                <input name="nome" required autoComplete="name" className={field} placeholder="Seu nome" />
              </label>
              <label className="block">
                <span className={label}>Empresa / fazenda</span>
                <input name="empresa" autoComplete="organization" className={field} placeholder="Opcional" />
              </label>

              <fieldset className="sm:col-span-2">
                <legend className={label}>Você quer *</legend>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  {[
                    { v: "vender", l: "Vender" },
                    { v: "comprar", l: "Comprar" },
                  ].map(({ v, l }) => (
                    <label key={v}>
                      <input type="radio" name="interesse" value={v} required className="peer sr-only" />
                      <span className="flex min-h-12 cursor-pointer items-center justify-center rounded-[10px] border border-cafe/15 bg-white/80 text-base font-semibold transition-colors peer-checked:border-marrom-letra peer-checked:bg-marrom-letra peer-checked:text-gelo peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-marrom-letra">
                        {l}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className="block">
                <span className={label}>Perfil *</span>
                <select name="perfil" required defaultValue="" className={field}>
                  <option value="" disabled>
                    Selecione
                  </option>
                  {PERFIS.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className={label}>Volume (sacas)</span>
                <input name="volume" inputMode="numeric" className={field} placeholder="Ex.: 300" />
              </label>

              <label className="block sm:col-span-2">
                <span className={label}>Mensagem</span>
                <textarea name="mensagem" rows={3} className={`${field} resize-none`} placeholder="Tipo de café, prazo, local…" />
              </label>
            </div>

            {error && (
              <p role="alert" className="mt-4 text-[0.9375rem] font-semibold text-queda">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-full bg-marrom-letra px-7 py-3.5 text-base font-semibold text-gelo transition-colors hover:bg-marrom"
            >
              <WhatsAppIcon className="size-5" />
              Enviar pelo WhatsApp
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
