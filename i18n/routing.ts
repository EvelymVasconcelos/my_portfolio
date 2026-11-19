import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["pt", "en", "es"],
  defaultLocale: "pt",
});

export type Locale = (typeof routing.locales)[number];

/** Fuso usado na formatação de datas no servidor e no cliente (evita ENVIRONMENT_FALLBACK e divergência). */
export const TIME_ZONE = "America/Manaus";

/** Nome de cada idioma nele mesmo, para a troca de idioma (lido com `lang` do idioma de destino). */
export const LOCALE_NAMES: Record<Locale, string> = {
  pt: "Português",
  en: "English",
  es: "Español",
};
