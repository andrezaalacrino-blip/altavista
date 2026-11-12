"use client";

import { gsap, MQ, useGSAP } from "@/lib/gsap";

/**
 * Parallax leve para todos os grãos marcados com data-bean-parallax.
 * Uma única instância na página. Desligado com movimento reduzido.
 */
export function BeanParallax() {
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(`${MQ.desktop}, ${MQ.mobile}`, () => {
      document.querySelectorAll<HTMLElement>("[data-bean-parallax]").forEach((el) => {
        const amount = Number(el.dataset.beanParallax) || 0;
        if (!amount) return;
        gsap.fromTo(
          el,
          { y: () => amount * 120 },
          {
            y: () => -amount * 120,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true },
          },
        );
      });
    });
  });
  return null;
}
