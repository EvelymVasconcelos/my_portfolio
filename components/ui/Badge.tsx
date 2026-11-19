import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

// ─── Samsung Design System — Badge / Chip / Tag ───────────────────────────────
// Princípios Samsung:
// • border-radius: 4px (xs) — tags são quase quadradas, nunca pill-shaped
// • "section" variant: sem pill, só texto uppercase — padrão Samsung para labels de seção
// • Chips de skill/stack: fundo muito sutil, borda fina (1px), 4px radius
// ─────────────────────────────────────────────────────────────────────────────

const badgeVariants = cva(
  "inline-flex items-center gap-1 font-medium transition-colors",
  {
    variants: {
      variant: {
        // ── Samsung section label — sem pílula, sem borda ──
        // Uso: antes de <h2> para identificar a seção (COMPETÊNCIAS, PROJETOS…)
        section:
          "text-accent-text text-label uppercase tracking-widest",

        // ── Samsung chip neutro ──
        default:
          "rounded-xs border border-line bg-surface-2 text-text-2",

        // ── Chip lilás (skills, filtros ativos) ──
        primary:
          "rounded-xs border border-accent/20 bg-accent/10 text-accent-text",

        // ── Chip lilás claro ──
        secondary:
          "rounded-xs border border-accent-2/20 bg-accent-2/10 text-accent-2-text",

        // ── Status: disponível ──
        success:
          "rounded-full border border-ok/20 bg-ok/10 text-ok",

        // ── Atenção ──
        warning:
          "rounded-xs border border-accent-2/20 bg-accent-2/10 text-accent-2-text",

        // ── Erro / Danger ──
        danger:
          "rounded-xs border border-danger/20 bg-danger/10 text-danger",

        // ── Só borda ──
        outline:
          "rounded-xs border border-line bg-transparent text-text-2",
      },
      size: {
        sm: "px-1.5 py-0.5 text-[0.65rem]",
        md: "px-2.5 py-1 text-caption",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}
