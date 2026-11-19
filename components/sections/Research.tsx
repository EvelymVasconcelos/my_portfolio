import type { CSSProperties, ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { doiUrl, PUBLICATIONS } from "@/lib/content/research";

/**
 * Pesquisa, de servidor: as publicações com o mesmo peso da Trajetória, uma por cartão (`.paper`), com o título
 * original no idioma em que foi publicado. Os cartões se empilham presos à rolagem; o focado fica por cima.
 */
export async function Research() {
  const t = await getTranslations("research");
  const tA11y = await getTranslations("accessibility");

  return (
    <section id="research" aria-labelledby="research-title" className="band py-24 lg:py-40">
      <div className="container-site">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-end">
          <SectionHeading number="05" label={t("label")} id="research-title" title={t("title")} />
          <p className="type-lead">{t("subtitle")}</p>
        </div>

        {/* Pilha presa à rolagem (components/motion/ScrollConductor.tsx); sem movimento, cartões em sequência. */}
        <div className="pilha" data-scrub="stack">
          {PUBLICATIONS.map((pub, i) => {
            const item = (key: string) => t(`items.${pub.id}.${key}`);
            const has = (key: string) => t.has(`items.${pub.id}.${key}`);
            const facts: Array<[string, ReactNode]> = [];
            if (has("role")) facts.push([t("role_label"), item("role")]);
            if (has("result")) facts.push([t("result_label"), item("result")]);
            facts.push([t("place_label"), `${item("place")} · ${pub.year}`]);
            if (has("status")) facts.push([t("status_label"), item("status")]);
            if (pub.doi) {
              facts.push([
                t("doi_label"),
                <a
                  key="doi"
                  href={doiUrl(pub.doi)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md text-accent-text underline-offset-4 hover:underline"
                >
                  {pub.doi}
                  <span className="sr-only"> ({tA11y("open_link_new_tab")})</span>
                </a>,
              ]);
            }

            return (
              <article
                key={pub.id}
                aria-labelledby={`paper-${pub.id}`}
                className="paper"
                style={{ "--i": i } as CSSProperties}
              >
                <div>
                  <p className="type-eyebrow text-accent-text">{item("venue")}</p>
                  <h3 id={`paper-${pub.id}`} lang={pub.lang} className="mt-4 type-title text-text">
                    {pub.title}
                  </h3>
                  <p className="mt-4 leading-relaxed text-text-2">{item("summary")}</p>
                </div>
                <dl className="grid content-start gap-4">
                  {facts.map(([label, value]) => (
                    <div key={label} className="border-t border-line pt-3">
                      <dt className="type-eyebrow">{label}</dt>
                      <dd className="mt-1 font-semibold break-words text-text">{value}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
