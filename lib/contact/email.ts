import type { ContactData } from "./schema";

/**
 * Monta o e-mail que a dona recebe. Tudo que quem visita digitou entra como texto: escapado no HTML, literal na versão
 * em texto puro e numa linha só no assunto (sem quebra, ninguém injeta `Bcc:` nem outro cabeçalho).
 */

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}

/** Assunto numa linha só: quebras de linha e outros caracteres de controle viram espaço. */
export function cleanSubject(value: string): string {
  return value
    .replace(/[\u0000-\u001f\u007f\u2028\u2029]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildContactEmail(data: ContactData) {
  const subject = `[Portfólio] ${cleanSubject(data.subject)}`;
  const rows: [string, string][] = [
    ["Nome", data.name],
    ["E-mail", data.email],
    ["Assunto", cleanSubject(data.subject)],
  ];

  const text = [...rows.map(([label, value]) => `${label}: ${value}`), "", data.message].join("\n");

  const html = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
<h2 style="color:#6d28d9">Nova mensagem do portfólio</h2>
<table style="width:100%;border-collapse:collapse">
${rows
  .map(
    ([label, value]) =>
      `<tr><td style="padding:8px 0;color:#666">${label}</td><td style="padding:8px 0;font-weight:bold">${escapeHtml(value)}</td></tr>`
  )
  .join("\n")}
</table>
<hr style="border:none;border-top:1px solid #eee;margin:16px 0">
<p style="white-space:pre-wrap;color:#333">${escapeHtml(data.message)}</p>
</div>`;

  return { subject, text, html };
}
