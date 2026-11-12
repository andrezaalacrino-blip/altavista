import { atuacao, tagline } from "@/content/home";
import { Bean } from "../Bean";

/**
 * Quem somos — texto oficial integral, em duas colunas equilibradas sobre o
 * bege. Um grão atravessa a borda da seção (transição discreta).
 */
export function QuemSomos() {
  return (
    <section id="quem-somos" aria-labelledby="quem-somos-title" className="relative bg-bege">
      <Bean n={1} depth="mid" rotate={-24} float parallax={0.1} className="-top-8 right-[8%] w-16 md:w-20" />

      <div className="mx-auto grid max-w-[1320px] gap-10 px-5 py-16 md:px-8 lg:grid-cols-12 lg:gap-8 lg:py-24">
        <div className="lg:col-span-5">
          <p className="kicker">Quem somos</p>
          <h2 id="quem-somos-title" className="title mt-3 max-w-[16ch] text-h2 text-balance">
            {atuacao.title.join(" ")}
          </h2>
          <p className="mt-6 max-w-[40ch] text-pretty text-lead font-medium">{atuacao.lead}</p>
        </div>

        <div className="lg:col-span-6 lg:col-start-7 lg:pt-9">
          <div className="max-w-[62ch] space-y-4 text-pretty text-cafe/80">
            {atuacao.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <p className="mt-7 font-semibold text-marrom-letra">Alta Vista Coffee. {tagline}</p>
        </div>
      </div>
    </section>
  );
}
