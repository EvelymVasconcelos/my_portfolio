import type { Metadata } from "next";
import { Roboto, Roboto_Slab } from "next/font/google";
import { notFound } from "next/navigation";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Providers } from "@/components/providers";
import { ThemeScript } from "@/components/layout/ThemeScript";
import "@/app/globals.css";

// ─── Samsung Design System Fonts ─────────────────────────────────────────────
// SamsungOne is proprietary. Roboto (body) + Roboto Slab (display) are the
// closest open-source equivalents to Samsung's type system.

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-roboto",
  display: "swap",
});

const robotoSlab = Roboto_Slab({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-roboto-slab",
  display: "swap",
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
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        {/* Tema antes da primeira pintura, sem piscar (components/layout/ThemeScript.tsx). */}
        <ThemeScript />
      </head>
      <body className={`${roboto.variable} ${robotoSlab.variable} font-sans antialiased`}>
        {/* Skip to main content — Accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-sm focus:bg-accent-primary focus:px-4 focus:py-2 focus:text-white"
        >
          Pular para o conteúdo principal
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
