import { expect, test, type Page } from "@playwright/test";

/**
 * Formulário de contato no navegador (spec `formulario-de-contato`). No fluxo da página, a API é interceptada: nenhum
 * teste aqui envia e-mail de verdade. Os testes diretos na API só passam por caminhos que param antes da entrega.
 */

async function openForm(page: Page, locale: string) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`/${locale}`);
  const form = page.locator("#contact form");
  await form.scrollIntoViewIfNeeded();
  return form;
}

/** Preenche só com o teclado, a partir do campo de nome: Tab entre os campos e seta na lista de assunto. */
async function fillWithKeyboard(
  page: Page,
  form: ReturnType<Page["locator"]>,
  email = "ana@exemplo.com"
) {
  await form.locator('[name="name"]').focus();
  await page.keyboard.type("Ana Souza");
  await page.keyboard.press("Tab");
  await page.keyboard.type(email);
  await page.keyboard.press("Tab");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Tab");
  await page.keyboard.type("Olá, gostaria de conversar sobre uma vaga.");
  await page.keyboard.press("Tab");
}

test("envio só com teclado: o Tab pula o campo isca e o sucesso é anunciado", async ({ page }) => {
  const sent: unknown[] = [];
  await page.route("/api/contact", async (route) => {
    sent.push(route.request().postDataJSON());
    await route.fulfill({ status: 200, json: { ok: true } });
  });
  const form = await openForm(page, "pt");

  await fillWithKeyboard(page, form);
  await expect(form.getByRole("button", { name: "Enviar mensagem" })).toBeFocused();
  await page.keyboard.press("Enter");

  const status = form.getByRole("status");
  await expect(status).toHaveText(/Mensagem enviada!/);
  await expect(status).toHaveAttribute("aria-live", "polite");
  expect(sent).toEqual([
    {
      name: "Ana Souza",
      email: "ana@exemplo.com",
      subject: "Oportunidade de trabalho",
      message: "Olá, gostaria de conversar sobre uma vaga.",
      website: "",
    },
  ]);
});

test("o campo isca fica fora da tela e da árvore de acessibilidade", async ({ page }) => {
  const form = await openForm(page, "pt");
  const honeypot = form.locator('input[name="website"]');
  const box = await honeypot.boundingBox();
  expect(box && box.x + box.width).toBeLessThan(0);
  const snapshot = await form.ariaSnapshot();
  expect(snapshot).not.toMatch(/em branco|website/i);
});

test("em /es, o e-mail inválido mostra o erro em espanhol junto ao campo e nada é enviado", async ({
  page,
}) => {
  let requests = 0;
  await page.route("/api/contact", (route) => {
    requests++;
    return route.fulfill({ status: 200, json: { ok: true } });
  });
  const form = await openForm(page, "es");
  await fillWithKeyboard(page, form, "ana-exemplo.com");
  await page.keyboard.press("Enter");

  const email = form.getByLabel("Correo electrónico");
  await expect(email).toBeFocused();
  await expect(email).toHaveAttribute("aria-invalid", "true");
  await expect(email).toHaveAccessibleDescription("Correo electrónico no válido");
  expect(requests).toBe(0);
});

test("em /en, o excesso de envios (429) é avisado em inglês", async ({ page }) => {
  await page.route("/api/contact", (route) =>
    route.fulfill({
      status: 429,
      headers: { "Retry-After": "480" },
      json: { error: "rate_limited" },
    })
  );
  const form = await openForm(page, "en");
  await fillWithKeyboard(page, form);
  await page.keyboard.press("Enter");
  await expect(form.getByRole("status")).toHaveText(/Too many messages in a short time\./);
});

test.describe("API sem passar pelo formulário", () => {
  const headers = (ip: string) => ({ "x-forwarded-for": ip });
  const VALID = {
    name: "Ana Souza",
    email: "ana@exemplo.com",
    subject: "Teste",
    message: "Mensagem de teste automatizado.",
  };

  test("recusa com 400 os campos inválidos", async ({ request }) => {
    const response = await request.post("/api/contact", {
      headers: headers("203.0.113.1"),
      data: { ...VALID, email: "sem-arroba", message: "oi" },
    });
    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({
      error: "invalid_fields",
      fields: { email: "email_invalid", message: "message_min" },
    });
  });

  test("recusa com 415 um corpo que não é JSON", async ({ request }) => {
    const response = await request.post("/api/contact", {
      headers: { ...headers("203.0.113.2"), "content-type": "text/plain" },
      data: "nome=teste",
    });
    expect(response.status()).toBe(415);
  });

  test("recusa com 413 um corpo de 20 KB", async ({ request }) => {
    const response = await request.post("/api/contact", {
      headers: headers("203.0.113.3"),
      data: { ...VALID, message: "a".repeat(20 * 1024) },
    });
    expect(response.status()).toBe(413);
  });

  test("responde 200 ao campo isca preenchido", async ({ request }) => {
    const response = await request.post("/api/contact", {
      headers: headers("203.0.113.4"),
      data: { ...VALID, website: "https://spam.example" },
    });
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
  });
});
