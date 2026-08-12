import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageHeaderBanner } from "@/components/layout/PageHeaderBanner";
import { PageClosingCta } from "@/components/layout/PageClosingCta";
import { navLinks } from "@/components/hero/hero.data";
import { InscripcionesIntro } from "@/components/inscripciones/InscripcionesIntro";
import { StepsSection } from "@/components/inscripciones/StepsSection";
import { RequirementsSection } from "@/components/inscripciones/RequirementsSection";

export const metadata: Metadata = {
  title: "Inscripciones — Fuerzas Básicas de Jaguares de Córdoba FC",
  description: "Inscribe a tu hijo en la Sub-15 de Fuerzas Básicas de Jaguares de Córdoba FC.",
};

export default function InscripcionesPage() {
  return (
    <>
      <Navbar links={navLinks} activeHref="/inscripciones" variant="solid" />
      <main>
        <PageHeaderBanner title="Inscripciones" breadcrumbLabel="Inscripciones" />
        <InscripcionesIntro />
        <StepsSection />
        <RequirementsSection />
        <PageClosingCta
          title={
            <>
              ¿Listo para
              <br />
              empezar?
            </>
          }
          description="Escríbenos y coordinamos la evaluación deportiva de tu hijo esta semana."
          ctaLabel="Escribir ahora"
          ctaHref="/contacto"
        />
      </main>
      <Footer />
    </>
  );
}
