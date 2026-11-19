import { expect, test } from "@playwright/test";
import { LOCALES, openStable, THEMES } from "./helpers";

/**
 * Capturas de referência da página inteira, tiradas na stack antiga (Next 14) antes dos upgrades.
 * Servem para provar que o Next 16 e o Tailwind 4 não mudaram o que o visitante vê.
 * Atualizar só de propósito: `npm run test:e2e:update` (usa --update-snapshots=all, porque o padrão
 * ignora diferenças abaixo de 1%).
 */
const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
] as const;

for (const vp of VIEWPORTS) {
  for (const locale of LOCALES) {
    for (const theme of THEMES) {
      test(`${locale} ${theme} ${vp.name}`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await openStable(page, `/${locale}`, theme);
        await expect(page).toHaveScreenshot(`${locale}-${theme}-${vp.name}.png`, {
          fullPage: true,
          stylePath: "tests/e2e/screenshot.css",
        });
      });
    }
  }
}
