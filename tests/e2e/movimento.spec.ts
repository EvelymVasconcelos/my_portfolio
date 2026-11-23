import { expect, test, type Page } from "@playwright/test";

/**
 * Movimento e rolagem (spec movimento-e-rolagem da change estrutura-movimento-e-cena-3d): o movimento nunca esconde
 * conteúdo nem prende a rolagem, tem alternativa com movimento reduzido e funciona pelo teclado.
 */

/** Percorre a página até o fim, para disparar as entradas que esperam a rolagem. */
async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    const step = Math.floor(window.innerHeight * 0.6);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo({ top: y, behavior: "instant" });
      await new Promise((r) => setTimeout(r, 40));
    }
  });
}

test.describe("movimento reduzido", () => {
  test.use({ reducedMotion: "reduce" });

  test("nada fica preso, escondido ou em movimento, e os números já estão no valor final", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/pt");
    await page.waitForLoadState("networkidle");
    // O layout com movimento só vale depois desta marca; com a cena 3D carregando junto, ela pode chegar depois do
    // "networkidle".
    await page.waitForSelector('html[data-motion="ready"]', { state: "attached" });
    await scrollThrough(page);

    const state = await page.evaluate(() => {
      const css = (sel: string, prop: string) =>
        [...document.querySelectorAll<HTMLElement>(sel)].map((el) =>
          getComputedStyle(el).getPropertyValue(prop)
        );
      const hidden = [
        ...document.querySelectorAll<HTMLElement>(
          "[data-reveal], [data-reveal] > *, .split-word, .split-char, .ruler-bar, .tech-chip, .seq [style*='--from']"
        ),
      ].filter((el) => {
        // Decorativo (reflexo da foto, formas): não é conteúdo.
        if (el.closest("[aria-hidden='true']") && !el.closest(".split-word")) return false;
        const s = getComputedStyle(el);
        const moved = !["none", "", "matrix(1, 0, 0, 1, 0, 0)"].includes(s.transform);
        return s.opacity !== "1" || moved;
      }).length;
      return {
        stage: css(".seq-stage", "position"),
        papers: css(".paper", "position"),
        steps: css(".seq-steps li", "display"),
        hidden,
        running: document.getAnimations().filter((a) => a.playState === "running").length,
        counts: [...document.querySelectorAll<HTMLElement>("[data-count]")].map((el) => [
          el.textContent,
          el.dataset.count,
        ]),
      };
    });

    expect(state.stage).toEqual(["static"]);
    expect(new Set(state.papers)).toEqual(new Set(["relative"]));
    expect(state.steps.every((d) => d !== "none")).toBe(true);
    expect(state.hidden).toBe(0);
    expect(state.running).toBe(0);
    for (const [text, value] of state.counts) expect(text).toBe(value);
  });
});

test.describe("com movimento", () => {
  test.use({ reducedMotion: "no-preference" });

  test("a sequência fica presa abaixo do cabeçalho no meio da rolagem e anuncia a etapa atual", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/pt");
    await page.waitForLoadState("networkidle");
    // O layout com movimento só vale depois desta marca; com a cena 3D carregando junto, ela pode chegar depois do
    // "networkidle".
    await page.waitForSelector('html[data-motion="ready"]', { state: "attached" });

    const { top, height } = await page.evaluate(() => {
      const seq = document.querySelector<HTMLElement>(".seq")!;
      return { top: seq.getBoundingClientRect().top + window.scrollY, height: seq.offsetHeight };
    });
    expect(height).toBeGreaterThan(900 * 3);

    // Meio do trilho: terceira etapa (Dados).
    await page.evaluate(
      (y) => window.scrollTo({ top: y, behavior: "instant" }),
      top + (height - 900) * 0.5
    );
    await expect(page.locator('.seq-steps li[aria-current="step"]')).toContainText("Dados");
    const stageTop = await page
      .locator(".seq-stage")
      .evaluate((el) => el.getBoundingClientRect().top);
    const header = await page
      .getByRole("banner")
      .evaluate((el) => el.getBoundingClientRect().height);
    expect(Math.abs(stageTop - header)).toBeLessThan(2);

    // Volta para o começo do trilho: primeira etapa de novo (a rolagem nunca é presa nem desviada).
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), top + 10);
    await expect(page.locator('.seq-steps li[aria-current="step"]')).toContainText("Requisição");
  });

  test("o nome do Hero entra letra a letra e o leitor de tela lê o nome inteiro", async ({
    page,
  }) => {
    await page.goto("/pt");
    await expect(page.getByRole("heading", { level: 1, name: "Evelym Marinho" })).toBeVisible();
    await expect(page.locator("#hero-title .split-char")).toHaveCount("EvelymMarinho".length);
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "Engenheira de software backend, pesquisadora e Python há mais de 6 anos.",
      })
    ).toBeAttached();
  });
});

test.describe("só com teclado", () => {
  test.use({ reducedMotion: "no-preference" });

  test("a sequência não prende o foco: o Tab segue das competências para os projetos", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/pt");
    await page.waitForLoadState("networkidle");
    // O layout com movimento só vale depois desta marca; com a cena 3D carregando junto, ela pode chegar depois do
    // "networkidle".
    await page.waitForSelector('html[data-motion="ready"]', { state: "attached" });
    // A sequência não tem nada focável; o próximo Tab depois do último link antes dela já está em Projetos.
    await page.locator("#about-title").focus();
    let reached = false;
    for (let i = 0; i < 15 && !reached; i++) {
      await page.keyboard.press("Tab");
      reached = await page.evaluate(
        () => !!document.activeElement?.closest("#projects, #experience, #research")
      );
    }
    expect(reached).toBe(true);
  });

  test("o cartão da pilha com foco fica por cima, inteiro e visível", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/pt");
    await page.waitForLoadState("networkidle");
    // O layout com movimento só vale depois desta marca; com a cena 3D carregando junto, ela pode chegar depois do
    // "networkidle".
    await page.waitForSelector('html[data-motion="ready"]', { state: "attached" });
    const doi = page.locator("#research .paper a").first();
    await doi.focus();
    await expect(doi).toBeInViewport();
    // Nada cobre o link: o ponto no meio dele é o próprio link.
    const onTop = await doi.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return el === hit || el.contains(hit);
    });
    expect(onTop).toBe(true);
  });
});
