import { ArrowUpRight, CalendarClock, Download, Plus } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { buttonVariants } from "@/components/ui/Button";
import { ContactForm } from "./ContactForm";
import { CHANNELS, scheduleLink } from "@/lib/contact/channels";
import { CV_URL } from "@/lib/cv";
import { cn } from "@/lib/utils";

/**
 * Contato, de servidor, como na referência: canais, "Baixar CV", o cartão "Agendar call" e o formulário num <details>
 * nativo, fechado, que abre por teclado e anuncia o estado sem JavaScript. Sem link de agenda, o cartão abre um e-mail
 * com o assunto preenchido (`scheduleLink`).
 */
export async function Contact() {
  const t = await getTranslations("contact");
  const tA11y = await getTranslations("accessibility");
  const locale = await getLocale();
  const cvUrl = CV_URL[locale] ?? CV_URL.pt;
  const newTab = <span className="sr-only"> ({tA11y("open_link_new_tab")})</span>;
  const tNav = await getTranslations("nav");
  const schedule = scheduleLink(tNav("schedule_subject"));

  return (
    <section id="contact" aria-labelledby="contact-title" className="band-invert py-24 lg:py-40">
      <div className="container-site">
        <SectionHeading
          number="07"
          label={t("label")}
          id="contact-title"
          title={t("title")}
          size="giant"
        />
        <p className="mt-6 type-lead">{t("subtitle")}</p>

        <div className="mt-14 grid gap-12 lg:mt-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-20">
          <div className="flex flex-col gap-8">
            <ul data-reveal="children" className="border-t border-line">
              {CHANNELS.map((channel) => {
                const external = !channel.href.startsWith("mailto:");
                return (
                  <li key={channel.id} className="group relative border-b border-line">
                    <a
                      href={channel.href}
                      target={external ? "_blank" : undefined}
                      rel={external ? "noopener noreferrer" : undefined}
                      className="flex items-center justify-between gap-4 rounded-md py-5 transition-colors hover:bg-surface"
                    >
                      <span className="flex min-w-0 flex-col gap-1">
                        <span className="type-eyebrow">{t(`channels.${channel.id}`)}</span>{" "}
                        <span className="font-semibold break-words text-text sm:text-lg">
                          {channel.display}
                        </span>
                      </span>
                      {external && newTab}
                      <ArrowUpRight
                        aria-hidden
                        className="h-5 w-5 shrink-0 text-text-2 transition-transform group-hover:text-accent-text motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5"
                      />
                    </a>
                  </li>
                );
              })}
            </ul>

            <a
              href={cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({
                variant: "secondary",
                size: "lg",
                className: "self-start",
              })}
            >
              <Download className="h-4 w-4" aria-hidden />
              {t("cv")}
              {newTab}
            </a>
          </div>

          <div className="flex flex-col gap-5">
            <a
              href={schedule.href}
              {...(schedule.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="flex items-center gap-5 rounded-2xl border border-accent bg-surface p-6 transition-colors hover:bg-surface-2"
            >
              <span
                aria-hidden="true"
                className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-accent text-on-accent"
              >
                <CalendarClock className="h-5 w-5" />
              </span>
              <span className="flex flex-col gap-1">
                <span className="font-display text-xl font-bold text-text">
                  {t("agenda_label")}
                </span>
                <span className="text-text-2">
                  {t(schedule.external ? "agenda_value" : "agenda_value_email")}
                </span>
              </span>
              {schedule.external && newTab}
            </a>

            <details className="group/form rounded-2xl border border-line bg-surface">
              <summary
                className={cn(
                  "flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl p-6",
                  "font-display text-xl font-bold text-text [&::-webkit-details-marker]:hidden"
                )}
              >
                {t("write_toggle")}
                <Plus
                  aria-hidden
                  className="h-5 w-5 shrink-0 text-accent-text transition-transform group-open/form:rotate-45"
                />
              </summary>
              <div className="px-6 pb-6">
                <noscript>
                  <p className="mb-5 text-text-2">{t("noscript")}</p>
                </noscript>
                <ContactForm />
              </div>
            </details>
          </div>
        </div>
      </div>
    </section>
  );
}
