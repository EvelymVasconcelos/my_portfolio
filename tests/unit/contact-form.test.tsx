import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AbstractIntlMessages } from "next-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Providers } from "@/components/providers";
import { ContactForm } from "@/components/sections/ContactForm";
import en from "@/messages/en.json";
import es from "@/messages/es.json";
import pt from "@/messages/pt.json";

/** Formulário de contato com a API simulada: fluxo só com teclado, avisos por status e erros por idioma. */

const MESSAGES = { pt, en, es } as unknown as Record<string, AbstractIntlMessages>;

function renderForm(locale: "pt" | "en" | "es" = "pt") {
  return render(
    <Providers locale={locale} messages={MESSAGES[locale]}>
      <ContactForm />
    </Providers>
  );
}

const fetchMock = vi.fn();

function respond(status: number, body: unknown) {
  fetchMock.mockResolvedValue(new Response(JSON.stringify(body), { status }));
}

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
  respond(200, { ok: true });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

/**
 * Preenche tudo com o teclado, indo de campo em campo pelo Tab. O jsdom não implementa as setas numa lista nativa,
 * então o assunto é escolhido com `selectOptions` com o foco já nele; o teste de navegador usa as setas de verdade.
 */
async function fillWithKeyboard(
  user: ReturnType<typeof userEvent.setup>,
  email = "ana@exemplo.com"
) {
  await user.tab();
  await user.keyboard("Ana Souza");
  await user.tab();
  await user.keyboard(email);
  await user.tab();
  const subject = document.activeElement as HTMLSelectElement;
  expect(subject.name).toBe("subject");
  await user.selectOptions(subject, "job");
  await user.tab();
  await user.keyboard("Olá, gostaria de conversar sobre uma vaga.");
  await user.tab();
}

describe("formulário de contato", () => {
  it("o Tab passa por nome, e-mail, assunto, mensagem e botão, nunca pelo campo isca", async () => {
    const user = userEvent.setup();
    renderForm();
    const order: (string | null | undefined)[] = [];
    for (let i = 0; i < 5; i++) {
      await user.tab();
      order.push(
        document.activeElement?.getAttribute("name") ?? document.activeElement?.getAttribute("type")
      );
    }
    expect(order).toEqual(["name", "email", "subject", "message", "submit"]);
  });

  it("esconde o campo isca do leitor de tela", () => {
    renderForm();
    const honeypot = document.querySelector<HTMLInputElement>('input[name="website"]')!;
    expect(honeypot.closest('[aria-hidden="true"]')).not.toBeNull();
    expect(honeypot.tabIndex).toBe(-1);
    expect(screen.queryByRole("textbox", { name: /em branco/i })).toBeNull();
  });

  it("envia só com teclado e anuncia o sucesso numa região viva", async () => {
    const user = userEvent.setup();
    renderForm();
    await fillWithKeyboard(user);
    expect(screen.getByRole("button", { name: /enviar mensagem/i })).toHaveFocus();
    await user.keyboard("{Enter}");

    const status = screen.getByRole("status");
    await waitFor(() => expect(status).toHaveTextContent("Mensagem enviada!"));
    expect(status).toHaveAttribute("aria-live", "polite");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/contact");
    expect(JSON.parse(init.body)).toEqual({
      name: "Ana Souza",
      email: "ana@exemplo.com",
      subject: "Oportunidade de trabalho",
      message: "Olá, gostaria de conversar sobre uma vaga.",
      website: "",
    });
    // O formulário volta ao início para uma nova mensagem.
    expect(screen.getByLabelText("Nome")).toHaveValue("");
  });

  it("em /es, mostra o erro do e-mail em espanhol junto ao campo e não envia", async () => {
    const user = userEvent.setup();
    renderForm("es");
    await fillWithKeyboard(user, "ana-exemplo.com");
    await user.keyboard("{Enter}");

    const email = screen.getByLabelText("Correo electrónico");
    expect(email).toHaveAttribute("aria-invalid", "true");
    expect(email).toHaveAccessibleDescription("Correo electrónico no válido");
    expect(email).toHaveFocus();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("em /en, avisa em inglês quando há envios demais (429)", async () => {
    respond(429, { error: "rate_limited" });
    const user = userEvent.setup();
    renderForm("en");
    await fillWithKeyboard(user);
    await user.keyboard("{Enter}");
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("Too many messages in a short time.")
    );
  });

  it("mostra no campo o erro que o servidor devolveu (400)", async () => {
    respond(400, { error: "invalid_fields", fields: { message: "message_max" } });
    const user = userEvent.setup();
    renderForm();
    await fillWithKeyboard(user);
    await user.keyboard("{Enter}");
    await waitFor(() =>
      expect(screen.getByLabelText("Mensagem")).toHaveAccessibleDescription(
        "A mensagem pode ter até 5.000 caracteres"
      )
    );
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it.each([502, 503])(
    "mostra o aviso genérico de falha quando o servidor responde %i",
    async (code) => {
      respond(code, { error: "delivery_failed" });
      const user = userEvent.setup();
      renderForm();
      await fillWithKeyboard(user);
      await user.keyboard("{Enter}");
      await waitFor(() =>
        expect(screen.getByRole("status")).toHaveTextContent("Não consegui enviar a mensagem.")
      );
    }
  );

  it("depois da primeira tentativa, o erro some quando a pessoa corrige o campo", async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole("button", { name: /enviar mensagem/i }));
    const name = screen.getByLabelText("Nome");
    expect(name).toHaveAccessibleDescription("O nome precisa ter pelo menos 2 caracteres");
    await user.type(name, "Ana");
    expect(name).not.toHaveAttribute("aria-invalid");
  });
});
