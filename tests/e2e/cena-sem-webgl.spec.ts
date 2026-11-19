import { expect, test } from "@playwright/test";

/** Cena 3D do Hero sem WebGL (spec cena-3d): a imagem do tema atual é a versão final, sem erro no console. */

test.use({
  launchOptions: { args: ["--disable-webgl", "--disable-webgl2"] },
  reducedMotion: "no-preference",
});

test("sem WebGL, fica a imagem do tema e nada do Three.js é baixado", async ({ page }) => {
  let three = false;
  const errors: string[] = [];
  page.on("response", async (res) => {
    if (res.url().endsWith(".js") && (await res.text().catch(() => "")).includes("WebGLRenderer"))
      three = true;
  });
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.addInitScript(() => window.localStorage.setItem("theme", "dark"));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/pt");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2500);

  await expect(page.locator(".hero-scene")).toHaveAttribute("data-scene-state", "poster");
  expect(three).toBe(false);
  expect(errors).toEqual([]);
  await expect(page.locator(".hero-scene")).toHaveCSS(
    "background-image",
    /evelym-programando-escuro\.webp/
  );

  // A troca de tema troca a imagem.
  await page.getByRole("button", { name: "Mudar para o tema claro" }).click();
  await expect(page.locator(".hero-scene")).toHaveCSS(
    "background-image",
    /evelym-programando-claro\.webp/
  );
});
