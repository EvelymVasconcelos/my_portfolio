import { setRequestLocale } from "next-intl/server";
import { AnchorFocus } from "@/components/layout/AnchorFocus";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Signature } from "@/components/layout/Signature";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Projects } from "@/components/sections/Projects";
import { Experience } from "@/components/sections/Experience";
import { Research } from "@/components/sections/Research";
import { Contact } from "@/components/sections/Contact";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

/**
 * Página única, com as seções da referência e a Pesquisa a mais. As Recomendações entram quando a dona enviar
 * os textos (bloco 6 da change estrutura-movimento-e-cena-3d).
 */
export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  // Renderização estática por idioma (next-intl).
  setRequestLocale(locale);

  return (
    <>
      <Navbar logo={<Signature />} />
      <AnchorFocus />

      {/* `overflow-x: clip` (globals.css), e não `hidden`: `hidden` criaria um contêiner de rolagem e quebraria
          o `position: sticky` das áreas presas (lição do protótipo, D4). */}
      <div className="page-clip">
        <main id="main-content">
          <Hero />
          <About />
          <Projects />
          <Experience />
          <Research />
          <Contact />
        </main>

        <Footer />
      </div>
    </>
  );
}
