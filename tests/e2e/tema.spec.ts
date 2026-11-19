import { expect, test, type Page } from "@playwright/test";

/**
 * Tema inicial e troca sem divergência (spec `identidade-visual` da change estrutura-movimento-e-cena-3d).
 * A transição circular entra no bloco de movimento; aqui só o tema em si.
 */

const html = (page: Page) => page.locator("html");

/** Guarda a classe do <html> no fim da leitura do HTML, antes da hidratação: prova que o script do <head> rodou. */
async function recordFirstPaintClass(page: Page) {
  await page.addInitScript(() => {
    document.addEventListener(
      "DOMContentLoaded",
      () =>
        ((window as unknown as { __first: string }).__first = document.documentElement.className),
      { once: true }
    );
  });
}

const firstPaintClass = (page: Page) =>
  page.evaluate(() => (window as unknown as { __first: string }).__first);

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  return errors;
}

test("primeira visita com o sistema em modo claro abre no escuro", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  await recordFirstPaintClass(page);
  await page.goto("/pt");
  expect(await firstPaintClass(page)).toMatch(/\bdark\b/);
  await expect(html(page)).toHaveClass(/\bdark\b/);
  await expect(page.getByRole("button", { name: "Mudar para o tema claro" })).toBeVisible();
});

test("a escolha do claro é lembrada e pinta antes da hidratação", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/pt");
  await page.getByRole("button", { name: "Mudar para o tema claro" }).click();
  await expect(html(page)).toHaveClass(/\blight\b/);

  await recordFirstPaintClass(page);
  await page.reload();
  expect(await firstPaintClass(page)).toMatch(/\blight\b/);
  await expect(html(page)).not.toHaveClass(/\bdark\b/);
});

test("pelo teclado, o tema troca, o rótulo muda e o foco continua no botão", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/pt");
  const button = page.getByRole("button", { name: "Mudar para o tema claro" });
  await button.focus();
  await page.keyboard.press("Enter");
  const after = page.getByRole("button", { name: "Mudar para o tema escuro" });
  await expect(after).toBeFocused();
  await expect(html(page)).toHaveClass(/\blight\b/);

  await page.keyboard.press("Space");
  await expect(page.getByRole("button", { name: "Mudar para o tema claro" })).toBeFocused();
  await expect(html(page)).toHaveClass(/\bdark\b/);
});

test("o tema sobrevive à troca de idioma, sem piscar e sem erro no console", async ({ page }) => {
  const errors = collectErrors(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/pt");
  await page.getByRole("button", { name: "Mudar para o tema claro" }).click();
  await expect(html(page)).toHaveClass(/\blight\b/);

  // Trocar de idioma redesenha o layout sem recarregar a página: o tema não pode se perder.
  for (const to of ["en", "es"]) {
    await page.locator(`header a[hreflang="${to}"]`).first().click();
    await page.waitForURL(new RegExp(`/${to}$`));
    await expect(html(page)).toHaveAttribute("lang", to);
    await expect(html(page)).toHaveClass(/\blight\b/);
  }

  // Abrir o idioma novo direto também pinta no tema salvo.
  await recordFirstPaintClass(page);
  await page.goto("/en");
  expect(await firstPaintClass(page)).toMatch(/\blight\b/);
  expect(errors).toEqual([]);
});
