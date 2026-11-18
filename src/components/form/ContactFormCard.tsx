"use client";

import { useId, useState, type FormEvent } from "react";
import { whatsappLink } from "@/lib/site";
import { Bean } from "../Bean";
import { WhatsAppIcon } from "../WhatsAppIcon";

/** Padrões de café que o comprador pode escolher (um ou vários). */
const PADROES = ["Escolha", "Consumo", "Café bebida"] as const;

/** Monta a mensagem do WhatsApp: deixa claro que é uma compra e leva só o que foi preenchido. */
function buildMessage(d: FormData, padroes: string[]) {
  const dados = [
    `Nome: ${d.get("nome")}`,
    d.get("empresa") && `Empresa/Fazenda: ${d.get("empresa")}`,
    `Padrão desejado: ${padroes.join(", ")}`,
    d.get("volume") && `Volume: ${d.get("volume")} sacas`,
    d.get("mensagem") && `Mensagem: ${d.get("mensagem")}`,
  ].filter(Boolean);
  return `Olá, tenho interesse em comprar matéria-prima com a Alta Vista Coffee.\n\n${dados.join("\n")}`;
}

/**
 * Formulário comercial de compra de matéria-prima — card de vidro claro,
 * luz quente que o vidro desfoca e o grão PNG flutuando. Envia pelo WhatsApp.
 * Usado na seção Contato e no popup (cada instância tem ids próprios).
 */
