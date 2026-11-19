/**
 * Gera as imagens estáticas da cena 3D do Hero a partir da própria cena (tarefa 5.4), para a troca imagem → cena ser
 * imperceptível: o pôster é o mesmo quadro que a cena desenha primeiro (o estado final da história).
 *
 * Uso, com o site rodando em produção: `npm run build && npx next start -p 3100` e, em outro terminal,
 * `npm run scene:posters` (ou `SITE_URL=http://localhost:3000 npm run scene:posters`).
 *
 * Saída: public/images/scene/evelym-programando-{claro,escuro}.webp, com fundo transparente. O navegador precisa de
 * WebGL; o Chromium do Playwright usa SwiftShader.
 */
import { writeFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const SITE_URL = process.env.SITE_URL ?? "http://localhost:3100";
const OUT_DIR = path.join(process.cwd(), "public/images/scene");
const NAMES = { dark: "escuro", light: "claro" } as const;

async function main() {
  const browser = await chromium.launch({
    args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
  });
  for (const theme of ["dark", "light"] as const) {
    // Largura da coluna do Hero no computador, em 1,5×: a imagem pode ser o elemento de LCP, então o peso conta
    // mais que a nitidez.
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1.5,
    });
    await page.addInitScript((t) => window.localStorage.setItem("theme", t), theme);
    await page.goto(`${SITE_URL}/pt?scene-capture`, { waitUntil: "networkidle" });
    await page.waitForFunction(
      () => document.querySelector<HTMLElement>(".hero-scene")?.dataset.sceneState === "captured",
      null,
      { timeout: 120_000 }
    );
    await page.waitForTimeout(500);
    const dataUrl = await page.evaluate(() =>
      document.querySelector<HTMLCanvasElement>(".hero-scene canvas")!.toDataURL("image/webp", 0.8)
    );
    const file = path.join(OUT_DIR, `evelym-programando-${NAMES[theme]}.webp`);
    const bytes = Buffer.from(dataUrl.split(",")[1], "base64");
    writeFileSync(file, bytes);
    console.log(
      `${theme}: ${path.relative(process.cwd(), file)} (${Math.round(bytes.length / 1024)} kB)`
    );
    await page.close();
  }
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
