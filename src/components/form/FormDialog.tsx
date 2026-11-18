"use client";

import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from "react";
import { ContactFormCard } from "./ContactFormCard";

const DialogContext = createContext<() => void>(() => {});

/**
 * Popup do formulário de compra — <dialog> nativo com showModal():
 * foco preso dentro dele, Esc fecha, foco volta ao botão que abriu, fundo
 * inerte para leitores de tela. Clique fora do card também fecha.
 * O WhatsApp só abre quando o visitante envia o formulário.
 */
export function FormDialogProvider({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);

  const open = useCallback(() => {
    const d = ref.current;
    if (!d || d.open) return;
    d.showModal(); // a rolagem da página trava via CSS: html:has(dialog[open])
  }, []);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    // clique no fundo (fora do conteúdo) fecha
    const onClick = (e: MouseEvent) => {
      if (e.target === d) d.close();
    };
    d.addEventListener("click", onClick);
    return () => d.removeEventListener("click", onClick);
  }, []);

  return (
    <DialogContext.Provider value={open}>
      {children}
      <dialog
        ref={ref}
        aria-labelledby="popup-form-title"
        className="m-auto max-h-[100dvh] w-full max-w-[720px] overflow-visible bg-transparent p-0 text-cafe backdrop:bg-cafe/40 backdrop:backdrop-blur-sm open:animate-[pop_0.35s_var(--ease-out)]"
      >
        {/* área rolável própria: o formulário inteiro cabe em qualquer altura de tela */}
        {/* overflow-x-hidden: a luz desfocada atrás do card passa da borda em telas estreitas e não pode gerar rolagem lateral */}
        <div className="max-h-[100dvh] overflow-y-auto overflow-x-hidden overscroll-contain px-4 pb-6 pt-14 sm:px-6 sm:pb-10 sm:pt-16">
          <div className="relative">
            <button
              type="button"
              autoFocus
              onClick={() => ref.current?.close()}
              className="absolute -top-12 right-14 z-20 inline-flex size-11 items-center justify-center rounded-full border border-white/70 bg-white/80 text-cafe shadow-md backdrop-blur-md transition-colors hover:bg-white sm:-top-14 md:right-20"
            >
              <span className="sr-only">Fechar formulário</span>
              <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
            <ContactFormCard titleId="popup-form-title" />
          </div>
        </div>
      </dialog>
    </DialogContext.Provider>
  );
}

/** Botão "Negocie sua matéria-prima": abre o popup do formulário. */
export function NegocieButton({ className = "" }: { className?: string }) {
  const open = useContext(DialogContext);
  return (
    <button type="button" onClick={open} aria-haspopup="dialog" className={className}>
      Negocie sua matéria-prima
    </button>
  );
}
