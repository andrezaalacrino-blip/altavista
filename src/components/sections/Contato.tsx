import { closing } from "@/content/home";
import { ContactFormCard } from "../form/ContactFormCard";

/** Contato comercial — texto à esquerda, formulário de compra de matéria-prima à direita. */
export function Contato() {
  return (
    <section id="contato" aria-labelledby="contato-title" className="relative bg-gelo">
      <div className="mx-auto grid max-w-[1320px] gap-12 px-5 py-16 md:px-8 lg:grid-cols-12 lg:items-center lg:gap-16 lg:py-24">
        <div className="lg:col-span-5">
          <p className="kicker">Contato comercial</p>
          <h2 id="contato-title" className="title mt-3 max-w-[14ch] text-h2 text-balance">
            {closing.title}
          </h2>
          <p className="mt-5 max-w-[40ch] text-pretty text-lead text-cafe/80">{closing.text}</p>
        </div>

        <div className="lg:col-span-7">
          <ContactFormCard />
        </div>
      </div>
    </section>
  );
}
