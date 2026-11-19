import type { ReactNode } from "react";

/** Rótulo, campo e mensagem de erro ligados por id: o erro é anunciado e descreve o campo. */
export function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[0.92rem] font-semibold text-text">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-[0.9rem] text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/** Classes comuns de campo de texto, lista e área de texto. Borda em --line-strong (≥ 3:1). */
export const fieldClass = (error?: string) =>
  [
    "w-full rounded-[10px] border bg-bg px-4 py-3 text-base text-text placeholder:text-text-3",
    "transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50",
    error ? "border-danger" : "border-line-strong",
  ].join(" ");

/** Atributos de acessibilidade de um campo com erro. */
export const fieldA11y = (id: string, error?: string) => ({
  id,
  "aria-invalid": error ? true : undefined,
  "aria-describedby": error ? `${id}-error` : undefined,
});
