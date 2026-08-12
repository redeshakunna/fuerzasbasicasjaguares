import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageHeaderBanner } from "@/components/layout/PageHeaderBanner";
import { PageClosingCta } from "@/components/layout/PageClosingCta";
import { navLinks } from "@/components/hero/hero.data";
import { getPublicHomeStats } from "@/lib/data/public-stats";
import { EntrenadoresIntro } from "@/components/entrenadores/EntrenadoresIntro";
import { StaffCardsSection } from "@/components/entrenadores/StaffCardsSection";
import { StaffRolesSection } from "@/components/entrenadores/StaffRolesSection";
import { PhilosophySection } from "@/components/entrenadores/PhilosophySection";
import { ImpactStatsSection } from "@/components/entrenadores/ImpactStatsSection";

export const metadata: Metadata = {
  title: "Entrenadores — Fuerzas Básicas de Jaguares de Córdoba FC",
  description: "Conoce al cuerpo técnico de Fuerzas Básicas de Jaguares de Córdoba FC y su enfoque de formación.",
};

export default async function EntrenadoresPage() {
  const stats = await getPublicHomeStats();

  return (
    <>
      <Navbar links={navLinks} activeHref="/entrenadores" variant="solid" />
      <main>
        <PageHeaderBanner title="Entrenadores" breadcrumbLabel="Entrenadores" />
        <EntrenadoresIntro />
        <StaffCardsSection />
        <StaffRolesSection />
        <PhilosophySection />
        <ImpactStatsSection stats={stats} />
        <PageClosingCta
          title={
            <>
              Juntos construimos
              <br />
              el futuro
            </>
          }
          description="Nuestro cuerpo técnico trabaja cada día para formar jugadores competitivos dentro y fuera de la cancha. Únete a la familia Jaguares."
          ctaLabel="Únete a la familia Jaguares"
          ctaHref="/contacto"
        />
      </main>
      <Footer />
    </>
  );
}
