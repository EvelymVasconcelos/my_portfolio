"use client";

import { useEffect, useRef } from "react";
import { canRunScene, readSceneEnv } from "@/lib/scene/can-run-scene";
import { fetchModel } from "@/lib/scene/model";
import type { HeroScene, SceneLabels, SceneState } from "./hero-scene";

type LoaderState = SceneState | "loading" | "captured";

/**
 * Portão e carregamento da cena 3D do Hero (decisão 6 da design). Fica dentro do contêiner `.hero-scene`, cuja
 * imagem de fundo é a versão estática; o estado vai em `data-scene-state` no contêiner.
 *
 * - Só roda se `canRunScene` deixar (movimento reduzido, WebGL, economia de dados, aparelho fraco).
 * - Só começa depois do `load`, com o navegador ocioso e o Hero perto da tela: nunca disputa o LCP.
 * - Movimento reduzido ligado depois, falha ou perda do contexto WebGL: a cena some e a imagem volta.
 * - `?scene-capture` (scripts/render-scene-posters.ts) monta a cena parada no estado final, para gerar o pôster.
 */
export function HeroSceneLoader({ labels }: { labels: SceneLabels }) {
  const markerRef = useRef<HTMLSpanElement>(null);
  const labelsRef = useRef(labels);

  useEffect(() => {
    const container = markerRef.current?.parentElement;
    if (!container) return;
    const setState = (state: LoaderState) => (container.dataset.sceneState = state);
    const capture = new URLSearchParams(window.location.search).has("scene-capture");
    // Testes em navegador sem GPU: a cena não desiste por lentidão (tests/e2e/cena.spec.ts).
    const testMode = (window as Window & { __SCENE_TEST__?: boolean }).__SCENE_TEST__ === true;

    const env = readSceneEnv();
    // Testes e captura do pôster rodam sem GPU, de propósito: para eles, o WebGL por software vale.
    if (capture || testMode) env.softwareWebGL = false;
    if (!capture && !canRunScene(env)) {
      setState("poster");
      return;
    }

    let scene: HeroScene | null = null;
    let cancelled = false;
    let io: IntersectionObserver | null = null;
    let scrollFrame = 0;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const themeObserver = new MutationObserver(() => scene?.setTheme(themeNow()));
    const hero = container.closest("section");

    const toPoster = () => {
      scene?.destroy();
      scene = null;
      setState("poster");
    };
    const onReduce = () => {
      if (reduce.matches) toPoster();
    };
    // A câmera se aproxima conforme o Hero sai da tela (a rolagem nunca é presa).
    const onScroll = () => {
      if (scrollFrame || !scene) return;
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = 0;
        const h = hero?.offsetHeight || window.innerHeight;
        scene?.setProgress(Math.min(1, Math.max(0, window.scrollY / (h * 0.85))));
      });
    };

    async function boot() {
      if (cancelled) return;
      setState("loading");
      try {
        // O modelo da personagem baixa junto com o código da cena, e não depois dele.
        const model = fetchModel();
        model.catch(() => {}); // se o import falhar antes, a recusa do download não vira erro solto no console
        const { createHeroScene } = await import("./hero-scene");
        if (cancelled) return;
        const created = await createHeroScene(container!, {
          model,
          labels: labelsRef.current,
          coarse: window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 900,
          capture,
          noDowngrade: capture || testMode,
          onState: (state) => {
            setState(state);
            if (state === "poster") scene = null;
          },
        });
        if (cancelled) {
          created.destroy();
          return;
        }
        scene = created;
        if (capture) setState("captured");
        themeObserver.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ["class"],
        });
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
      } catch (error) {
        // em desenvolvimento, o motivo aparece no console; em produção, a imagem estática fica no lugar em silêncio
        if (process.env.NODE_ENV !== "production") console.error("[cena 3D]", error);
        if (!cancelled) setState("poster");
      }
    }

    const whenIdle = () => {
      if (typeof window.requestIdleCallback === "function")
        window.requestIdleCallback(() => void boot(), { timeout: 2000 });
      else setTimeout(() => void boot(), 200);
    };
    const start = () => {
      io = new IntersectionObserver(
        (entries) => {
          if (!entries[0].isIntersecting) return;
          io?.disconnect();
          if (capture) void boot();
          else whenIdle();
        },
        { rootMargin: "200px" }
      );
      io.observe(container);
    };

    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    reduce.addEventListener("change", onReduce);

    return () => {
      cancelled = true;
      io?.disconnect();
      themeObserver.disconnect();
      cancelAnimationFrame(scrollFrame);
      reduce.removeEventListener("change", onReduce);
      window.removeEventListener("load", start);
      window.removeEventListener("scroll", onScroll);
      scene?.destroy();
    };
  }, []);

  return <span ref={markerRef} hidden />;
}

const themeNow = () => (document.documentElement.classList.contains("dark") ? "dark" : "light");
