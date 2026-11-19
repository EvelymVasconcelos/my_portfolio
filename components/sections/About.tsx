import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { CountUp } from "@/components/motion/CountUp";
import { TiltPhoto } from "@/components/motion/TiltPhoto";
import { Architecture } from "@/components/sections/Architecture";
import { Skills } from "@/components/sections/Skills";
import { SectionHeading } from "@/components/sections/SectionHeading";

const FACTS = ["location", "education", "now", "research"] as const;

/**
 * Sobre, de servidor: texto, foto com inclinação 3D, quatro fatos curtos, competências (components/sections/Skills.tsx)
 * e, no fim, a sequência presa da arquitetura (components/sections/Architecture.tsx).
 */
export async function About() {
  const t = await getTranslations("about");
  const tA11y = await getTranslations("accessibility");

  return (
    <section id="about" aria-labelledby="about-title" className="band-alt py-24 lg:py-40">
      <div className="container-site">
        <SectionHeading
          number="02"
          label={t("label")}
          id="about-title"
          title={t("title")}
          className="max-w-[30ch]"
        />

        <div className="mt-14 grid gap-10 lg:mt-20 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-16">
          <div id="about-photo" className="foto-3d self-start">
            <div data-reveal="self" className="overflow-hidden rounded-xl border border-line">
              <Image
                src="/images/profile.jpeg"
                alt={tA11y("profile_photo_alt")}
                // Foto atual: 400 × 400 px. Uma versão maior (vertical, 4:5) deixaria a imagem mais nítida aqui.
                width={400}
                height={400}
                sizes="(min-width: 1024px) 22rem, 100vw"
                className="aspect-[4/5] h-auto w-full object-cover object-top"
              />
              <i aria-hidden="true" />
            </div>
          </div>
          <TiltPhoto targetId="about-photo" />

          <div id="about-text" data-reveal="children" className="flex flex-col gap-6">
            <p className="text-xl leading-relaxed text-text">{t("lead")}</p>
            <p className="leading-relaxed text-text-2">{t("bio_1")}</p>
            <p className="leading-relaxed text-text-2">{t("bio_2")}</p>

            <dl className="mt-4 grid gap-x-6 sm:grid-cols-2 xl:grid-cols-4">
              {FACTS.map((fact) => (
                <div
                  key={fact}
                  className="flex items-baseline justify-between gap-4 border-t border-line py-4 sm:block"
                >
                  <dt className="type-eyebrow">{t(`facts.${fact}_label`)}</dt>
                  <dd className="text-right font-semibold text-text sm:mt-2 sm:text-left">
                    {t.rich(`facts.${fact}`, {
                      // Número que conta ao aparecer; o valor final já está no HTML.
                      n: (chunks) => (
                        <span className="tabular-nums" data-count={String(chunks)}>
                          {chunks}
                        </span>
                      ),
                    })}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <CountUp targetId="about-text" />

        <Skills />
        <Architecture />
      </div>
    </section>
  );
}
