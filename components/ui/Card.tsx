import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

// ─── Samsung Design System — Card ────────────────────────────────────────────
// - Default: solid white/surface background, 1px border, subtle blue-tinted shadow
// - No glassmorphism (backdrop-blur is an Apple pattern)
// - Border radius: 12px (md) — Samsung cards are functional, not over-rounded
// - Hover: border shifts to Samsung Blue accent, shadow deepens

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "solid" | "outline" | "flat";
  hoverable?: boolean;
}

export function Card({
  className,
  variant = "solid",
  hoverable = false,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-md overflow-hidden",
        // solid — white card with Samsung-style blue-tinted shadow
        variant === "solid" && [
          "bg-surface border border-line",
          "shadow-soft-sm",
        ],
        // outline — just border, transparent background
        variant === "outline" && "border border-line bg-transparent",
        // flat — no border, no shadow, just background
        variant === "flat" && "bg-surface-2",
        // hoverable — border + shadow deepen toward Samsung Blue
        hoverable && [
          "cursor-pointer transition-all duration-200",
          "hover:border-accent/30 hover:shadow-soft-lg",
        ],
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pb-0", className)} {...props} />;
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6", className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("p-6 pt-0 flex items-center gap-3", className)}
      {...props}
    />
  );
}
