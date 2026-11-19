import { expect, test } from "@playwright/test";
import { LOCALES } from "./helpers";

/**
 * Estrutura e conteúdo (spec estrutura-e-conteudo da change estrutura-movimento-e-cena-3d): seções na ordem da
 * referência, com a Pesquisa a mais, container da referência, página legível sem JavaScript e tudo pelo teclado.
 */

const SECTIONS = ["hero", "about", "projects", "experience", "research", "contact"];

for (const locale of LOCALES) {
  test(`/${locale}: seções na ordem, títulos ligados e links da barra com destino`, async ({
    page,
  }) => {
    await page.goto(`/${locale}`);
    const ids = await page.locator("main > section").evaluateAll((els) => els.map((el) => el.id));
    expect(ids).toEqual(SECTIONS);

    // Cada seção é nomeada pelo próprio título.
    for (const id of SECTIONS) {
      const labelledBy = await page.locator(`#${id}`).getAttribute("aria-labelledby");
      await expect(page.locator(`#${labelledBy}`)).toBeVisible();
    }

    // Os links da barra apontam para seções que existem.
    const hrefs = await page
      .locator("header nav a")
      .evaluateAll((els) => els.map((a) => a.getAttribute("href")));
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) expect(SECTIONS).toContain(href!.replace("#", ""));
  });
}

test("container da referência: 1312 px em 1440, sem rolagem lateral em 390", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/pt");
  const width = await page
    .locator("#hero .container-site")
    .first()
    .evaluate((el) => el.getBoundingClientRect().width);
  expect(width).toBe(1312);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/pt");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth
  );
  expect(overflow).toBe(0);
});

test('sem link de agenda, "Agendar call" não aparece e o formulário já vem aberto', async ({
  page,
}) => {
  await page.goto("/pt");
  await expect(page.getByText("Agendar call")).toHaveCount(0);
  await expect(page.locator("#contact details")).toHaveAttribute("open", "");
});

test.describe("sem JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  for (const locale of LOCALES) {
    test(`/${locale} mostra todas as seções, com links de destino real`, async ({ page }) => {
      await page.goto(`/${locale}`);
      for (const id of SECTIONS) await expect(page.locator(`#${id}`)).toBeVisible();
      await expect(page.locator("h1")).toBeVisible();
      const empty = await page.locator('a:not([href]), a[href="#"], a[href=""]').count();
      expect(empty).toBe(0);
      // A troca de idioma são links: funciona sem JavaScript.
      await expect(page.locator('footer a[hreflang="en"]')).toHaveAttribute("href", /\/en$/);
    });
  }

  test("o formulário abre e fecha pelo <details> nativo, também pelo teclado", async ({ page }) => {
    await page.goto("/pt");
    const details = page.locator("#contact details");
    const summary = page.locator("#contact summary");
    await summary.focus();
    await page.keyboard.press("Enter");
    await expect(details).not.toHaveAttribute("open", "");
    await page.keyboard.press("Enter");
    await expect(details).toHaveAttribute("open", "");
  });
});

test.describe("só com teclado", () => {
  test('o primeiro Tab é "Pular para o conteúdo", no idioma da página', async ({ page }) => {
    for (const [locale, label] of [
      ["pt", "Pular para o conteúdo principal"],
      ["en", "Skip to main content"],
      ["es", "Ir al contenido principal"],
    ] as const) {
      await page.goto(`/${locale}`);
      await page.keyboard.press("Tab");
      await expect(page.locator(":focus")).toHaveText(label);
    }
  });

  test("a barra leva até a Pesquisa e o foco vai para o título dela", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/pt");
    await page.waitForLoadState("networkidle");
    const link = page.locator('header nav a[href="#research"]').first();
    await link.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#research$/);
    // O foco vai para o título da seção, e o próximo Tab continua dentro dela.
    await expect(page.locator("#research-title")).toBeFocused();
    await expect(page.locator("#research-title")).toBeInViewport();
    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => !!document.activeElement?.closest("#research"))).toBe(true);
  });

  test("o menu de celular abre e fecha só com teclado", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/pt");
    await page.waitForLoadState("networkidle");

    const button = page.getByRole("button", { name: "Menu" });
    await button.focus();
    await page.keyboard.press("Enter");
    await expect(button).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator(":focus")).toHaveText("Sobre");

    await page.keyboard.press("Escape");
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await expect(button).toBeFocused();
  });

  test('"Prefere escrever por aqui?" responde ao teclado e o próximo Tab vai para Nome', async ({
    page,
  }) => {
    await page.goto("/pt");
    await page.waitForLoadState("networkidle");
    const summary = page.locator("#contact summary");
    await summary.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#contact details")).not.toHaveAttribute("open", "");
    await page.keyboard.press("Enter");
    await expect(page.locator("#contact details")).toHaveAttribute("open", "");
    await page.keyboard.press("Tab");
    await expect(page.getByLabel("Nome")).toBeFocused();
  });
});

test.describe("só informação real", () => {
  for (const locale of LOCALES) {
    test(`/${locale} não tem marcador de rascunho`, async ({ request }) => {
      const html = await (await request.get(`/${locale}`)).text();
      expect(html).not.toMatch(/validar|preencher|lorem|picsum/i);
    });
  }
});
