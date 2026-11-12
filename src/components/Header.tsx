"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import symbol from "@/assets/brand/symbol.png";
import wordmark from "@/assets/brand/wordmark.png";
import { nav, site, whatsappLink } from "@/lib/site";
import { WhatsAppIcon } from "./WhatsAppIcon";

/** Cabeçalho claro: logo original (lettering marrom), navegação e WhatsApp. */
export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
    <header
      className={`fixed inset-x-0 top-(--bar-h) z-40 transition-[background-color,box-shadow] duration-300 ${
        open
          ? "bg-gelo shadow-[0_1px_0_rgba(42,27,19,0.08)]"
          : scrolled
            ? "bg-gelo/95 shadow-[0_1px_0_rgba(42,27,19,0.08)] backdrop-blur-md"
            : "bg-gelo"
      }`}
    >
      <div className="mx-auto flex h-(--header-h) max-w-[1320px] items-center justify-between gap-6 px-5 md:px-8">
        <a href="#inicio" translate="no" className="flex items-center gap-2.5" aria-label="Alta Vista Coffee, início">
          <Image src={symbol} alt="" className="size-10" sizes="40px" preload />
          <Image src={wordmark} alt="" className="h-7 w-auto" sizes="130px" preload />
        </a>

        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-8 text-[0.9375rem] font-medium text-cafe/80">
            {nav.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="transition-colors hover:text-marrom-letra">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <a
          href={whatsappLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden items-center gap-2 rounded-full bg-marrom-letra px-5 py-2.5 text-[0.9375rem] font-semibold text-gelo transition-colors hover:bg-marrom lg:inline-flex"
        >
          <WhatsAppIcon className="size-4" />
          Fale conosco
        </a>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="menu-mobile"
          className="-mr-2 inline-flex h-11 items-center gap-2.5 px-2 text-[0.9375rem] font-semibold text-cafe lg:hidden"
        >
          {open ? "Fechar" : "Menu"}
          <span aria-hidden className="relative block h-2.5 w-5">
            <span className={`absolute left-0 h-[1.5px] w-5 bg-current transition-transform duration-300 ${open ? "top-1 rotate-45" : "top-0"}`} />
            <span className={`absolute left-0 h-[1.5px] w-5 bg-current transition-transform duration-300 ${open ? "top-1 -rotate-45" : "top-2"}`} />
          </span>
        </button>
      </div>
    </header>

      {/* folha do menu FORA do <header>: o backdrop-filter do cabeçalho
          prenderia um filho position:fixed dentro dele (causa da sobreposição) */}
      <div
        id="menu-mobile"
        hidden={!open}
        className="fixed inset-x-0 bottom-0 top-[calc(var(--bar-h)+var(--header-h))] z-40 overflow-y-auto overscroll-contain border-t border-cafe/10 bg-gelo px-5 pb-10 pt-4 lg:hidden"
      >
        <nav aria-label="Menu">
          <ul>
            {nav.map((item) => (
              <li key={item.href} className="border-b border-cafe/10">
                <a href={item.href} onClick={() => setOpen(false)} className="title block py-4 text-2xl text-cafe">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <a
          href={whatsappLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 flex items-center justify-center gap-2 rounded-full bg-marrom-letra py-4 text-base font-semibold text-gelo"
        >
          <WhatsAppIcon className="size-5" />
          WhatsApp {site.whatsapp.display}
        </a>
      </div>
    </>
  );
}
