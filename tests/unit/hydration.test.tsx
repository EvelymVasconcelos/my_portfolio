import { act, type ReactElement } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import type { AbstractIntlMessages } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import HomePage from "@/app/[locale]/page";
import { THEME_KEY } from "@/lib/theme-script";
import { Providers } from "@/components/providers";
import en from "@/messages/en.json";
import es from "@/messages/es.json";
import pt from "@/messages/pt.json";

// As mensagens têm listas, que o tipo do next-intl não descreve; o layout faz o mesmo cast.
const MESSAGES = { pt, en, es } as unknown as Record<string, AbstractIntlMessages>;

// `setRequestLocale` só existe no ambiente de servidor do Next; aqui o idioma vem pelo provedor.
vi.mock("next-intl/server", () => ({ setRequestLocale: () => {} }));

// A página inteira (componente de servidor assíncrono, resolvido antes), com os mesmos provedores do layout.
async function page(locale: string): Promise<ReactElement> {
  const content = await HomePage({ params: Promise.resolve({ locale }) });
  return (
    <Providers locale={locale} messages={MESSAGES[locale]}>
      {content}
    </Providers>
  );
}

// O que o script do <head> faz antes da hidratação: classe no <html> e escolha guardada.
function applyTheme(theme: "dark" | "light") {
  localStorage.setItem(THEME_KEY, theme);
  document.documentElement.classList.remove("dark", "light");
  document.documentElement.classList.add(theme);
}

const CASES = ["pt", "en", "es"].flatMap((locale) =>
  (["dark", "light"] as const).map((theme) => [locale, theme] as const)
);

describe("hidratação sem divergência", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = "";
    localStorage.clear();
    document.documentElement.className = "";
  });

  it.each(CASES)("o HTML do servidor hidrata sem avisos em %s, tema %s", async (locale, theme) => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    const tree = await page(locale);

    // Renderização de servidor primeiro. Os avisos dela ("useLayoutEffect does nothing on the server")
    // vêm de rodar o renderizador de servidor dentro do jsdom e não indicam divergência.
    const serverSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const container = document.createElement("div");
    container.innerHTML = renderToString(tree);
    document.body.appendChild(container);
    serverSpy.mockRestore();
    applyTheme(theme);

    // A partir daqui, qualquer erro no console durante a hidratação reprova o teste.
    const errors: string[] = [];
    vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
      errors.push(args.map(String).join(" "));
    });

    await act(async () => {
      hydrateRoot(container, tree, {
        onRecoverableError: (error) => errors.push(`recoverable: ${String(error)}`),
      });
    });

    expect(errors).toEqual([]);
  });
});
