import { BeanParallax } from "@/components/BeanParallax";
import { Footer } from "@/components/Footer";
import { FormDialogProvider } from "@/components/form/FormDialog";
import { Header } from "@/components/Header";
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
      <FormDialogProvider>
        <a
          href="#quem-somos"
          className="sr-only z-[60] rounded bg-marrom-letra px-4 py-2 text-gelo focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Pular para o conteúdo
        </a>
        <Header />
        {/* clip (não hidden): corta só o que passa da lateral — grãos girando nas bordas —
            sem criar contêiner de rolagem */}
        <main className="overflow-x-clip">
          <Abertura />
          <QuemSomos />
          <Diferencial />
          <ComoFunciona />
          <Contato />
          <Localizacao />
        </main>
        <Footer />
        <BeanParallax />
      </FormDialogProvider>
    </MarketProvider>
  );
}
