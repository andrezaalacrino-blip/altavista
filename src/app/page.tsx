import { BeanParallax } from "@/components/BeanParallax";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MarketBar } from "@/components/market/MarketBar";
import { MarketProvider } from "@/components/market/MarketProvider";
import { Abertura } from "@/components/sections/Abertura";
import { ComoFunciona } from "@/components/sections/ComoFunciona";
import { Contato } from "@/components/sections/Contato";
import { Diferencial } from "@/components/sections/Diferencial";
import { Localizacao } from "@/components/sections/Localizacao";
import { QuemSomos } from "@/components/sections/QuemSomos";

export default function Home() {
  return (
    <MarketProvider>
      <a
        href="#quem-somos"
        className="sr-only z-[60] rounded bg-marrom-letra px-4 py-2 text-gelo focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Pular para o conteúdo
      </a>
      <MarketBar />
      <Header />
      <main>
        <Abertura />
        <QuemSomos />
        <Diferencial />
        <ComoFunciona />
        <Contato />
        <Localizacao />
      </main>
      <Footer />
      <BeanParallax />
    </MarketProvider>
  );
}
