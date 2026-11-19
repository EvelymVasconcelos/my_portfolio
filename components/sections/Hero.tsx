"use client";

import { useTranslations, useMessages, useLocale } from "next-intl";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useTheme } from "@/lib/theme";
import { ArrowDown, Download, ArrowRight, MapPin } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FadeInView } from "@/components/animations/FadeInView";
import { CountUp } from "@/components/animations/CountUp";
import { CV_URL } from "@/lib/cv";

// Lilac brand RGB channels — reused across all background shapes
const L  = "104,82,214";   // --accent-primary light
const LL = "155,122,232";  // --accent-secondary

export function Hero() {
  const t = useTranslations("hero");
  const locale = useLocale();
  const cvUrl = CV_URL[locale] ?? CV_URL.en;
  // `undefined` no servidor e na hidratação, como era o resolvedTheme do next-themes.
  const resolvedTheme = useTheme();
  const messages = useMessages();
  const roles = (messages as unknown as { hero: { roles: string[] } }).hero.roles;
  const [roleIndex, setRoleIndex] = useState(0);

  // Opacity multiplier — shapes need to be ~4× more visible in dark mode
  const m = resolvedTheme === "dark" ? 4 : 1;

  // Mouse parallax — MotionValues are stable refs, no deps needed
  const rawX = useMotionValue(0.5);
  const rawY = useMotionValue(0.5);
  const smoothX = useSpring(rawX, { stiffness: 35, damping: 28 });
  const smoothY = useSpring(rawY, { stiffness: 35, damping: 28 });

  const farX  = useTransform(smoothX, [0, 1], [-14, 14]);
  const farY  = useTransform(smoothY, [0, 1], [-8,   8]);
  const midX  = useTransform(smoothX, [0, 1], [-26, 26]);
  const midY  = useTransform(smoothY, [0, 1], [-16, 16]);
  const nearX = useTransform(smoothX, [0, 1], [ 10, -10]);
  const nearY = useTransform(smoothY, [0, 1], [  6,  -6]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    rawX.set((e.clientX - rect.left) / rect.width);
    rawY.set((e.clientY - rect.top) / rect.height);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const interval = setInterval(() => {
      setRoleIndex((i) => (i + 1) % roles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [roles.length]);

  return (
    <section
      id="hero"
      aria-label="Hero"
      className="relative flex min-h-screen items-center overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* ── Animated background ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">

        {/* Dot grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(${L},${0.07 * m}) 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute inset-x-0 top-0 h-0.5 bg-accent-primary opacity-80" />
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-accent-primary/[0.04] to-transparent" />

        {/* ── FAR layer — big shapes, least movement ── */}
        <motion.div style={{ x: farX, y: farY }} className="absolute inset-0">
          {/* Large rotating circle — top right, bleeds off screen */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 680, height: 680,
              top: "-18%", right: "-10%",
              border: `1px solid rgba(${L},${0.13 * m})`,
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 70, repeat: Infinity, ease: "linear" }}
          />
          {/* Second circle — top left, fills dead space */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 380, height: 380,
              top: "-8%", left: "-6%",
              border: `1px solid rgba(${LL},${0.09 * m})`,
            }}
            animate={{ rotate: -360 }}
            transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
          />
          {/* Square outline — bottom left */}
          <motion.div
            className="absolute rounded-md"
            style={{
              width: 240, height: 240,
              bottom: "6%", left: "1%",
              border: `1px solid rgba(${L},${0.10 * m})`,
            }}
            animate={{ rotate: [0, 6, 0], y: [0, -18, 0] }}
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        {/* ── MID layer — medium depth ── */}
        <motion.div style={{ x: midX, y: midY }} className="absolute inset-0">
          {/* Filled square — mid right */}
          <motion.div
            className="absolute rounded-xs"
            style={{
              width: 64, height: 64,
              top: "38%", right: "14%",
              background: `rgba(${L},${0.09 * m})`,
            }}
            animate={{ rotate: [0, 18, 0], y: [0, -22, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
          />
          {/* Filled square — upper left area */}
          <motion.div
            className="absolute rounded-xs"
            style={{
              width: 40, height: 40,
              top: "10%", left: "18%",
              background: `rgba(${LL},${0.10 * m})`,
            }}
            animate={{ rotate: [0, -14, 0], y: [0, 14, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
          {/* Ring — lower left */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 160, height: 160,
              top: "54%", left: "5%",
              border: `1px solid rgba(${LL},${0.14 * m})`,
            }}
            animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          />
          {/* Pulsing dots — upper left cluster */}
          <motion.div
            className="absolute rounded-full"
            style={{ width: 10, height: 10, top: "22%", left: "9%", background: `rgba(${LL},${0.28 * m})` }}
            animate={{ scale: [1, 1.5, 1], opacity: [0.28, 0.55, 0.28] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute rounded-full"
            style={{ width: 6, height: 6, top: "26%", left: "13%", background: `rgba(${L},${0.22 * m})` }}
            animate={{ scale: [1, 1.8, 1], opacity: [0.22, 0.48, 0.22] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
        </motion.div>

        {/* ── NEAR layer — closest, moves opposite ── */}
        <motion.div style={{ x: nearX, y: nearY }} className="absolute inset-0">
          {/* Code symbol — bottom right */}
          <motion.span
            className="absolute select-none font-mono font-bold leading-none"
            style={{
              fontSize: "10rem",
              bottom: "10%", right: "2%",
              color: `rgba(${L},${0.07 * m})`,
            }}
            animate={{ y: [0, -14, 0], opacity: [0.07 * m, 0.13 * m, 0.07 * m] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          >
            {"</>"}
          </motion.span>
          {/* Rectangle outline — mid area */}
          <motion.div
            className="absolute rounded-sm"
            style={{
              width: 110, height: 70,
              top: "60%", right: "30%",
              border: `1px solid rgba(${L},${0.11 * m})`,
            }}
            animate={{ rotate: [0, -6, 0], y: [0, 12, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          />
          {/* Rectangle outline — top center */}
          <motion.div
            className="absolute rounded-sm"
            style={{
              width: 80, height: 50,
              top: "8%", left: "42%",
              border: `1px solid rgba(${LL},${0.10 * m})`,
            }}
            animate={{ rotate: [0, 5, 0], y: [0, -8, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
          />
          {/* Horizontal accent line */}
          <motion.div
            className="absolute"
            style={{
              width: 90, height: 1,
              top: "30%", right: "7%",
              background: `rgba(${L},${0.22 * m})`,
            }}
            animate={{ scaleX: [1, 1.5, 1], opacity: [0.22 * m, 0.40 * m, 0.22 * m] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          />
        </motion.div>
      </div>

      <div className="container-content section-padding w-full py-10 pt-20 lg:py-16 lg:pt-28">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-12">

          {/* ── Left: text content ── */}
          <div className="flex flex-col gap-4 sm:gap-5">

            <FadeInView delay={0.05}>
              <Badge variant="success" className="w-fit gap-2">
                <span className="relative flex h-2 w-2" aria-hidden>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-success opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-success" />
                </span>
                {t("available")}
              </Badge>
            </FadeInView>

            <FadeInView delay={0.1}>
              <p className="text-body sm:text-body-lg text-text-secondary">
                {t("greeting")} 👋
              </p>
            </FadeInView>

            <FadeInView delay={0.2}>
              <h1
                className="font-display font-black leading-none tracking-tight text-text-primary"
                style={{ fontSize: "clamp(1.75rem, 8vw, 5.5rem)" }}
              >
                {t("name")}
              </h1>
            </FadeInView>

            <FadeInView delay={0.25}>
              <div className="min-h-[2rem] overflow-hidden sm:min-h-[2.5rem]">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={roleIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    className="text-lg font-semibold text-gradient sm:text-h3"
                  >
                    {roles[roleIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </FadeInView>

            <FadeInView delay={0.3}>
              <p className="max-w-md text-sm leading-relaxed text-text-secondary sm:text-body">
                {t("tagline")}
              </p>
            </FadeInView>

            <FadeInView delay={0.38} className="flex flex-col gap-3 pt-1 sm:flex-row sm:flex-wrap sm:items-center">
              <a href="#projects" className="w-full sm:w-auto">
                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                  {t("cta_projects")}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Button>
              </a>
              <a href={cvUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  <Download className="h-4 w-4" aria-hidden />
                  {t("cta_cv")}
                </Button>
              </a>
            </FadeInView>
          </div>

          {/* ── Right: profile card ── */}
          <FadeInView delay={0.3} direction="left" className="hidden sm:flex justify-center lg:justify-end">
            <motion.div
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="card-samsung w-full max-w-sm rounded-md p-6"
            >
              <div className="mb-6 flex items-center gap-4">
                <div className="relative h-16 w-16 shrink-0">
                  <Image
                    src="/images/profile.jpeg"
                    alt="Evelym Marinho"
                    width={64}
                    height={64}
                    className="h-16 w-16 rounded-full object-cover"
                    priority
                  />
                  <span
                    aria-hidden
                    className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-surface-elevated bg-accent-success"
                  />
                </div>
                <div>
                  <p className="font-semibold text-text-primary">Evelym Marinho</p>
                  <p className="flex items-center gap-1 text-caption text-text-secondary">
                    <MapPin className="h-3 w-3" aria-hidden />
                    Manaus, Brasil
                  </p>
                </div>
              </div>

              <div className="mb-5 grid grid-cols-3 gap-2">
                {[
                  { target: 6,  suffix: "+", labelKey: "stat_years" },
                  { target: 2,  suffix: "",  labelKey: "stat_companies" },
                  { target: 2,  suffix: "",  labelKey: "stat_projects" },
                ].map(({ target, suffix, labelKey }) => (
                  <div
                    key={labelKey}
                    className="flex flex-col items-center rounded-md bg-surface p-3 text-center"
                  >
                    <span className="text-h3 font-bold text-accent-primary">
                      <CountUp target={target} suffix={suffix} />
                    </span>
                    <span className="text-[0.6rem] uppercase tracking-widest text-text-muted">
                      {t(labelKey)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {["Python", "FastAPI", "Django", "Docker", "PostgreSQL", "Kubernetes"].map((tech) => (
                  <Badge key={tech} variant="primary" size="sm">{tech}</Badge>
                ))}
              </div>
            </motion.div>
          </FadeInView>

        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1.5">
        <span className="text-caption text-text-muted">{t("scroll_hint")}</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden
        >
          <ArrowDown className="h-4 w-4 text-text-muted" />
        </motion.div>
      </div>
    </section>
  );
}