export function ContactFormCard({ titleId }: { titleId?: string }) {
  const [error, setError] = useState<string | null>(null);
  const [padroes, setPadroes] = useState<string[]>([]);
  const [padraoInvalid, setPadraoInvalid] = useState(false);
  const [nomeInvalid, setNomeInvalid] = useState(false);
  const uid = useId();
  const helpId = `${uid}-help`;
  const errorId = `${uid}-error`;
  const padraoId = `${uid}-padrao`;
  const headingId = titleId ?? `${uid}-title`;

  // mantém a ordem fixa das opções, qualquer que seja a ordem dos cliques
  const toggle = (p: string, on: boolean) => {
    setPadroes((cur) => PADROES.filter((x) => (x === p ? on : cur.includes(x))));
    if (on) setPadraoInvalid(false);
  };

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const nomeOk = form.nome.value.trim() !== "";
    const padraoOk = padroes.length > 0;
    setPadraoInvalid(!padraoOk);
    setNomeInvalid(!nomeOk);
    if (!nomeOk || !padraoOk) {
      const faltam = [!nomeOk && "o seu nome", !padraoOk && "pelo menos um padrão de café"].filter(Boolean);
      setError(`Preencha ${faltam.join(" e ")} para continuar.`);
      // leva o foco ao primeiro campo pendente
      (nomeOk ? form.querySelector<HTMLInputElement>('input[name="padrao"]') : form.nome)?.focus();
      return;
    }
    setError(null);
    window.open(whatsappLink(buildMessage(new FormData(form), padroes)), "_blank", "noopener,noreferrer");
  }

  const field =
    "mt-1.5 w-full rounded-[10px] border border-cafe/15 bg-white/80 px-3.5 py-3 text-base text-cafe placeholder:text-cafe/45 transition-colors focus:border-marrom-letra focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-marrom-letra";
  const label = "text-[0.9375rem] font-semibold";

  return (
    <div className="relative isolate">
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
        aria-labelledby={headingId}
        aria-describedby={helpId}
        className="rounded-[18px] border border-white/70 bg-white/50 p-6 shadow-[0_30px_60px_-30px_rgba(42,27,19,0.35),inset_0_1px_0_rgba(255,255,255,0.9)] ring-1 ring-cafe/5 backdrop-blur-xl backdrop-saturate-150 md:p-8"
      >
        <p id={headingId} className="title text-xl">
          Compre sua matéria-prima
        </p>
        <p id={helpId} className="mt-1 max-w-[56ch] text-[0.9375rem] text-cafe/75">
          Encontre oportunidades para adquirir matéria-prima com praticidade, confiança e segurança. Preencha seus dados e
          converse com nossa equipe.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className={label}>Nome *</span>
            <input
              name="nome"
              required
              autoComplete="name"
              aria-invalid={nomeInvalid || undefined}
              aria-describedby={nomeInvalid ? errorId : undefined}
              onInput={() => setNomeInvalid(false)}
              className={field}
              placeholder="Seu nome"
            />
          </label>
          <label className="block">
            <span className={label}>Empresa / fazenda</span>
            <input name="empresa" autoComplete="organization" className={field} placeholder="Opcional" />
          </label>

          {/* multiselect: checkboxes personalizados, um ou vários padrões */}
          <fieldset
            className="sm:col-span-2"
            aria-describedby={`${padraoId}-hint${padraoInvalid ? ` ${errorId}` : ""}`}
            aria-invalid={padraoInvalid || undefined}
          >
            <legend className={label}>Qual o padrão? *</legend>
            <p id={`${padraoId}-hint`} className="text-sm text-cafe/75">
              Selecione um ou mais.
            </p>
            <div className="mt-2 grid grid-cols-1 gap-2 min-[420px]:grid-cols-3">
              {PADROES.map((p) => (
                <label key={p} className="block cursor-pointer">
                  <input
                    type="checkbox"
                    name="padrao"
                    value={p}
                    checked={padroes.includes(p)}
                    onChange={(e) => toggle(p, e.target.checked)}
                    className="peer sr-only"
                  />
                  <span
                    className={`flex min-h-12 select-none items-center gap-3 rounded-[10px] border bg-white/80 px-3.5 text-base font-semibold transition-colors peer-checked:border-marrom-letra peer-checked:bg-marrom-letra/[0.08] peer-checked:text-marrom-letra peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-marrom-letra [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100 peer-checked:[&>i]:border-marrom-letra peer-checked:[&>i]:bg-marrom-letra ${
                      padraoInvalid ? "border-queda/70" : "border-cafe/15"
                    }`}
                  >
                    {/* caixa + visto desenhados: a seleção é inequívoca também no toque */}
                    <i aria-hidden className="relative block size-5 shrink-0 rounded-[6px] border-[1.5px] border-cafe/35 bg-white transition-colors" />
                    <svg
                      aria-hidden
                      viewBox="0 0 20 20"
                      className="-ml-8 size-5 shrink-0 text-gelo transition-opacity"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m5.5 10.5 3 3 6-7" />
                    </svg>
                    {p}
                  </span>
                </label>
              ))}
            </div>

            {/* resumo das escolhas, com remoção individual */}
            <div className="mt-2.5 flex min-h-8 flex-wrap items-center gap-2" aria-live="polite">
              {padroes.length === 0 ? (
                <span className="text-sm text-cafe/70">Nenhum padrão selecionado.</span>
              ) : (
                <>
                  <span className="text-sm text-cafe/80">Selecionados:</span>
                  {padroes.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => toggle(p, false)}
                      className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-marrom-letra px-3 text-sm font-semibold text-gelo transition-colors hover:bg-marrom"
                    >
                      {p}
                      <svg aria-hidden viewBox="0 0 12 12" className="size-2.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                        <path d="M3 3l6 6M9 3 3 9" />
                      </svg>
                      <span className="sr-only">(remover)</span>
                    </button>
                  ))}
                </>
              )}
            </div>
          </fieldset>

          <label className="block sm:col-span-2">
            <span className={label}>Volume (sacas)</span>
            <input name="volume" inputMode="numeric" className={field} placeholder="Quantas sacas pretende comprar? Ex.: 300" />
          </label>

          <label className="block sm:col-span-2">
            <span className={label}>Mensagem</span>
            <textarea
              name="mensagem"
              rows={3}
              className={`${field} resize-none`}
              placeholder="Tipo de café que procura, bebida, peneira, prazo de entrega…"
            />
          </label>
        </div>

        {error && (
          <p id={errorId} role="alert" className="mt-4 text-[0.9375rem] font-semibold text-queda">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-full bg-marrom-letra px-7 py-3.5 text-base font-semibold text-gelo transition-colors hover:bg-marrom"
        >
          <WhatsAppIcon className="size-5" />
          Solicitar negociação pelo WhatsApp
        </button>
        <p className="mt-3 text-center text-sm text-cafe/70">
          O WhatsApp abre com a sua mensagem pronta. Nenhum dado fica armazenado no site.
        </p>
      </form>
    </div>
  );
}
