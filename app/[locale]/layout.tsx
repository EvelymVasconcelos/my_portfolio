import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Providers } from "@/components/providers";
import { ThemeScript } from "@/components/layout/ThemeScript";
import "@/app/globals.css";

/** Grupos de mensagens usados por componentes de cliente (Navbar, ThemeToggle, ContactForm). */
const CLIENT_NAMESPACES = ["nav", "language", "theme", "accessibility", "contact"] as const;

// Fontes da referência servidas pelo próprio site (next/font), só o subconjunto latin, que cobre pt, en e es.
// Títulos, texto e rótulos; a mono não é pré-carregada (aparece abaixo da dobra). Orçamento: 140 KB no início.
const heading = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-heading",
  display: "swap",
});

const body = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const code = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-code",
  display: "swap",
  preload: false,
});

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    default: "Evelym Marinho — Backend Software Engineer",
    template: "%s | Evelym Marinho",
  },
  description:
    "Portfólio de Evelym Marinho, Backend Software Engineer Pleno especialista em Python, FastAPI, Django e microsserviços. 6+ anos de experiência. Pesquisadora com publicações na IEEE e ACM.",
  keywords: [
    "Evelym Marinho",
    "Backend Engineer",
    "Python",
    "FastAPI",
    "Django",
    "Docker",
    "Kubernetes",
    "APIs RESTful",
    "Microsserviços",
    "Backend Pleno",
    "Portfólio",
    "Manaus",
    "IEEE",
    "ACM",
  ],
  authors: [{ name: "Evelym Marinho", url: "https://evelymmarinho.dev" }],
  creator: "Evelym Marinho",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Evelym Marinho — Backend Software Engineer",
    title: "Evelym Marinho — Backend Software Engineer",
    description:
      "6+ anos em Python, FastAPI e microsserviços. Pesquisadora com publicações na IEEE (SEAI 2024) e ACM (ICSCA 2026).",
  },
  twitter: {
    card: "summary_large_image",
    title: "Evelym Marinho — Backend Software Engineer",
    description: "6+ anos em Python, FastAPI e microsserviços.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

// ─── Layout ───────────────────────────────────────────────────────────────────

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  // Permite gerar as páginas de cada idioma no build (renderização estática com next-intl).
  setRequestLocale(locale);
  const allMessages = await getMessages();
  // Só o que as ilhas de cliente usam vai para o navegador; as seções são de servidor.
  const messages = Object.fromEntries(CLIENT_NAMESPACES.map((ns) => [ns, allMessages[ns]]));
  const tA11y = await getTranslations("accessibility");

  return (
    <html lang={locale} suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        {/* Tema antes da primeira pintura, sem piscar (components/layout/ThemeScript.tsx). */}
        <ThemeScript />
      </head>
      <body className={`${heading.variable} ${body.variable} ${code.variable} font-sans antialiased`}>
        {/* Pular para o conteúdo: primeiro item do teclado, no idioma da página. */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-60 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:font-semibold focus:text-on-accent"
        >
          {tA11y("skip_to_content")}
        </a>

        <Providers locale={locale} messages={messages}>
          {children}
        </Providers>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
