import { ChevronDown } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { Field, fieldA11y, fieldClass } from "./Field";

interface SelectProps extends ComponentProps<"select"> {
  id: string;
  label: string;
  placeholder: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  error?: string;
}

/** Lista nativa: teclado, leitor de tela e celular funcionam sem código próprio. */
export function Select({
  id,
  label,
  placeholder,
  options,
  error,
  className,
  ...props
}: SelectProps) {
  return (
    <Field id={id} label={label} error={error}>
      <div className="relative">
        <select
          className={cn(fieldClass(error), "appearance-none pr-11", className)}
          {...fieldA11y(id, error)}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-text-2"
        />
      </div>
    </Field>
  );
}
