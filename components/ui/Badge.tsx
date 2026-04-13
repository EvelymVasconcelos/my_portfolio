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
          "text-accent-primary text-label uppercase tracking-widest",

        // ── Samsung chip neutro ──
        default:
          "rounded-xs border border-border bg-surface text-text-secondary",

        // ── Chip lilás (skills, filtros ativos) ──
        primary:
          "rounded-xs border border-accent-primary/20 bg-accent-primary/10 text-accent-primary",

        // ── Chip lilás claro ──
        secondary:
          "rounded-xs border border-accent-secondary/20 bg-accent-secondary/10 text-accent-secondary",

        // ── Status: disponível ──
        success:
          "rounded-full border border-accent-success/20 bg-accent-success/10 text-accent-success",

        // ── Atenção ──
        warning:
          "rounded-xs border border-accent-warning/20 bg-accent-warning/10 text-accent-warning",

        // ── Erro / Danger ──
        danger:
          "rounded-xs border border-accent-danger/20 bg-accent-danger/10 text-accent-danger",

        // ── Só borda ──
        outline:
          "rounded-xs border border-border bg-transparent text-text-secondary",
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
