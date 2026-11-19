"use client";

import { useEffect } from "react";
import { REDUCED_MOTION } from "./media";

const DURATION = 1000;

/**
 * Números que contam até o valor ao aparecer (`[data-count]` dentro do contêiner). O valor final já está no HTML:
 * sem JavaScript e com movimento reduzido, aparece o número certo e nada conta. Não renderiza nada.
 */
export function CountUp({ targetId }: { targetId: string }) {
  useEffect(() => {
    const root = document.getElementById(targetId);
    if (!root || window.matchMedia(REDUCED_MOTION).matches) return;
    const frames = new Set<number>();

    const run = (el: HTMLElement) => {
      const end = Number(el.dataset.count);
      if (!Number.isFinite(end)) return;
      const start = performance.now();
      const step = (now: number) => {
        const k = Math.min(1, (now - start) / DURATION);
        el.textContent = String(Math.round(end * (1 - (1 - k) ** 3)));
        if (k < 1) frames.add(requestAnimationFrame(step));
      };
      frames.add(requestAnimationFrame(step));
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(entry.target);
          run(entry.target as HTMLElement);
        }
      },
      { threshold: 0.6 }
    );
    root.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      frames.forEach(cancelAnimationFrame);
      // O valor final volta ao lugar se o componente sair no meio da contagem.
      root
        .querySelectorAll<HTMLElement>("[data-count]")
        .forEach((el) => (el.textContent = el.dataset.count!));
    };
  }, [targetId]);

  return null;
}
