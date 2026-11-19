import { cn } from "@/lib/utils";

/**
 * Rótulo numerado e título de seção, como na referência. O título recebe o foco ao seguir uma âncora
 * (`tabindex=-1`), e a seção o usa em `aria-labelledby`. O movimento do título entra no bloco de movimento.
 */
export function SectionHeading({
  number,
  label,
  id,
  title,
  className,
}: {
  number: string;
  label: string;
  id: string;
  title: string;
  className?: string;
}) {
  return (
    <div>
      <p className="mb-5 type-eyebrow text-accent-text">
        <span aria-hidden="true">{number} · </span>
        {label}
      </p>
      <h2 id={id} tabIndex={-1} className={cn("type-display text-text", className)}>
        {title}
      </h2>
    </div>
  );
}
