import * as z from "zod/mini";

/**
 * Regras do formulário de contato, usadas pelo navegador e pela rota da API (spec `formulario-de-contato`).
 *
 * Cada regra devolve um código (`name_min`, `email_invalid`...), nunca um texto: o navegador traduz o código com
 * `contact.validation.<código>` de `messages/` e o servidor devolve os mesmos códigos no 400.
 *
 * `zod/mini` em vez do Zod clássico: o mesmo schema custa 5,2 kB com gzip, contra 93 kB (medido com esbuild em
 * 2026-11-20). Ver a decisão 6 da design da change `fundacao-ferramentas-e-stack`.
 */

export const LIMITS = {
  name: { min: 2, max: 100 },
  email: { max: 254 },
  subject: { min: 1, max: 150 },
  message: { min: 10, max: 5000 },
} as const;

export const CONTACT_FIELDS = ["name", "email", "subject", "message"] as const;
export type ContactField = (typeof CONTACT_FIELDS)[number];

export type ContactErrorCode =
  | "name_min"
  | "name_max"
  | "email_invalid"
  | "subject_required"
  | "subject_max"
  | "message_min"
  | "message_max";

/** Texto sem espaços nas pontas, com tamanho mínimo e máximo, e código próprio para cada limite. */
const text = (min: number, max: number, minCode: ContactErrorCode, maxCode: ContactErrorCode) =>
  z
    .string({ error: minCode })
    .check(z.trim(), z.minLength(min, minCode), z.maxLength(max, maxCode));

export const contactSchema = z.object({
  name: text(LIMITS.name.min, LIMITS.name.max, "name_min", "name_max"),
  email: z.pipe(
    z.string({ error: "email_invalid" }).check(z.trim()),
    z.email({ error: "email_invalid" }).check(z.maxLength(LIMITS.email.max, "email_invalid"))
  ),
  subject: text(LIMITS.subject.min, LIMITS.subject.max, "subject_required", "subject_max"),
  message: text(LIMITS.message.min, LIMITS.message.max, "message_min", "message_max"),
});

export type ContactData = z.infer<typeof contactSchema>;
export type ContactFieldErrors = Partial<Record<ContactField, ContactErrorCode>>;

/** Nome do campo isca. Pessoas não o veem; robôs que preenchem todo campo o preenchem. */
export const HONEYPOT_FIELD = "website";

export type ValidationResult =
  { ok: true; data: ContactData } | { ok: false; errors: ContactFieldErrors };

/** Valida um envio e devolve os dados limpos ou o primeiro código de erro de cada campo. */
export function validateContact(input: unknown): ValidationResult {
  const result = contactSchema.safeParse(input);
  if (result.success) return { ok: true, data: result.data };

  const errors: ContactFieldErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (typeof field !== "string" || !CONTACT_FIELDS.includes(field as ContactField)) continue;
    errors[field as ContactField] ??= issue.message as ContactErrorCode;
  }
  // Um corpo que não é objeto não tem caminho em nenhum erro: todos os campos falharam.
  if (Object.keys(errors).length === 0) {
    errors.name = "name_min";
    errors.email = "email_invalid";
    errors.subject = "subject_required";
    errors.message = "message_min";
  }
  return { ok: false, errors };
}
