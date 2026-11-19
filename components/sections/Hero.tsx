import { ArrowRight, Download } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { buttonVariants } from "@/components/ui/Button";
import { BUILT_AT } from "@/lib/content/career";
import { CV_URL } from "@/lib/cv";

/**
 * Hero de servidor: HTML completo e final sem JavaScript. À direita, a imagem estática da cena (a Evelym
 * programando), por tema, em CSS (.hero-scene em globals.css); a cena 3D entra por cima no bloco 5.
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
      <div className="container-site grid flex-1 items-center gap-10 py-16 lg:grid-cols-2 lg:gap-12 lg:py-24">
        <div className="flex flex-col gap-7">
          <p className="flex items-center gap-2.5 type-eyebrow text-text-2">
            <span aria-hidden="true" className="status-dot h-2 w-2 shrink-0 rounded-full bg-ok" />
            {t("status")}
          </p>

          <h1 id="hero-title" tabIndex={-1} className="max-w-[9ch] type-giant text-text">
            {t("name")}
          </h1>

          <p className="type-lead max-w-[60ch]">{t("tagline")}</p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <a href="#projects" className={buttonVariants({ variant: "primary", size: "lg" })}>
              <ArrowRight className="h-4 w-4" aria-hidden />
              {t("cta_projects")}
            </a>
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
          </div>
        </div>

        {/* Imagem da cena: o navegador baixa só a do tema ativo. Descrita em texto para o leitor de tela. */}
        <div
          role="img"
          aria-label={t("scene_alt")}
          className="hero-scene mx-auto w-full max-w-[34rem] lg:max-w-none"
        />
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
