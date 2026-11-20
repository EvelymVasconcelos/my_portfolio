"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Controles de uma faixa com rolagem horizontal nativa (`targetId`), portados da referência (spec `recomendacoes`):
 * - setas que avançam um cartão por vez (com movimento reduzido, o salto é instantâneo) e nunca avançam sozinhas;
 * - contador "01 / 03" e barra de progresso (decorativos) e uma região viva que anuncia a recomendação atual depois de
 *   cada clique, para quem usa leitor de tela;
 * - nas pontas, a seta fica com `aria-disabled` e não `disabled`: assim o foco continua nela;
 * - `data-at-start` / `data-at-end` na faixa, que o CSS usa para esmaecer só as bordas que ainda têm conteúdo.
 * Quando todos os cartões cabem na tela, os controles somem. Sem JavaScript, nem aparecem (CSS `.carousel-controls`)
 * e a faixa continua rolável.
 */
export function CarouselControls({
  targetId,
  prevLabel,
  nextLabel,
  announcements,
}: {
  targetId: string;
  prevLabel: string;
  nextLabel: string;
  /** Uma frase por cartão, já traduzida ("Recomendação 2 de 3: Nome"). */
  announcements: readonly string[];
}) {
  const [state, setState] = useState({
    start: true,
    end: false,
    index: 1,
    total: 0,
    progress: 0,
    overflow: false,
  });
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    const track = document.getElementById(targetId);
    if (!track) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const max = Math.max(1, track.scrollWidth - track.clientWidth);
      const overflow = track.scrollWidth - track.clientWidth > 4;
      const start = track.scrollLeft <= 4;
      const end = track.scrollLeft >= max - 4;
      const total = track.children.length;
      const index = end ? total : Math.min(total, Math.round(track.scrollLeft / stepOf(track)) + 1);
      track.toggleAttribute("data-at-start", start);
      track.toggleAttribute("data-at-end", end);
      setState({
        start,
        end,
        index,
        total,
        progress: Math.min(1, track.scrollLeft / max),
        overflow,
      });
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    track.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(onScroll);
    ro.observe(track);
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, [targetId]);

  function go(direction: 1 | -1) {
    const track = document.getElementById(targetId);
    if (!track) return;
    if ((direction === -1 && state.start) || (direction === 1 && state.end)) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollBy({ left: direction * stepOf(track), behavior: reduce ? "auto" : "smooth" });
    const target = Math.min(Math.max(state.index + direction, 1), state.total);
    setAnnouncement(announcements[target - 1] ?? "");
  }

  const button = cn(
    buttonVariants({ variant: "secondary", size: "icon" }),
    "aria-disabled:cursor-default aria-disabled:opacity-35"
  );
  return (
    <div className={cn("carousel-controls items-center gap-4", !state.overflow && "invisible")}>
      <div aria-hidden="true" className="hidden items-center gap-3 sm:flex">
        <span className="font-mono text-[0.8rem] tracking-[0.08em] text-text-2 tabular-nums">
          {pad(state.index)} <span className="text-text-3">/ {pad(state.total || 1)}</span>
        </span>
        <span className="relative h-0.5 w-24 overflow-hidden rounded-full bg-line">
          <span
            className="absolute inset-y-0 left-0 rounded-full bg-accent transition-[width] duration-300"
            style={{ width: `${Math.max(8, state.progress * 100)}%` }}
          />
        </span>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          className={button}
          aria-label={prevLabel}
          aria-controls={targetId}
          aria-disabled={state.start || undefined}
          tabIndex={state.overflow ? undefined : -1}
          onClick={() => go(-1)}
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>
        <button
          type="button"
          className={button}
          aria-label={nextLabel}
          aria-controls={targetId}
          aria-disabled={state.end || undefined}
          tabIndex={state.overflow ? undefined : -1}
          onClick={() => go(1)}
        >
          <ChevronRight className="h-5 w-5" aria-hidden />
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}

/** Distância de um cartão ao próximo: largura do primeiro mais o espaço entre eles. */
function stepOf(track: HTMLElement) {
  const card = track.firstElementChild as HTMLElement | null;
  const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
  return card ? card.offsetWidth + gap : track.clientWidth;
}
