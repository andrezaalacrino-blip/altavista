import { howItWorks, steps } from "@/content/home";

/**
 * Como funciona — sequência real, então a numeração tem função.
 * Desktop: cinco etapas lado a lado sobre um fio. Celular: lista vertical.
 */
export function ComoFunciona() {
  return (
    <section id="como-funciona" aria-labelledby="como-funciona-title" className="bg-bege">
      <div className="mx-auto max-w-[1320px] px-5 py-16 md:px-8 lg:py-24">
        <p className="kicker">Como funciona</p>
        <h2 id="como-funciona-title" className="title mt-3 max-w-[22ch] text-h2 text-balance">
          {howItWorks.title}
        </h2>

        <ol className="relative mt-10 grid gap-7 lg:mt-14 lg:grid-cols-5 lg:gap-6">
          {/* fio que liga as etapas (desktop: horizontal; celular: vertical) */}
          <span aria-hidden className="absolute left-[17px] top-2 bottom-2 w-px bg-marrom-letra/25 lg:left-0 lg:right-0 lg:top-[17px] lg:bottom-auto lg:h-px lg:w-auto" />
          {steps.map((s, i) => (
            <li key={s.title} className="relative grid grid-cols-[36px_1fr] gap-x-4 lg:block">
              <span
                aria-hidden
                className="relative z-10 flex size-9 items-center justify-center rounded-full bg-marrom-letra text-[0.9375rem] font-semibold text-gelo"
              >
                {i + 1}
              </span>
              <div className="lg:mt-5">
                <h3 className="font-semibold">{s.title}</h3>
                <p className="mt-1 text-[0.9375rem] leading-relaxed text-cafe/75">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
