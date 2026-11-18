"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

/**
 * Multiselect "Qual o padrão?" — gatilho com a mesma altura dos outros campos,
 * mostrando os padrões escolhidos como etiquetas; abre uma lista de opções
 * com marcação. Funciona com mouse, toque e teclado (↑ ↓, Espaço/Enter, Esc, Tab).
 * Os valores vão no formulário como inputs ocultos name="padrao".
 */
export function PadraoSelect({
  options,
  value,
  onChange,
  invalid,
  describedBy,
  labelId,
}: {
  options: readonly string[];
  value: string[];
  /** recebe uma função de atualização: toques rápidos nunca se sobrescrevem */
  onChange: (update: (current: string[]) => string[]) => void;
  invalid: boolean;
  describedBy?: string;
  labelId: string;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const uid = useId();
  const listId = `${uid}-list`;
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);

  // ordem fixa das opções, qualquer que seja a ordem dos cliques
  const toggle = (opt: string) =>
    onChange((cur) => options.filter((o) => (o === opt ? !cur.includes(o) : cur.includes(o))));
  // leitura sempre atual do item ativo pelo teclado (Espaço logo após ↓)
  const activeRef = useRef(0);
  const moveActive = (i: number) => {
    activeRef.current = i;
    setActive(i);
  };

  const close = (refocus: boolean) => {
    setOpen(false);
    if (refocus) trigger.current?.focus();
  };

  // clique/toque fora fecha
  useEffect(() => {
    if (!open) return;
    list.current?.focus();
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  function onListKey(e: KeyboardEvent<HTMLUListElement>) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const step = e.key === "ArrowDown" ? 1 : -1;
      moveActive((activeRef.current + step + options.length) % options.length);
    } else if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      toggle(options[activeRef.current]);
    } else if (e.key === "Escape") {
      // dentro do popup: Esc fecha só a lista, não o diálogo
      e.preventDefault();
      e.stopPropagation();
      close(true);
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  }

  return (
    <div ref={root} className="relative mt-1.5">
      {value.map((v) => (
        <input key={v} type="hidden" name="padrao" value={v} />
      ))}
      <button
        ref={trigger}
        type="button"
        data-padrao-trigger
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-labelledby={`${labelId} ${uid}-value`}
        aria-describedby={describedBy}
        onClick={() => {
          moveActive(0);
          setOpen((o) => !o);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" && !open) {
            e.preventDefault();
            moveActive(0);
            setOpen(true);
          }
        }}
        className={`flex min-h-[50px] w-full items-center gap-2 rounded-[10px] border bg-white/80 py-2 pl-3.5 pr-10 text-left text-base text-cafe transition-colors focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-marrom-letra ${
          invalid ? "border-queda/70" : open ? "border-marrom-letra" : "border-cafe/15"
        }`}
      >
        <span id={`${uid}-value`} className="flex min-w-0 flex-wrap gap-1.5">
          {value.length === 0 ? (
            <span className="text-cafe/55">Selecione um ou mais</span>
          ) : (
            value.map((v) => (
              <span key={v} className="rounded-full bg-marrom-letra px-2.5 py-0.5 text-sm font-semibold text-gelo">
                {v}
              </span>
            ))
          )}
        </span>
        <svg
          aria-hidden
          viewBox="0 0 20 20"
          className={`absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-cafe/70 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m5 7.5 5 5 5-5" />
        </svg>
      </button>

      <ul
        ref={list}
        id={listId}
        role="listbox"
        aria-multiselectable="true"
        aria-labelledby={labelId}
        aria-activedescendant={open ? `${uid}-opt-${active}` : undefined}
        tabIndex={-1}
        hidden={!open}
        onKeyDown={onListKey}
        className="absolute inset-x-0 top-[calc(100%+6px)] z-30 rounded-[12px] border border-white/80 bg-white/95 p-1.5 shadow-[0_18px_40px_-18px_rgba(42,27,19,0.45)] ring-1 ring-cafe/10 backdrop-blur-xl focus:outline-none"
      >
        {options.map((opt, i) => {
          const selected = value.includes(opt);
          return (
            <li
              key={opt}
              id={`${uid}-opt-${i}`}
              role="option"
              aria-selected={selected}
              onPointerEnter={() => moveActive(i)}
              onClick={() => toggle(opt)}
              className={`flex min-h-11 cursor-pointer select-none items-center gap-3 rounded-[8px] px-3 text-base font-medium transition-colors ${
                i === active ? "bg-bege" : ""
              } ${selected ? "text-marrom-letra" : "text-cafe"}`}
            >
              {/* caixa com visto: seleção inequívoca também no toque */}
              <span
                aria-hidden
                className={`grid size-5 shrink-0 place-items-center rounded-[6px] border-[1.5px] transition-colors ${
                  selected ? "border-marrom-letra bg-marrom-letra text-gelo" : "border-cafe/35 bg-white"
                }`}
              >
                {selected && (
                  <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m5.5 10.5 3 3 6-7" />
                  </svg>
                )}
              </span>
              {opt}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
