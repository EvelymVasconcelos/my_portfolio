import { describe, expect, it } from "vitest";
import { buildContactEmail, cleanSubject, escapeHtml } from "@/lib/contact/email";

const DATA = {
  name: "Ana Souza",
  email: "ana@exemplo.com",
  subject: "Oportunidade de trabalho",
  message: "Linha 1\nLinha 2",
};

describe("e-mail de contato", () => {
  it("escapa os cinco caracteres especiais do HTML", () => {
    expect(escapeHtml(`<a href="x" title='y'>&</a>`)).toBe(
      "&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;&amp;&lt;/a&gt;"
    );
  });

  it("mostra <script> no nome como texto, sem marcação", () => {
    const { html, text } = buildContactEmail({ ...DATA, name: "<script>alert(1)</script>" });
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(text).toContain("Nome: <script>alert(1)</script>");
  });

  it("escapa a mensagem e mantém as quebras de linha no texto puro", () => {
    const { html, text } = buildContactEmail({
      ...DATA,
      message: `<img src=x onerror="alert(1)">\nfim`,
    });
    expect(html).not.toMatch(/<img/);
    expect(text.endsWith(`<img src=x onerror="alert(1)">\nfim`)).toBe(true);
  });

  it("deixa o assunto numa linha só, sem cabeçalho injetado", () => {
    const injected = "Olá\r\nBcc: alguem@exemplo.com";
    expect(cleanSubject(injected)).toBe("Olá Bcc: alguem@exemplo.com");
    const { subject, text } = buildContactEmail({ ...DATA, subject: injected });
    expect(subject).toBe("[Portfólio] Olá Bcc: alguem@exemplo.com");
    expect(subject).not.toMatch(/[\r\n]/);
    expect(text).not.toMatch(/\nBcc:/);
  });

  it("tira também tabulação, outros caracteres de controle e separadores de linha Unicode", () => {
    expect(cleanSubject("a\tb\u0000c d e")).toBe("a b c d e");
  });
});
