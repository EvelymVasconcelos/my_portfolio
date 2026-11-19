import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { Field, fieldA11y, fieldClass } from "./Field";

interface TextareaProps extends ComponentProps<"textarea"> {
  id: string;
  label: string;
  error?: string;
}

export function Textarea({ id, label, error, className, ...props }: TextareaProps) {
  return (
    <Field id={id} label={label} error={error}>
      <textarea
        className={cn(fieldClass(error), "min-h-[8rem] resize-y", className)}
        {...fieldA11y(id, error)}
        {...props}
      />
    </Field>
  );
}
