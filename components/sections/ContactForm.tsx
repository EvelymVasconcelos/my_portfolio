"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, CheckCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

type FormStatus = "idle" | "success" | "error";

const SUBJECTS = ["job", "project", "research", "feedback", "other"] as const;

/**
 * Formulário de contato (ilha de cliente). A validação compartilhada com o servidor, o campo isca e os limites
 * entram no bloco 6 de openspec/changes/fundacao-ferramentas-e-stack; aqui muda só a forma.
 */
export function ContactForm() {
  const t = useTranslations("contact");
  const tValidation = useTranslations("contact.validation");
  const [status, setStatus] = useState<FormStatus>("idle");

  const schema = z.object({
    name: z.string().trim().min(2, tValidation("name_min")),
    email: z.email(tValidation("email_invalid")),
    subject: z.enum(SUBJECTS, { error: tValidation("subject_required") }),
    message: z.string().trim().min(10, tValidation("message_min")),
  });
  type ContactFormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ subject, ...data }: ContactFormData) => {
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, subject: t(`form.subject_options.${subject}`) }),
      });
      if (!response.ok) throw new Error();
      setStatus("success");
      reset();
    } catch {
      setStatus("error");
    }
  };

  return (
    // method/action evitam que, sem JavaScript, o navegador envie a mensagem na URL (GET).
    <form
      method="post"
      action="/api/contact"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-label={t("form_aria_label")}
      className="flex flex-col gap-5"
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Input
          id="contact-name"
          label={t("form.name_label")}
          placeholder={t("form.name_placeholder")}
          autoComplete="name"
          error={errors.name?.message}
          {...register("name")}
        />
        <Input
          id="contact-email"
          type="email"
          label={t("form.email_label")}
          placeholder={t("form.email_placeholder")}
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
      </div>

      <Select
        id="contact-subject"
        label={t("form.subject_label")}
        placeholder={t("form.subject_placeholder")}
        options={SUBJECTS.map((id) => ({ value: id, label: t(`form.subject_options.${id}`) }))}
        error={errors.subject?.message}
        defaultValue=""
        {...register("subject")}
      />

      <Textarea
        id="contact-message"
        label={t("form.message_label")}
        placeholder={t("form.message_placeholder")}
        rows={5}
        error={errors.message?.message}
        {...register("message")}
      />

      {status === "success" && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-[10px] border border-ok bg-bg px-4 py-3 text-ok"
        >
          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <div>
            <p className="font-semibold">{t("form.success_title")}</p>
            <p className="text-text-2">{t("form.success_body")}</p>
          </div>
        </div>
      )}

      {status === "error" && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-[10px] border border-danger bg-bg px-4 py-3 text-danger"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <div>
            <p className="font-semibold">{t("form.error_title")}</p>
            <p className="text-text-2">{t("form.error_body")}</p>
          </div>
        </div>
      )}

      <Button type="submit" variant="primary" size="lg" loading={isSubmitting} className="w-full">
        {!isSubmitting && <Send className="h-4 w-4" aria-hidden />}
        {isSubmitting ? t("form.submitting") : t("form.submit")}
      </Button>
    </form>
  );
}
