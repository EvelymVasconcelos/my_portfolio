"use client";

import { useTranslations, useMessages } from "next-intl";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { GithubIcon } from "@/components/ui/GithubIcon";
import { Badge } from "@/components/ui/Badge";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { FadeInView } from "@/components/animations/FadeInView";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  title: string;
  description: string;
  stack: string[];
  category: string;
  github: string | null;
  live: string | null;
  image: string;
}

type FilterKey = "all" | "frontend" | "backend" | "fullstack";

interface Filter {
  key: FilterKey;
  label: string;
}

export const Projects = () => {
  const t = useTranslations("projects");
  const messages = useMessages() as unknown as { projects: { items: Project[] } };
  const projects = messages.projects.items;

  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  const filters: Filter[] = [
    { key: "all",       label: t("filters.all") },
    { key: "frontend",  label: t("filters.frontend") },
    { key: "backend",   label: t("filters.backend") },
    { key: "fullstack", label: t("filters.fullstack") },
  ];

  const filteredProjects =
    activeFilter === "all"
      ? projects
      : projects.filter((p) => p.category === activeFilter);

  return (
    <section id="projects" aria-label={t("label")} className="relative isolate py-28">
      <SectionDivider />

      <div className="container-content section-padding">

        {/* ── Section header ── */}
        <FadeInView className="mb-12 flex flex-col items-center text-center gap-2">
          {/* Samsung section label — uppercase, sem pílula */}
          <Badge variant="section">{t("label")}</Badge>
          <h2 className="font-display text-h1 font-bold text-text">{t("title")}</h2>
          <p className="max-w-md text-body text-text-2">{t("subtitle")}</p>
        </FadeInView>

        {/* ── Filter tabs — Samsung segmented control ── */}
        <FadeInView delay={0.1} className="mb-10 flex justify-center">
          <div
            role="tablist"
            aria-label={t("filter_aria_label")}
            className="flex items-center gap-0.5 rounded-xs border border-line bg-surface-2 p-0.5 shadow-soft-sm"
          >
            {filters.map(({ key, label }) => (
              <button
                key={key}
                role="tab"
                aria-selected={activeFilter === key}
                onClick={() => setActiveFilter(key)}
                className={cn(
                  "relative rounded-xs px-4 py-1.5 text-caption font-medium transition-colors duration-150",
                  "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-focus",
                  activeFilter === key
                    ? "text-on-accent"
                    : "text-text-2 hover:text-text"
                )}
              >
                {activeFilter === key && (
                  <motion.span
                    layoutId="filter-pill"
                    className="absolute inset-0 rounded-xs bg-accent"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative">{label}</span>
              </button>
            ))}
          </div>
        </FadeInView>

        {/* ── Projects grid ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filteredProjects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

// ─── Samsung-style project card ───────────────────────────────────────────────
// • Imagem limpa — sem overlay gradient, sem badge sobreposto (Apple pattern)
// • Categoria como texto acima do título — Samsung pattern
// • Borda 1px, sombra lilás sutil
// • Hover: borda lilás, sombra levemente maior
// ─────────────────────────────────────────────────────────────────────────────
const ProjectCard = ({ project, index }: { project: Project; index: number }) => {
  const t = useTranslations("projects");

  return (
    <FadeInView delay={index * 0.06}>
      <div
        className={cn(
          "group flex h-full flex-col overflow-hidden rounded-md",
          "border border-line bg-surface",
          "shadow-soft-sm",
          "transition-all duration-200",
          "hover:border-accent/30 hover:shadow-soft-lg"
        )}
      >
        {/* ── Imagem — limpa, sem overlay (Samsung) ── */}
        <div className="relative h-44 w-full overflow-hidden bg-surface-2">
          <Image
            src={project.image}
            alt={`Imagem do projeto ${project.title}`}
            fill
            className="object-cover transition-transform duration-400 group-hover:scale-[1.04]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>

        {/* ── Conteúdo ── */}
        <div className="flex flex-1 flex-col gap-3 p-5">

          {/* Categoria — texto pequeno Samsung, acima do título */}
          <span className="text-label uppercase tracking-widest text-accent-text font-semibold">
            {project.category}
          </span>

          {/* Título */}
          <h3 className="font-display text-h3 font-bold text-text leading-snug">
            {project.title}
          </h3>

          {/* Descrição */}
          <p className="flex-1 text-caption leading-relaxed text-text-2">
            {project.description}
          </p>

          {/* Stack tags — Samsung chips */}
          <div className="flex flex-wrap gap-1.5">
            {project.stack.map((tech) => (
              <Badge key={tech} variant="default" size="sm">
                {tech}
              </Badge>
            ))}
          </div>

          {/* Links */}
          {(project.github || project.live) && (
            <div className="flex items-center gap-2 border-t border-line pt-3">
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${t("github_label")} — ${project.title}`}
                  className={cn(
                    "flex items-center gap-1.5 rounded-xs px-3 py-1.5 text-caption font-medium",
                    "text-text-2 hover:text-text hover:bg-surface-2",
                    "transition-colors duration-150",
                    "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-focus"
                  )}
                >
                  <GithubIcon className="h-3.5 w-3.5" />
                  GitHub
                </a>
              )}
              {project.live && (
                <a
                  href={project.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${t("live_label")} — ${project.title}`}
                  className={cn(
                    "flex items-center gap-1.5 rounded-xs px-3 py-1.5 text-caption font-medium",
                    "text-accent-text hover:bg-accent/10",
                    "transition-colors duration-150",
                    "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-focus"
                  )}
                >
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  Ver
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </FadeInView>
  );
};
