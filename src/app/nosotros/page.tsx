import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageHeaderBanner } from "@/components/layout/PageHeaderBanner";
import { navLinks } from "@/components/hero/hero.data";
import { IntroSection } from "@/components/nosotros/IntroSection";
import { PillarsSection } from "@/components/nosotros/PillarsSection";
import { HistorySection } from "@/components/nosotros/HistorySection";
import { WhyChooseUsSection } from "@/components/nosotros/WhyChooseUsSection";
import { StatsSection } from "@/components/nosotros/StatsSection";
import { ClosingCta } from "@/components/nosotros/ClosingCta";

export const metadata: Metadata = {
  title: "Nosotros — Fuerzas Básicas de Jaguares de Córdoba FC",
  description:
    "Conoce la misión, visión y valores de Fuerzas Básicas de Jaguares de Córdoba FC — formamos talento, construimos sueños.",
};

/**
 * Página "Nosotros" — primera del sitio institucional que deja de ser
 * ancla del home para ser ruta propia (mismo patrón que seguirán
 * Categorías, Jugadores, Entrenadores y Contacto).
 */
export default function NosotrosPage() {
  return (
    <>
      <Navbar links={navLinks} activeHref="/nosotros" variant="solid" />
      <main>
        <PageHeaderBanner title="Nosotros" breadcrumbLabel="Nosotros" />
        <IntroSection />
        <PillarsSection />
        <HistorySection />
        <WhyChooseUsSection />
        <StatsSection />
        <ClosingCta />
      </main>
      <Footer />
    </>
  );
}
