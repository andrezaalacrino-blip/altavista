"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { MarketPayload } from "@/lib/market-types";

type MarketState =
  | { status: "loading"; data: null; error: null }
  | { status: "ready"; data: MarketPayload; error: string | null }
  | { status: "error"; data: null; error: string };

const MarketContext = createContext<MarketState>({ status: "loading", data: null, error: null });

/** 15 s: barato (bate no cache do nosso servidor, não no fornecedor) e
 *  mostra um preço novo poucos segundos depois de o servidor recebê-lo. */
const REFRESH_MS = 15_000;

/**
 * Uma única fonte de dados para o painel de cotações do hero:
 * um fetch a cada 15 s, pausado quando a aba está oculta.
 * Se uma atualização falhar, o último dado válido continua na tela
 * (com o horário real dele) e o erro é sinalizado — nunca um número novo inventado.
 */
export function MarketProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<MarketState>({ status: "loading", data: null, error: null });
  const last = useRef<MarketPayload | null>(null);

  useEffect(() => {
    const onData = (json: MarketPayload) => {
      last.current = json;
      setState({ status: "ready", data: json, error: null });
    };
    const onError = (e: unknown) => {
      const message = e instanceof Error ? e.message : "Falha ao atualizar cotações";
      setState(
        last.current
          ? { status: "ready", data: last.current, error: message }
          : { status: "error", data: null, error: message },
      );
    };
    let lastFetch = 0;
    const load = () => {
      lastFetch = Date.now();
      fetchMarket().then(onData, onError);
    };

    let timer: ReturnType<typeof setInterval> | undefined;
    const start = () => {
      clearInterval(timer);
      timer = setInterval(load, REFRESH_MS);
    };
    // ao voltar à aba, só consulta se o dado já passou do intervalo — alternar
    // visibilidade rapidamente nunca gera rajadas de requisições à fonte
    const onVisibility = () => {
      if (document.visibilityState !== "visible") return clearInterval(timer);
      if (Date.now() - lastFetch >= REFRESH_MS) load();
      start();
    };
    load();
    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <MarketContext.Provider value={state}>{children}</MarketContext.Provider>;
}

async function fetchMarket(): Promise<MarketPayload> {
  const res = await fetch("/api/market", { cache: "no-store" });
  const json = (await res.json()) as MarketPayload;
  if (!json.quotes?.length) throw new Error("Cotações indisponíveis no momento");
  return json;
}

export const useMarket = () => useContext(MarketContext);
