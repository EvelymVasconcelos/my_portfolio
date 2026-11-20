import { describe, expect, it } from "vitest";
import { validateContact } from "@/lib/contact/schema";

const VALID = {
  name: "Ana Souza",
  email: "ana@exemplo.com",
  subject: "Oportunidade de trabalho",
  message: "Olá, gostaria de conversar sobre uma vaga.",
};

describe("regras do formulário de contato", () => {
  it("aceita um envio válido e tira os espaços das pontas", () => {
    const result = validateContact({ ...VALID, name: "  Ana Souza  ", email: " ana@exemplo.com " });
    expect(result).toEqual({ ok: true, data: VALID });
  });

  it("ignora campos que não são do formulário", () => {
    const result = validateContact({ ...VALID, website: "", extra: 1 });
    expect(result.ok && Object.keys(result.data)).toEqual(["name", "email", "subject", "message"]);
  });

  it.each([
    ["name", "A", "name_min"],
    ["name", "   A   ", "name_min"],
    ["name", "a".repeat(101), "name_max"],
    ["email", "ana-exemplo.com", "email_invalid"],
    ["email", `${"a".repeat(245)}@exemplo.com`, "email_invalid"],
    ["subject", "", "subject_required"],
    ["subject", "a".repeat(151), "subject_max"],
    ["message", "curta", "message_min"],
    ["message", "a".repeat(5001), "message_max"],
  ])("recusa %s = %j com o código %s", (field, value, code) => {
    expect(validateContact({ ...VALID, [field]: value })).toEqual({
      ok: false,
      errors: { [field]: code },
    });
  });

  it("aceita os valores nos limites", () => {
    const result = validateContact({
      name: "ab",
      email: `${"a".repeat(242)}@exemplo.com`,
      subject: "a".repeat(150),
      message: "a".repeat(5000),
    });
    expect(result.ok).toBe(true);
  });

  it("aponta todos os campos que faltam ou têm o tipo errado", () => {
    expect(validateContact({ name: 42 })).toEqual({
      ok: false,
      errors: {
        name: "name_min",
        email: "email_invalid",
        subject: "subject_required",
        message: "message_min",
      },
    });
  });

  it.each([null, "texto", 42, []])("recusa um corpo que não é objeto (%j)", (body) => {
    const result = validateContact(body);
    expect(result.ok).toBe(false);
    expect(!result.ok && Object.keys(result.errors).sort()).toEqual([
      "email",
      "message",
      "name",
      "subject",
    ]);
  });
});
