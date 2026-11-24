"use client";

import { useEffect } from "react";
import { FINE_POINTER_MOTION } from "./media";

/**
 * Luz que acompanha o ponteiro dentro dos botões (`.btn-luz`, de components/ui/Button.tsx; estilo em globals.css).
 * Um único ouvinte no documento grava `--x` e `--y`, em px, no botão sob o ponteiro, no máximo uma vez por quadro.
 * Só com ponteiro fino e sem movimento reduzido; no toque, o botão fica só com a troca de cor. Não renderiza nada.
 */
export function ButtonGlow() {
  useEffect(() => {
    if (!window.matchMedia(FINE_POINTER_MOTION).matches) return;

    let frame = 0;
    let last: PointerEvent | null = null;
    const paint = () => {
      frame = 0;
      if (!last) return;
      const button = (last.target as Element | null)?.closest?.<HTMLElement>(".btn-luz");
      if (!button) return;
      const r = button.getBoundingClientRect();
      button.style.setProperty("--x", `${(last.clientX - r.left).toFixed(0)}px`);
      button.style.setProperty("--y", `${(last.clientY - r.top).toFixed(0)}px`);
    };
    const onMove = (e: PointerEvent) => {
      last = e;
      if (!frame) frame = requestAnimationFrame(paint);
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
