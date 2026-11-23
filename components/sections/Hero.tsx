import type { CSSProperties } from "react";
import { ArrowRight, Download } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { HeroPointer } from "@/components/motion/HeroPointer";
import { NameWave } from "@/components/motion/NameWave";
import { SplitText } from "@/components/motion/SplitText";
import { HeroSceneLoader } from "@/components/scene/HeroSceneLoader";
import { HeroBackdrop } from "@/components/sections/HeroBackdrop";
import { buttonVariants } from "@/components/ui/Button";
import { BUILT_AT } from "@/lib/content/career";
import { CV_DISPONIVEL, CV_URL } from "@/lib/cv";

/** Estrelinhas de quatro pontas perto do nome ("detalhes delicados" do protótipo): posição, tamanho e atraso. */
const SPARKLES = [
  { left: "46%", top: "2%", size: 22, delay: "0s" },
  { left: "58%", top: "30%", size: 13, delay: "1.1s" },
  { left: "-2.5%", top: "44%", size: 15, delay: "2.2s" },
  { left: "50%", top: "66%", size: 18, delay: ".6s" },
  { left: "31%", top: "96%", size: 12, delay: "1.7s" },
];
const SPARKLE_PATH =
  "M12 0c.6 6.6 5.4 11.4 12 12-6.6.6-11.4 5.4-12 12-.6-6.6-5.4-11.4-12-12C6.6 11.4 11.4 6.6 12 0Z";

/**
 * Hero de servidor: HTML completo e final sem JavaScript. O nome entra letra a letra (só CSS) e ganha a onda sob o
 * ponteiro; o fundo tem formas em traço fino e uma luz que seguem o ponteiro (ilhas mínimas, decisão 11 da design).
 * À direita, a imagem estática da cena (a Evelym programando), por tema, em CSS (.hero-scene em globals.css); a cena
 * 3D entra por cima depois do carregamento, quando pode rodar (components/scene/HeroSceneLoader.tsx).
 */
export async function Hero() {
  const t = await getTranslations("hero");
  const tA11y = await getTranslations("accessibility");
  const locale = await getLocale();
  const cvUrl = CV_URL[locale] ?? CV_URL.pt;

  return (
    <section
      id="hero"
      aria-labelledby="hero-title"
      className="band flex min-h-[calc(100svh-var(--header-h))] flex-col"
    >
      <HeroBackdrop />
      <div aria-hidden="true" className="hero-glow" />
      <HeroPointer targetId="hero" />
      <div className="container-site grid flex-1 items-center gap-10 py-16 lg:grid-cols-2 lg:gap-12 lg:py-24">
        <div className="flex flex-col gap-7">
          <p className="flex items-center gap-2.5 type-eyebrow text-text-2">
            <span aria-hidden="true" className="status-dot h-2 w-2 shrink-0 rounded-full bg-ok" />
            {t("status")}
          </p>

          <div className="relative">
            <span className="sparkles" aria-hidden="true">
              {SPARKLES.map((s) => (
                <svg
                  key={`${s.left}-${s.top}`}
                  viewBox="0 0 24 24"
                  style={
                    {
                      left: s.left,
                      top: s.top,
                      "--t": `${s.size}px`,
                      "--a": s.delay,
                    } as CSSProperties
                  }
                >
                  <path fill="currentColor" d={SPARKLE_PATH} />
                </svg>
              ))}
            </span>
            <SplitText
              as="h1"
              id="hero-title"
              tabIndex={-1}
              mode="load"
              letters
              text={t("name")}
              className="max-w-[9ch] type-giant text-text"
            />
            <NameWave targetId="hero-title" />
          </div>

          <p className="type-lead max-w-[60ch]">{t("tagline")}</p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <a href="#projects" className={buttonVariants({ variant: "primary", size: "lg" })}>
              <ArrowRight className="h-4 w-4" aria-hidden />
              {t("cta_projects")}
            </a>
            {CV_DISPONIVEL && (
              <a
                href={cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: "secondary", size: "lg" })}
              >
                <Download className="h-4 w-4" aria-hidden />
                {t("cta_cv")}
                <span className="sr-only"> ({tA11y("open_link_new_tab")})</span>
              </a>
            )}
          </div>
        </div>

        {/* Imagem da cena: o navegador baixa só a do tema ativo. Descrita em texto para o leitor de tela. */}
        <div
          role="img"
          aria-label={t("scene_alt")}
          className="hero-scene mx-auto w-full max-w-[34rem] lg:max-w-none"
        >
          <HeroSceneLoader
            labels={{
              editorTitle: t("scene.editor_title"),
              testsTitle: t("scene.tests_title"),
              testsRunning: t("scene.tests_running"),
              testsPassed: t("scene.tests_passed"),
              deployWaiting: t("scene.deploy_waiting"),
              deployLive: t("scene.deploy_live"),
            }}
          />
        </div>
      </div>

      <div className="border-y border-line">
        <div className="container-site flex flex-wrap items-center gap-x-7 gap-y-3 py-5">
          <p className="type-eyebrow">{t("built_label")}</p>
          <ul
            aria-label={t("built_label")}
            className="flex flex-wrap gap-x-7 gap-y-2 font-display text-lg font-bold text-text-2"
          >
            {BUILT_AT.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
