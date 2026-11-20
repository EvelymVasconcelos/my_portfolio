// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/** Cenários da spec `formulario-de-contato`, com a rota de verdade e o Resend simulado. */

const send = vi.hoisted(() => vi.fn());
vi.mock("resend", () => ({
  Resend: class {
    emails = { send };
  },
}));

const { POST } = await import("@/app/api/contact/route");

const VALID = {
  name: "Ana Souza",
  email: "ana@exemplo.com",
  subject: "Oportunidade de trabalho",
  message: "Olá, gostaria de conversar sobre uma vaga.",
};

// Cada teste usa uma origem própria: o limitador é da instância, como na hospedagem.
let ip = 0;
let origin = "";

function post(
  body: unknown,
  { type = "application/json", raw }: { type?: string; raw?: string } = {}
) {
  return POST(
    new Request("http://localhost/api/contact", {
      method: "POST",
      headers: { "content-type": type, "x-forwarded-for": origin },
      body: raw ?? JSON.stringify(body),
    })
  );
}

let logged: unknown[][];

beforeEach(() => {
  origin = `10.0.0.${++ip}`;
  send.mockReset().mockResolvedValue({ data: { id: "1" }, error: null });
  vi.stubEnv("RESEND_API_KEY", "re_teste");
  vi.stubEnv("CONTACT_TO_EMAIL", "dona@exemplo.com");
  vi.stubEnv("CONTACT_FROM_EMAIL", "Portfólio <site@exemplo.com>");
  logged = [];
  vi.spyOn(console, "error").mockImplementation((...args) => void logged.push(args));
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("rota de contato", () => {
  it("entrega um envio válido em exatamente um e-mail, com texto puro e resposta para quem escreveu", async () => {
    const response = await post(VALID);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(send).toHaveBeenCalledTimes(1);
    const email = send.mock.calls[0][0];
    expect(email).toMatchObject({
      from: "Portfólio <site@exemplo.com>",
      to: "dona@exemplo.com",
      replyTo: "ana@exemplo.com",
      subject: "[Portfólio] Oportunidade de trabalho",
    });
    expect(email.text).toContain(VALID.message);
    expect(email.html).toContain("Ana Souza");
  });

  it("recusa com 400 e aponta os campos inválidos de um envio feito direto na API", async () => {
    const response = await post({ ...VALID, email: "ana-exemplo.com", message: "oi!" });
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "invalid_fields",
      fields: { email: "email_invalid", message: "message_min" },
    });
    expect(send).not.toHaveBeenCalled();
  });

  it("recusa com 400 um corpo que não é JSON", async () => {
    const response = await post(null, { raw: "nome=teste" });
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "invalid_json" });
    expect(send).not.toHaveBeenCalled();
  });

  it("recusa com 415 um tipo de conteúdo que não é JSON", async () => {
    const response = await post(null, {
      type: "application/x-www-form-urlencoded",
      raw: "name=Ana",
    });
    expect(response.status).toBe(415);
    expect(send).not.toHaveBeenCalled();
  });

  it("recusa com 413 um corpo de 20 KB", async () => {
    const response = await post({ ...VALID, message: "a".repeat(20 * 1024) });
    expect(response.status).toBe(413);
    expect(send).not.toHaveBeenCalled();
  });

  it("recusa com 413 pelo cabeçalho, antes de ler o corpo", async () => {
    const response = await POST(
      new Request("http://localhost/api/contact", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "content-length": "20480",
          "x-forwarded-for": origin,
        },
        body: JSON.stringify(VALID),
      })
    );
    expect(response.status).toBe(413);
  });

  it("entrega 5 envios em 2 minutos e recusa o sexto com 429 e Retry-After", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    const start = new Date("2026-11-20T12:00:00Z").getTime();
    for (let i = 0; i < 5; i++) {
      vi.setSystemTime(start + i * 24_000);
      expect((await post(VALID)).status).toBe(200);
    }
    vi.setSystemTime(start + 2 * 60_000);
    const sixth = await post(VALID);
    expect(sixth.status).toBe(429);
    expect(await sixth.json()).toEqual({ error: "rate_limited" });
    expect(Number(sixth.headers.get("Retry-After"))).toBe(8 * 60);
    expect(send).toHaveBeenCalledTimes(5);

    // 10 minutos depois do primeiro envio, a origem volta a enviar.
    vi.setSystemTime(start + 10 * 60_000);
    expect((await post(VALID)).status).toBe(200);
  });

  it("responde 200 ao robô que preenche o campo isca, sem enviar e-mail", async () => {
    const response = await post({ ...VALID, website: "https://spam.example" });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(send).not.toHaveBeenCalled();
  });

  it("entrega com o campo isca vazio", async () => {
    expect((await post({ ...VALID, website: "" })).status).toBe(200);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("mostra <script> no nome como texto e tira a quebra de linha do assunto", async () => {
    await post({
      ...VALID,
      name: "<script>alert(1)</script>",
      subject: "Olá\r\nBcc: alguem@exemplo.com",
    });
    const email = send.mock.calls[0][0];
    expect(email.html).not.toContain("<script>");
    expect(email.html).toContain("&lt;script&gt;");
    expect(email.subject).toBe("[Portfólio] Olá Bcc: alguem@exemplo.com");
    expect(email).not.toHaveProperty("bcc");
    expect(email.to).toBe("dona@exemplo.com");
  });

  it("responde 502 genérico quando o Resend recusa, e o detalhe só vai para o log", async () => {
    send.mockResolvedValue({
      data: null,
      error: { name: "validation_error", message: "API key re_x inválida" },
    });
    const response = await post(VALID);
    expect(response.status).toBe(502);
    const text = await response.text();
    expect(JSON.parse(text)).toEqual({ error: "delivery_failed" });
    expect(text).not.toMatch(/re_|inválida|dona@/);
    expect(JSON.stringify(logged)).toContain("API key re_x inválida");
  });

  it("responde 502 genérico quando o Resend não responde", async () => {
    send.mockRejectedValue(new Error("ECONNRESET"));
    const response = await post(VALID);
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: "delivery_failed" });
  });

  it.each(["CONTACT_TO_EMAIL", "CONTACT_FROM_EMAIL", "RESEND_API_KEY"])(
    "responde 503 sem tentar enviar quando falta %s",
    async (name) => {
      vi.stubEnv(name, "");
      const response = await post(VALID);
      expect(response.status).toBe(503);
      expect(await response.json()).toEqual({ error: "unavailable" });
      expect(send).not.toHaveBeenCalled();
    }
  );
});
