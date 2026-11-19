import path from "node:path";
import type { Page } from "@playwright/test";

// As fotos provisórias dos projetos vêm de picsum.photos/…?random=N, que devolve uma foto diferente a cada busca.
// Nos testes, elas são servidas por uma imagem fixa, para a captura não depender de conteúdo externo aleatório.
const FOTO_PROVISORIA = path.join(__dirname, "fixtures", "foto-provisoria.png");

export const LOCALES = ["pt", "en", "es"] as const;
export const THEMES = ["dark", "light"] as const;

/**
 * Abre a página num estado estável: tema escolhido, movimento reduzido, fontes carregadas
 * e a página inteira percorrida, para que as entradas que esperam a rolagem já tenham acontecido.
 */
export async function openStable(page: Page, path: string, theme: (typeof THEMES)[number]) {
  await page.route(
    (url) =>
      url.pathname === "/_next/image" &&
      (url.searchParams.get("url") ?? "").startsWith("https://picsum.photos/"),
    (route) => route.fulfill({ path: FOTO_PROVISORIA, contentType: "image/png" })
  );
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: theme });
  await page.addInitScript((t) => window.localStorage.setItem("theme", t), theme);
  await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(async () => {
    const step = Math.max(200, Math.floor(window.innerHeight * 0.6));
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForLoadState("networkidle");
  // As entradas (data-reveal, MotionReady) terminam em até ~1 s depois de entrar na tela.
  await page.waitForTimeout(1200);
}
