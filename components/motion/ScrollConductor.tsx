"use client";

import { useEffect } from "react";
import { coverAmount, stepAt, stickyProgress } from "@/lib/motion/scroll";
import { REDUCED_MOTION } from "./media";

/**
 * Condutor de rolagem próprio (decisão 5 da design), para as áreas `[data-scrub]`:
 * - `data-scrub="sequence"` (sequência da arquitetura): grava `--p` (0 a 1) e marca a etapa atual
 *   (`.on` e `aria-current="step"` no item da lista `[data-step]`);
 * - `data-scrub="stack"` (pilha da Pesquisa): grava `--cover` em cada cartão, conforme o próximo o cobre.
 *
 * A fixação é `position: sticky` (CSS); aqui só se lê a posição, uma vez por quadro e só enquanto alguma área está
 * na tela. Com movimento reduzido, nada roda: o CSS mostra tudo pronto, sem área presa. Não renderiza nada.
 */
export function ScrollConductor() {
  useEffect(() => {
    if (window.matchMedia(REDUCED_MOTION).matches) return;
    const areas = [...document.querySelectorAll<HTMLElement>("[data-scrub]")];
    if (areas.length === 0) return;

    const active = new Set<HTMLElement>();
    let frame = 0;

    const update = (el: HTMLElement) => {
      if (el.dataset.scrub === "sequence") {
        const r = el.getBoundingClientRect();
        const p = stickyProgress(r.top, r.height, window.innerHeight);
        el.style.setProperty("--p", p.toFixed(4));
        const steps = [...el.querySelectorAll<HTMLElement>("[data-step]")];
        const current = stepAt(p, steps.length);
        steps.forEach((li, i) => {
          li.classList.toggle("on", i === current);
          if (i === current) li.setAttribute("aria-current", "step");
          else li.removeAttribute("aria-current");
        });
      } else {
        const cards = [...el.querySelectorAll<HTMLElement>(".paper")];
        cards.forEach((card, i) => {
          const next = cards[i + 1];
          if (!next) return card.style.setProperty("--cover", "0");
          const a = card.getBoundingClientRect();
          const cover = coverAmount(a.top, a.height, next.getBoundingClientRect().top);
          card.style.setProperty("--cover", cover.toFixed(3));
        });
      }
    };

    const tick = () => {
      frame = 0;
      active.forEach(update);
    };
    const schedule = () => {
      if (!frame && active.size) frame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const el = entry.target as HTMLElement;
        if (entry.isIntersecting) active.add(el);
        else active.delete(el);
      }
      schedule();
    });
    areas.forEach((el) => observer.observe(el));
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return null;
}
