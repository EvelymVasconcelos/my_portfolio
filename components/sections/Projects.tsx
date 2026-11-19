import { ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PipelineDiagram } from "@/components/sections/PipelineDiagram";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { FEATURED_PROJECT_ID, PROJECTS, type Project } from "@/lib/content/projects";

const pad = (n: number) => String(n).padStart(2, "0");

/** Projetos, de servidor, como na referência: um caso em destaque e os demais em lista numerada. */
export async function Projects() {
  const t = await getTranslations("projects");
  const tA11y = await getTranslations("accessibility");
  const newTab = tA11y("open_link_new_tab");

  const featured = PROJECTS.find((p) => p.id === FEATURED_PROJECT_ID) ?? PROJECTS[0];
  const others = PROJECTS.filter((p) => p.id !== featured.id);
  const item = (p: Project, key: string) => t(`items.${p.id}.${key}`);
  const stack = (p: Project) =>
    t.has(`items.${p.id}.stack`) ? item(p, "stack") : p.stack.join(" · ");

  return (
    <section id="projects" aria-labelledby="projects-title" className="band py-24 lg:py-40">
      <div className="container-site">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-end">
          <SectionHeading number="03" label={t("label")} id="projects-title" title={t("title")} />
          <p className="type-lead">{t("subtitle")}</p>
        </div>

        <article
          aria-labelledby={`project-${featured.id}`}
          data-reveal="self"
          className="mt-16 flex flex-col gap-5 lg:mt-24 lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-16"
        >
          {/* No celular, o bloco de texto se desfaz (contents) para a imagem entrar logo após o título. */}
          <div className="contents lg:flex lg:flex-col lg:gap-5">
            <p className="order-first type-eyebrow">
              <span aria-hidden="true">01 · </span>
              {item(featured, "context")}
            </p>
            <h3 id={`project-${featured.id}`} className="order-first type-title text-text">
              {item(featured, "title")}
            </h3>
            <p className="text-lg leading-relaxed text-text-2">{item(featured, "description")}</p>

            {t.has(`items.${featured.id}.did`) && (
              <dl className="border-t border-line pt-4">
                <dt className="type-eyebrow">{t("did_label")}</dt>
                <dd className="mt-2 leading-relaxed text-text">{item(featured, "did")}</dd>
              </dl>
            )}

            <p className="type-eyebrow leading-relaxed">{stack(featured)}</p>
          </div>

          <div className="order-first my-3 overflow-hidden rounded-2xl border border-line bg-surface lg:order-none lg:my-0">
            <PipelineDiagram />
          </div>
        </article>

        <h3 className="mt-20 type-eyebrow lg:mt-28">{t("others_label")}</h3>
        <ol data-reveal="children" className="mt-6 border-t border-line">
          {others.map((project, index) => {
            const title = item(project, "title");
            return (
              <li
                key={project.id}
                className="group relative grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-5 gap-y-1 border-b border-line py-5 transition-colors hover:bg-surface lg:grid-cols-[3rem_minmax(0,1fr)_auto_auto] lg:py-6"
              >
                <span aria-hidden="true" className="font-mono text-[0.78rem] text-text-3">
                  {pad(index + 2)}
                </span>
                <div className="flex flex-col gap-1 lg:flex-row lg:items-baseline lg:gap-5">
                  <h4 className="font-display text-xl font-bold text-text lg:text-2xl">
                    {project.url ? (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-md after:absolute after:inset-0 after:content-['']"
                      >
                        {title}
                        <span className="sr-only"> ({newTab})</span>
                      </a>
                    ) : (
                      title
                    )}
                  </h4>
                  <p className="text-text-2">{item(project, "context")}</p>
                </div>
                <p className="col-start-2 row-start-2 type-eyebrow lg:col-start-auto lg:row-start-auto">
                  {stack(project)}
                </p>
                {project.url && (
                  <ArrowUpRight
                    aria-hidden
                    className="col-start-3 row-span-2 row-start-1 h-5 w-5 text-text-2 transition-transform group-hover:text-accent-text motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5 lg:col-start-auto lg:row-span-1 lg:row-start-auto"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
