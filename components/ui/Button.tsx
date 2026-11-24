import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Estilos de botão; também usados em links com cara de botão (`<a className={buttonVariants()}>`). O botão não se
 * desloca no hover: a cor muda devagar e uma luz acompanha o ponteiro por dentro (`.btn-luz` em globals.css, posição
 * gravada por components/motion/ButtonGlow.tsx). Ao clicar, ele afunda de leve.
 */
export const buttonVariants = cva(
  [
    "btn-luz relative isolate inline-flex items-center justify-center gap-2 overflow-hidden rounded-md font-semibold select-none",
    "transition-[transform,background-color,border-color,color,box-shadow] duration-300 ease-(--ease-out-soft)",
    "motion-safe:active:scale-[0.97]",
    "disabled:pointer-events-none disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        primary:
          "btn-luz-clara bg-accent text-on-accent hover:shadow-[0_8px_26px_-10px_var(--accent)]",
        secondary:
          "border border-line-strong bg-transparent text-text hover:border-accent-text/70 hover:bg-surface",
        ghost: "text-text-2 hover:bg-surface hover:text-text",
        danger: "btn-luz-clara bg-danger text-bg hover:opacity-90",
      },
      size: {
        sm: "min-h-10 px-4 text-[0.92rem]",
        md: "min-h-12 px-5 text-base",
        lg: "min-h-12 px-6 text-base",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

// ComponentProps<"button"> inclui `ref`, que no React 19 é uma prop comum.
interface ButtonProps extends ComponentProps<"button">, VariantProps<typeof buttonVariants> {
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
