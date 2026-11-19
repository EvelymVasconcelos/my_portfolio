"use client";

import { useEffect } from "react";
import { FINE_POINTER_MOTION } from "./media";

/**
 * Luz que segue o ponteiro no fundo do Hero e formas que se deslocam com ele (decisão 11 da design). Grava a posição
 * em variáveis CSS (`--mx`/`--my` na luz, `--px`/`--py` nas formas) num quadro de animação, só enquanto o ponteiro se
 * move; o CSS faz o resto. Só com ponteiro fino e sem movimento reduzido. Não renderiza nada.
 */
export function HeroPointer({ targetId }: { targetId: string }) {
  useEffect(() => {
    const hero = document.getElementById(targetId);
    if (!hero || !window.matchMedia(FINE_POINTER_MOTION).matches) return;
    const glow = hero.querySelector<HTMLElement>(".hero-glow");
    const backdrop = hero.querySelector<HTMLElement>(".hero-backdrop");

    let frame = 0;
    let last: PointerEvent | null = null;
    const paint = () => {
      frame = 0;
      if (!last) return;
      const r = hero.getBoundingClientRect();
      const x = (last.clientX - r.left) / r.width;
      const y = (last.clientY - r.top) / r.height;
      glow?.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
      glow?.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
      backdrop?.style.setProperty("--px", (x - 0.5).toFixed(3));
      backdrop?.style.setProperty("--py", (y - 0.5).toFixed(3));
    };
    const onMove = (e: PointerEvent) => {
      last = e;
      if (!frame) frame = requestAnimationFrame(paint);
    };

    hero.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      hero.removeEventListener("pointermove", onMove);
    };
  }, [targetId]);

  return null;
}
