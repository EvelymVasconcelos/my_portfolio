import type { CSSProperties } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/sections/SectionHeading";
import {
  currentYearMonth,
  EDUCATION,
  EXPERIENCE,
  RULER_FIRST_YEAR,
  rulerBar,
  rulerYears,
  type Period,
  type YearMonth,
} from "@/lib/content/career";
import { cn } from "@/lib/utils";

const INTL_LOCALE: Record<string, string> = { pt: "pt-BR", en: "en-US", es: "es-ES" };
const ROW = 58; // px entre as barras da régua

/** "jan 2022": mês curto sem ponto, no idioma da página. O CSS põe em caixa alta. */
function formatMonth(ym: YearMonth, locale: string) {
  const [year, month] = ym.split("-").map(Number);
  const name = new Intl.DateTimeFormat(INTL_LOCALE[locale] ?? locale, {
    month: "short",
    timeZone: "UTC",
  })
    .format(Date.UTC(year, month - 1, 15))
    .replace(".", "");
  return `${name} ${year}`;
}

interface RulerRow extends Period {
  id: string;
  name: string;
  note: string | null;
}

/** Trajetória, de servidor, como na referência: régua decorativa (computador), vínculos, formação e idiomas. */
export async function Experience() {
  const t = await getTranslations("experience");
  const tEdu = await getTranslations("education");
  const locale = await getLocale();
  // Página estática: a régua usa o mês do build.
  const now = currentYearMonth();
  const years = rulerYears(now);
  const spanMonths = years.length * 12;
  const yearLeft = (year: number) => `${((year - RULER_FIRST_YEAR) * 12 * 100) / spanMonths}%`;
  const nowEnd = rulerBar({ start: now, end: now }, now);

  // Da mais antiga para a mais recente: a graduação e depois os vínculos.
  const rows: RulerRow[] = [
    ...EDUCATION.map((edu) => ({ ...edu, name: edu.short, note: t("study_note") })),
    ...[...EXPERIENCE].reverse().map((job) => ({ ...job, name: job.company, note: null })),
  ];

  return (
    <section id="experience" aria-labelledby="experience-title" className="band-alt py-24 lg:py-40">
      <div className="container-site">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-end">
          <SectionHeading number="04" label={t("label")} id="experience-title" title={t("title")} />
          {/* O subtítulo descreve a régua, então aparece só onde ela aparece. */}
          <p className="hidden type-lead nav:block">{t("subtitle")}</p>
        </div>

        {/* Régua: decorativa, porque a lista abaixo traz a mesma informação. Some abaixo de 900 px. */}
        <div
          aria-hidden="true"
          className="ruler relative mt-16 hidden nav:block lg:mt-20"
          style={{ height: rows.length * ROW + 34 }}
        >
          {years.map((year) => (
            <div
              key={year}
              className="absolute top-0 bottom-0 w-px bg-line"
              style={{ left: yearLeft(year) }}
            >
              <span className="absolute bottom-0 left-2 font-mono text-[0.72rem] text-text-3">
                {year}
              </span>
            </div>
          ))}
          {rows.map((row, i) => {
            const { left, width } = rulerBar(row, now);
            const current = row.end === null;
            return (
              <div
                key={row.id}
                className={cn(
                  "ruler-bar absolute flex h-11 items-center overflow-hidden rounded-lg px-3.5 text-[0.9rem] font-semibold whitespace-nowrap",
                  current ? "bg-accent text-on-accent" : "bg-surface-2 text-text"
                )}
                style={
                  { left: `${left}%`, width: `${width}%`, top: i * ROW, "--i": i } as CSSProperties
                }
              >
                {row.name}
                {row.note && <span className="ml-2 font-normal text-text-2">· {row.note}</span>}
              </div>
            );
          })}
          <div
            className="absolute top-0 bottom-[22px] w-0.5 bg-accent"
            style={{ left: `${nowEnd.left + nowEnd.width}%` }}
          />
        </div>

        <ol className="mt-14 border-t border-line lg:mt-16">
          {EXPERIENCE.map((job) => {
            const item = (key: string) => t(`items.${job.id}.${key}`);
            const current = job.end === null;
            return (
              <li
                key={job.id}
                className="grid gap-x-10 gap-y-2 border-b border-line py-6 lg:grid-cols-[14rem_minmax(0,1fr)_minmax(0,1.2fr)] lg:py-7"
              >
                <p className={cn("pt-1 type-eyebrow", current && "text-accent-text")}>
                  {formatMonth(job.start, locale)} ·{" "}
                  {job.end ? formatMonth(job.end, locale) : t("present")}
                </p>
                <div>
                  <h3 className="font-display text-xl font-bold text-text">{item("role")}</h3>
                  <p className="mt-1 text-[0.95rem] text-text-2">
                    {item("organization")} · {item("location")}
                  </p>
                </div>
                <p className="leading-relaxed text-text-2">{item("description")}</p>
              </li>
            );
          })}
        </ol>

        <div className="mt-16 grid gap-x-8 gap-y-12 lg:mt-20 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h3 className="type-eyebrow">{tEdu("label")}</h3>
            <ul className="mt-6 grid gap-8 sm:grid-cols-2">
              {EDUCATION.map((edu) => {
                const item = (key: string) => tEdu(`items.${edu.id}.${key}`);
                return (
                  <li key={edu.id} className="border-t border-line pt-5">
                    <h4 className="font-display text-xl font-bold text-text">{item("degree")}</h4>
                    <p className="mt-1 text-text-2">
                      {item("institution")} · {item("location")}
                    </p>
                    <p className="mt-2 text-[0.9rem] text-text-3">
                      {edu.start.slice(0, 4)} · {edu.end?.slice(0, 4)}
                      {tEdu.has(`items.${edu.id}.description`) && <> · {item("description")}</>}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
          <div>
            <h3 className="type-eyebrow">{tEdu("languages_label")}</h3>
            <dl className="mt-6 border-t border-line pt-5">
              {(["pt", "en"] as const).map((lang) => (
                <div key={lang} className="flex items-baseline justify-between gap-4 py-1.5">
                  <dt className="font-semibold text-text">{tEdu(`languages.${lang}`)}</dt>
                  <dd className="text-text-2">{tEdu(`languages.${lang}_level`)}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
