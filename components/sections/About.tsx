"use client";

import { useTranslations, useMessages } from "next-intl";
import Image from "next/image";
import { MapPin, Code2, ShieldCheck, Server, Database } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { FadeInView } from "@/components/animations/FadeInView";
import { StaggerChildren } from "@/components/animations/StaggerChildren";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS = {
  languages: Code2,
  quality:   ShieldCheck,
  infra:     Server,
  data:      Database,
} as const;

type SkillCategoryKey = keyof typeof CATEGORY_ICONS;

interface SkillItem {
  name: string;
  level: string | null;
}

interface SkillGroup {
  label: string;
  items: SkillItem[];
}

interface SkillsMessages {
  skills: {
    categories: Record<SkillCategoryKey, SkillGroup>;
  };
}

export function About() {
  const t = useTranslations("about");
  const messages = useMessages() as unknown as SkillsMessages;
  const categories = messages.skills?.categories ?? {};

  const skillCategories = Object.entries(categories) as [SkillCategoryKey, SkillGroup][];

  return (
    <section
      id="about"
      aria-label={t("label")}
      className="relative py-28 overflow-hidden"
    >
      <SectionDivider />

      <div className="container-content section-padding">

        {/* Section header */}
        <FadeInView className="mb-16 flex flex-col items-center text-center gap-2">
          <Badge variant="section">{t("label")}</Badge>
          <h2 className="font-display text-h1 font-bold text-text-primary">
            {t("title")}
          </h2>
        </FadeInView>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-start">

          {/* ── Left: photo + bio ── */}
          <FadeInView direction="right" className="flex flex-col gap-8">

            {/* Photo + info card */}
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
              <div className="relative shrink-0">
                <div className="h-36 w-36 overflow-hidden rounded-full border-2 border-accent-primary/20 ring-4 ring-accent-primary/10">
                  {/* TODO: replace with real photo */}
                  <Image
                    src="/images/profile.jpeg"
                    alt="Evelym Marinho"
                    width={144}
                    height={144}
                    className="h-full w-full object-cover"
                    priority
                  />
                </div>
                <div
                  aria-hidden
                  className="absolute inset-0 -z-10 rounded-full bg-accent-primary/20 blur-2xl"
                />
              </div>

              <div className="flex flex-col gap-3 text-center sm:text-left">
                <div>
                  <p className="font-display text-h3 font-bold text-text-primary">
                    Evelym Marinho
                  </p>
                  <p className="text-body text-text-secondary">
                    Backend Software Engineer Pleno
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                  <Badge variant="default" size="sm" className="gap-1">
                    <MapPin className="h-3 w-3" aria-hidden />
                    {t("location")}
                  </Badge>
                  <Badge variant="success" size="sm" className="gap-1.5">
                    <span className="relative flex h-1.5 w-1.5" aria-hidden>
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-success opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-success" />
                    </span>
                    {t("available")}
                  </Badge>
                </div>

                {/* Language badges */}
                <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                  <Badge variant="default" size="sm">🇧🇷 {t("lang_pt_level")}</Badge>
                  <Badge variant="default" size="sm">🇺🇸 {t("lang_en_level")}</Badge>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="flex flex-col gap-4">
              <p className="text-body-lg leading-relaxed text-text-secondary">
                {t("bio_1")}
              </p>
              <p className="text-body leading-relaxed text-text-muted">
                {t("bio_2")}
              </p>
            </div>
          </FadeInView>

          {/* ── Right: skills ── */}
          <FadeInView direction="left" className="flex flex-col gap-5">
            <p className="text-caption font-semibold uppercase tracking-widest text-text-muted">
              {t("skills_title")}
            </p>

            <StaggerChildren className="flex flex-col gap-4" staggerDelay={0.07}>
              {skillCategories.map(([key, group]) => {
                const Icon = CATEGORY_ICONS[key];
                return (
                  <div
                    key={key}
                    className={cn(
                      "card-samsung rounded-md p-4",
                      "transition-all duration-200 hover:border-accent-primary/30"
                    )}
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-accent-primary/10">
                        {Icon && <Icon className="h-3.5 w-3.5 text-accent-primary" aria-hidden />}
                      </div>
                      <span className="text-caption font-semibold text-text-primary">
                        {group.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {group.items.map((item) => (
                        <Badge key={item.name} variant="default" size="sm" className="gap-1">
                          {item.name}
                          {item.level && (
                            <span className="ml-1 text-[0.6rem] font-semibold uppercase text-accent-primary">
                              {item.level}
                            </span>
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>
                );
              })}
            </StaggerChildren>
          </FadeInView>
        </div>
      </div>
    </section>
  );
}
