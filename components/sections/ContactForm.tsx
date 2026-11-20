"use client";

import { useRef, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, CheckCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import {
  CONTACT_FIELDS,
  HONEYPOT_FIELD,
  LIMITS,
  validateContact,
  type ContactFieldErrors,
} from "@/lib/contact/schema";
import { cn } from "@/lib/utils";

type FormStatus = "idle" | "submitting" | "success" | "rate_limited" | "error";

const SUBJECTS = ["job", "project", "research", "feedback", "other"] as const;

/**
 * Formulário de contato (ilha de cliente, spec `formulario-de-contato`).
 *
 * As regras são as mesmas da rota da API (`lib/contact/schema.ts`): o navegador valida antes de enviar e, se o servidor
 * recusar algum campo, mostra o erro dele no mesmo lugar. Sem React Hook Form: para quatro campos, o próprio
 * formulário do navegador e um `FormData` bastam, e a página economiza cerca de 14 kB de JavaScript.
 */
export function ContactForm() {
  const t = useTranslations("contact");
  const tValidation = useTranslations("contact.validation");
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errors, setErrors] = useState<ContactFieldErrors>({});
  // Depois da primeira tentativa, os erros acompanham o que a pessoa digita.
  const [attempted, setAttempted] = useState(false);

  /** Lê os campos. O assunto vai com o texto do idioma da página, que é o que a dona lê no e-mail. */
  function readForm(form: HTMLFormElement) {
    const data = new FormData(form);
    const value = (name: string) => String(data.get(name) ?? "");
    const subjectId = value("subject") as (typeof SUBJECTS)[number] | "";
    return {
      name: value("name"),
      email: value("email"),
      subject: SUBJECTS.includes(subjectId as never) ? t(`form.subject_options.${subjectId}`) : "",
      message: value("message"),
      [HONEYPOT_FIELD]: value(HONEYPOT_FIELD),
    };
  }

  /** Leva o foco ao primeiro campo com erro, para o leitor de tela anunciar o problema onde ele está. */
  function focusFirstError(found: ContactFieldErrors) {
    const first = CONTACT_FIELDS.find((field) => found[field]);
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  }

  function revalidate() {
    if (!attempted || !formRef.current) return;
    const result = validateContact(readForm(formRef.current));
    setErrors(result.ok ? {} : result.errors);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;
    const form = event.currentTarget;
    const payload = readForm(form);
    setAttempted(true);

    const result = validateContact(payload);
    if (!result.ok) {
      setErrors(result.errors);
      setStatus("idle");
      focusFirstError(result.errors);
      return;
    }
    setErrors({});
    setStatus("submitting");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        form.reset();
        setAttempted(false);
        setStatus("success");
        return;
      }
      if (response.status === 429) {
        setStatus("rate_limited");
        return;
      }
      if (response.status === 400) {
        const body = (await response.json().catch(() => null)) as {
          fields?: ContactFieldErrors;
        } | null;
        if (body?.fields && Object.keys(body.fields).length > 0) {
          setErrors(body.fields);
          setStatus("idle");
          focusFirstError(body.fields);
          return;
        }
      }
      setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  const message = (field: keyof ContactFieldErrors) => {
    const code = errors[field];
    return code ? tValidation(code) : undefined;
  };

  const submitting = status === "submitting";

  return (
    // method/action evitam que, sem JavaScript, o navegador envie a mensagem na URL (GET).
    <form
      ref={formRef}
      method="post"
      action="/api/contact"
      onSubmit={onSubmit}
      onInput={revalidate}
      noValidate
      aria-label={t("form_aria_label")}
      className="relative flex flex-col gap-5"
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Input
          id="contact-name"
          name="name"
          label={t("form.name_label")}
          placeholder={t("form.name_placeholder")}
          autoComplete="name"
          maxLength={LIMITS.name.max}
          error={message("name")}
        />
        <Input
          id="contact-email"
          name="email"
          type="email"
          label={t("form.email_label")}
          placeholder={t("form.email_placeholder")}
          autoComplete="email"
          maxLength={LIMITS.email.max}
          error={message("email")}
        />
      </div>

      <Select
        id="contact-subject"
        name="subject"
        label={t("form.subject_label")}
        placeholder={t("form.subject_placeholder")}
        options={SUBJECTS.map((id) => ({ value: id, label: t(`form.subject_options.${id}`) }))}
        error={message("subject")}
        defaultValue=""
      />

      <Textarea
        id="contact-message"
        name="message"
        label={t("form.message_label")}
        placeholder={t("form.message_placeholder")}
        rows={5}
        maxLength={LIMITS.message.max}
        error={message("message")}
      />

      {/* Campo isca: fora da tela, fora do Tab e escondido do leitor de tela. Só robô preenche. */}
      <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
        <label htmlFor="contact-website">{t("form.honeypot_label")}</label>
        <input
          id="contact-website"
          name={HONEYPOT_FIELD}
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* A região existe desde o início, vazia, para o leitor de tela anunciar o resultado quando ele aparecer. */}
      <div role="status" aria-live="polite" className="empty:hidden">
        {status === "success" && (
          <Notice tone="ok" title={t("form.success_title")} body={t("form.success_body")} />
        )}
        {status === "rate_limited" && (
          <Notice
            tone="danger"
            title={t("form.rate_limited_title")}
            body={t("form.rate_limited_body")}
          />
        )}
        {status === "error" && (
          <Notice tone="danger" title={t("form.error_title")} body={t("form.error_body")} />
        )}
      </div>

      <Button type="submit" variant="primary" size="lg" loading={submitting} className="w-full">
        {!submitting && <Send className="h-4 w-4" aria-hidden />}
        {submitting ? t("form.submitting") : t("form.submit")}
      </Button>
    </form>
  );
}

function Notice({ tone, title, body }: { tone: "ok" | "danger"; title: string; body: string }) {
  const Icon = tone === "ok" ? CheckCircle : AlertCircle;
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-[10px] border bg-bg px-4 py-3",
        tone === "ok" ? "border-ok text-ok" : "border-danger text-danger"
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-text-2">{body}</p>
      </div>
    </div>
  );
}
