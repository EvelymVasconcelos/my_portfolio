import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { Field, fieldA11y, fieldClass } from "./Field";

interface InputProps extends ComponentProps<"input"> {
  id: string;
  label: string;
  error?: string;
}

export function Input({ id, label, error, className, ...props }: InputProps) {
  return (
    <Field id={id} label={label} error={error}>
      <input className={cn(fieldClass(error), className)} {...fieldA11y(id, error)} {...props} />
    </Field>
  );
}
