"use client";

import { useEffect } from "react";
import { FINE_POINTER_MOTION } from "./media";

/** Inclinação máxima, em graus, para cada lado. */
const MAX_TILT = 8;

/**
 * Foto do Sobre com inclinação 3D e reflexo que acompanham o ponteiro (decisão 11 da design). Grava `--rx`, `--ry`,
 * `--gx`, `--gy` e `--shine` no elemento (`.foto-3d` em globals.css) só enquanto o ponteiro se move sobre ele, e volta
 * ao plano quando ele sai. Só com ponteiro fino e sem movimento reduzido. Não renderiza nada.
 */
export function TiltPhoto({ targetId }: { targetId: string }) {
  useEffect(() => {
    const box = document.getElementById(targetId);
    if (!box || !window.matchMedia(FINE_POINTER_MOTION).matches) return;

    let frame = 0;
    let last: PointerEvent | null = null;
    const paint = () => {
      frame = 0;
      if (!last) return;
      const r = box.getBoundingClientRect();
      const x = (last.clientX - r.left) / r.width;
      const y = (last.clientY - r.top) / r.height;
      box.style.setProperty("--ry", `${((x - 0.5) * 2 * MAX_TILT).toFixed(2)}deg`);
      box.style.setProperty("--rx", `${((0.5 - y) * 2 * MAX_TILT).toFixed(2)}deg`);
      box.style.setProperty("--gx", `${(x * 100).toFixed(1)}%`);
      box.style.setProperty("--gy", `${(y * 100).toFixed(1)}%`);
      box.style.setProperty("--shine", "1");
    };
    const onMove = (e: PointerEvent) => {
      last = e;
      box.classList.add("is-tilting");
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const onLeave = () => {
      last = null;
      box.classList.remove("is-tilting");
      for (const [k, v] of [
        ["--rx", "0deg"],
        ["--ry", "0deg"],
        ["--shine", "0"],
      ])
        box.style.setProperty(k, v);
    };

    box.addEventListener("pointermove", onMove, { passive: true });
    box.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      box.removeEventListener("pointermove", onMove);
      box.removeEventListener("pointerleave", onLeave);
    };
  }, [targetId]);

  return null;
}
