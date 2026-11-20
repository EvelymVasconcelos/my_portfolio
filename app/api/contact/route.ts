import { Resend } from "resend";
import { buildContactEmail } from "@/lib/contact/email";
import { clientKey, contactLimiter } from "@/lib/contact/rate-limit";
import { HONEYPOT_FIELD, validateContact } from "@/lib/contact/schema";

/**
 * Recebe o formulário de contato (spec `formulario-de-contato` da change `fundacao-ferramentas-e-stack`).
 *
 * Ordem das verificações: tipo de conteúdo, tamanho, JSON, limite por origem, campo isca, regras dos campos,
 * configuração e entrega. Quem visita só recebe códigos genéricos; o detalhe de qualquer falha fica no log.
 */

const MAX_BODY_BYTES = 16 * 1024;

const reply = (status: number, body: Record<string, unknown>, headers?: HeadersInit) =>
  Response.json(body, { status, headers });

export async function POST(request: Request) {
  const type = request.headers.get("content-type") ?? "";
  if (!/^application\/json\b/i.test(type)) return reply(415, { error: "unsupported_media_type" });

  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) {
    return reply(413, { error: "payload_too_large" });
  }
  // O cabeçalho pode faltar ou mentir: o tamanho vale pelo corpo lido.
  const raw = await request.text();
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) {
    return reply(413, { error: "payload_too_large" });
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return reply(400, { error: "invalid_json" });
  }

  const limit = contactLimiter.hit(clientKey(request.headers));
  if (!limit.ok) {
    return reply(429, { error: "rate_limited" }, { "Retry-After": String(limit.retryAfter) });
  }

  // Robô: responde como se tivesse dado certo, para ele não aprender a contornar, e não envia nada.
  const honeypot = (body as Record<string, unknown> | null)?.[HONEYPOT_FIELD];
  if (typeof honeypot === "string" && honeypot.trim() !== "") return reply(200, { ok: true });

  const result = validateContact(body);
  if (!result.ok) return reply(400, { error: "invalid_fields", fields: result.errors });

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey || !to || !from) {
    console.error(
      "[contato] configuração ausente: RESEND_API_KEY, CONTACT_TO_EMAIL ou CONTACT_FROM_EMAIL"
    );
    return reply(503, { error: "unavailable" });
  }

  const email = buildContactEmail(result.data);
  try {
    const { error } = await new Resend(apiKey).emails.send({
      from,
      to,
      replyTo: result.data.email,
      subject: email.subject,
      html: email.html,
      text: email.text,
    });
    if (error) {
      console.error("[contato] o Resend recusou o envio:", error);
      return reply(502, { error: "delivery_failed" });
    }
  } catch (error) {
    console.error("[contato] falha ao falar com o Resend:", error);
    return reply(502, { error: "delivery_failed" });
  }

  return reply(200, { ok: true });
}
