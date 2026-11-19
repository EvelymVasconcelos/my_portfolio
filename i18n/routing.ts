import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["pt", "en", "es"],
  defaultLocale: "pt",
});

export type Locale = (typeof routing.locales)[number];

/** Fuso usado na formatação de datas no servidor e no cliente (evita ENVIRONMENT_FALLBACK e divergência). */
export const TIME_ZONE = "America/Manaus";
