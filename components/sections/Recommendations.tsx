import type { CSSProperties } from "react";
import { ArrowUpRight, Quote } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { CardGlow } from "@/components/motion/CardGlow";
import { CarouselControls } from "@/components/motion/CarouselControls";
import { SectionHeading } from "@/components/sections/SectionHeading";
import {
  LINKEDIN_RECOMMENDATIONS_URL,
  RECOMMENDATIONS,
  initials,
  type Recommendation,
} from "@/lib/content/recommendations";
import { cn } from "@/lib/utils";

const TRACK_ID = "recommendations-track";
/** Acima disso o texto passa das linhas visíveis do cartão e ganha o "Ler completa". */
const CARD_CHARS = 300;
/** Acima disso o destaque passa das 5 linhas. */
const FEATURED_CHARS = 320;

/** Autoria: iniciais (sem foto de terceiros, escondidas do leitor de tela), nome, cargo, relação e mês. */
function Author({
  item,
  relation,
  date,
  accent,
}: {
  item: Recommendation;
  relation: string;
  date: string;
  accent?: boolean;
}) {
  return (
    <figcaption className="rec-author flex items-center gap-3.5">
      <span
        aria-hidden="true"
        className={cn(
          "grid h-11 w-11 shrink-0 place-items-center rounded-full font-mono text-[0.8rem] font-bold tracking-[0.04em]",
          accent ? "bg-accent text-on-accent" : "border border-line-strong bg-surface-2 text-text"
        )}
      >
        {initials(item.name)}
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="font-semibold text-text">{item.name}</span>
        <span className="text-[0.9rem] text-text-2">{item.role}</span>
        <span className="text-[0.82rem] text-text-3">
          {relation} · <time dateTime={item.date}>{date}</time>
        </span>
      </span>
    </figcaption>
  );
}

/**
 * Texto da recomendação, cortado em `lines` linhas com esmaecimento. O "Ler completa" é um <details> nativo: abre sem
 * JavaScript, e o CSS (`.rec-quote`, `:has(details[open])`) solta o corte. O corte é só visual: o leitor de tela
 * recebe o texto inteiro sempre. O botão fica no idioma da página; o texto, no original.
 */
function QuoteText({
  item,
  lines,
  toggle,
  className,
  more,
  less,
}: {
  item: Recommendation;
  lines: number;
  toggle: boolean;
  className: string;
  more: string;
  less: string;
}) {
  return (
    <div
      className="rec-quote"
      data-clamped={toggle ? "" : undefined}
      style={{ "--lines": lines } as CSSProperties}
    >
      <blockquote lang={item.lang} className={cn("rec-quote-text flex flex-col gap-4", className)}>
        {item.text.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </blockquote>
      {toggle ? (
        <details className="rec-more mt-3">
          <summary className="inline-flex cursor-pointer list-none rounded-md text-[0.92rem] font-semibold text-accent-text underline-offset-4 hover:underline [&::-webkit-details-marker]:hidden">
            <span className="rec-more-open">{more}</span>
            <span className="rec-more-close">{less}</span>
          </summary>
        </details>
      ) : null}
    </div>
  );
}

/**
 * Recomendações do LinkedIn (spec `recomendacoes`), de servidor, como na referência: a mais recente em destaque e as
 * demais numa faixa com rolagem horizontal nativa (encaixe por cartão; setas numa ilha de cliente). Textos no idioma
 * original, com `lang`. A página só monta a seção quando há recomendações.
 */
export async function Recommendations() {
  const t = await getTranslations("recommendations");
  const tA11y = await getTranslations("accessibility");
  const locale = await getLocale();
  const month = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  const [featured, ...rest] = RECOMMENDATIONS;
  const quoteLabels = { more: t("read_more"), less: t("read_less") };
  const date = (item: Recommendation) => month.format(new Date(`${item.date}T12:00:00Z`));
  // Em /en e /es, avisa que os textos estão no idioma em que foram escritos.
  const showOriginalNote = RECOMMENDATIONS.some((item) => !item.lang.startsWith(locale));

  return (
    <section
      id="recommendations"
      aria-labelledby="recommendations-title"
      className="band-alt py-24 lg:py-40"
    >
      <div className="container-site">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-end">
          <SectionHeading
            number="06"
            label={t("label")}
            id="recommendations-title"
            title={t("title")}
            className="max-w-[16ch]"
          />
          <div className="flex flex-col gap-4">
            <p className="type-lead">{t("subtitle")}</p>
            <a
              href={LINKEDIN_RECOMMENDATIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1.5 self-start rounded-md font-semibold text-accent-text underline-offset-4 hover:underline"
            >
              {t("linkedin")}
              <ArrowUpRight
                aria-hidden
                className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5"
              />
              <span className="sr-only"> ({tA11y("open_link_new_tab")})</span>
            </a>
          </div>
        </div>

        {/* Destaque: a recomendação mais recente. */}
        <figure
          data-reveal="self"
          className="mt-14 grid gap-8 border-t border-line pt-10 lg:mt-20 lg:grid-cols-[3rem_minmax(0,1fr)] lg:gap-10"
        >
          <Quote aria-hidden className="h-10 w-10 text-accent" />
          <div className="flex max-w-[62ch] flex-col gap-8">
            <QuoteText
              item={featured}
              lines={5}
              toggle={featured.text.join(" ").length > FEATURED_CHARS}
              className="font-display text-[clamp(1.2rem,1.9vw,1.6rem)] leading-[1.4] font-semibold tracking-[-0.01em] text-text"
              {...quoteLabels}
            />
            <Author
              item={featured}
              relation={t(`relation.${featured.relation}`)}
              date={date(featured)}
              accent
            />
          </div>
        </figure>

        {rest.length > 0 && (
          <>
            {/* As demais: faixa horizontal com encaixe por cartão. Focável, para rolar pelo teclado (setas). */}
            <div className="mt-16 flex items-end justify-between gap-6 lg:mt-20">
              <p className="text-[0.9rem] text-text-3">
                {showOriginalNote ? t("original_note") : ""}
              </p>
              <CarouselControls
                targetId={TRACK_ID}
                prevLabel={t("prev")}
                nextLabel={t("next")}
                announcements={rest.map((item, i) =>
                  t("position", { index: i + 1, total: rest.length, name: item.name })
                )}
              />
            </div>
            <div
              id={TRACK_ID}
              role="region"
              aria-roledescription={t("roledescription")}
              aria-label={t("track_label")}
              tabIndex={0}
              data-reveal="children"
              data-at-start=""
              className="rec-track mt-4"
            >
              {rest.map((item) => (
                <figure key={item.id} className="rec-card">
                  <QuoteText
                    item={item}
                    lines={7}
                    toggle={item.text.join(" ").length > CARD_CHARS}
                    className="leading-[1.65] text-text-2"
                    {...quoteLabels}
                  />
                  <Author item={item} relation={t(`relation.${item.relation}`)} date={date(item)} />
                </figure>
              ))}
            </div>
            <CardGlow targetId={TRACK_ID} selector=".rec-card" />
          </>
        )}
      </div>
    </section>
  );
}
