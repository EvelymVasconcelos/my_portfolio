import { SplitText } from "@/components/motion/SplitText";
import { cn } from "@/lib/utils";

/**
 * Rótulo numerado e título de seção, como na referência. O título entra palavra por palavra ao rolar
 * (components/motion/SplitText.tsx), ganha o sublinhado em curva e recebe o foco ao seguir uma âncora
 * (`tabindex=-1`, components/layout/AnchorFocus.tsx); a seção o usa em `aria-labelledby`.
 */
export function SectionHeading({
  number,
  label,
  id,
  title,
  className,
  size = "display",
}: {
  number: string;
  label: string;
  id: string;
  title: string;
  className?: string;
  size?: "display" | "giant";
}) {
  return (
    <div>
      <p className="mb-5 type-eyebrow text-accent-text">
        <span aria-hidden="true">{number} · </span>
        {label}
      </p>
      <SplitText
        id={id}
        tabIndex={-1}
        text={title}
        className={cn(size === "giant" ? "type-giant" : "type-display", "text-text", className)}
      />
    </div>
  );
}
