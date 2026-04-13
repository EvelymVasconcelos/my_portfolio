import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

// ─── Samsung Design System — Button ──────────────────────────────────────────
// Baseado nos prints do Samsung Design System (developer.samsung.com/design-system):
//
// • Border radius: 4px (xs) — Samsung usa cantos quase retos, nunca arredondados como Apple
// • Primary: fundo lilás sólido, texto branco, sem shadow/glow
// • Secondary ("Saber mais" / "Read More" style): fundo branco, borda fina (1px) cor texto,
//   texto escuro — este é o padrão dos botões secundários Samsung
// • Sem active:scale — Samsung não usa bounce/press
// • Font: Roboto Medium (500), tracking slightly open — herda do body
// ─────────────────────────────────────────────────────────────────────────────

export const buttonVariants = cva(
  // Base: sem glow, sem scale, sem rounded generoso
  "inline-flex items-center justify-center gap-2 rounded-xs font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 select-none",
  {
    variants: {
      variant: {
        // Lilac sólido — texto SEMPRE branco, nunca herdar cor do tema
        primary:
          "bg-accent-primary !text-white hover:bg-[var(--accent-primary-hover)]",

        // Samsung "Read More" / "Download CV" style:
        // Fundo branco, borda fina cinza, texto escuro.
        // Hover: fundo escurece levemente (Samsung pattern) — sem mudar para lilás
        secondary:
          "bg-surface-elevated border border-text-muted text-text-primary hover:bg-[#EBEBEB] dark:hover:bg-surface",

        // Ghost: sem borda, sem fundo — texto muda de cor
        ghost:
          "text-text-secondary hover:text-text-primary hover:bg-surface",

        // Danger
        danger:
          "bg-accent-danger text-white hover:opacity-90",

        // Outline: borda lilás, fill no hover — versão colorida do secondary
        outline:
          "border border-accent-primary text-accent-primary bg-transparent hover:bg-accent-primary hover:text-white",

        // Link: texto sublinhado
        link:
          "text-accent-primary underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm:        "h-8 px-4 text-caption",
        md:        "h-10 px-6 text-body",
        lg:        "h-12 px-8 text-body",
        icon:      "h-10 w-10 p-0",
        "icon-sm": "h-8 w-8 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export function Button({
  className,
  variant,
  size,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}
