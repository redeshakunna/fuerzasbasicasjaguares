import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageHeaderBanner } from "@/components/layout/PageHeaderBanner";
import { navLinks } from "@/components/hero/hero.data";
import { getPublicHomeStats } from "@/lib/data/public-stats";
import { getPublicJugadoresStats, getPublicNextMatch, getPublicRoster } from "@/lib/data/public-jugadores";
import { TeamHeroSection } from "@/components/jugadores/TeamHeroSection";
import { RosterSection } from "@/components/jugadores/RosterSection";
import { MoreThanFootballSection } from "@/components/jugadores/MoreThanFootballSection";
import { JourneySection } from "@/components/jugadores/JourneySection";
import { MatchStatsGallerySection } from "@/components/jugadores/MatchStatsGallerySection";
import { FutureBanner } from "@/components/jugadores/FutureBanner";
import { ComingSoonCategorySection } from "@/components/jugadores/ComingSoonCategorySection";
import { activeCategories, parseCategory } from "@/lib/data/categories";

interface JugadoresPageProps {
  searchParams: Promise<{ categoria?: string }>;
}

export async function generateMetadata({ searchParams }: JugadoresPageProps): Promise<Metadata> {
  const { categoria } = await searchParams;
  const category = parseCategory(categoria);
  return {
    title: `Jugadores ${category} — Fuerzas Básicas de Jaguares de Córdoba FC`,
    description:
      category === "Sub-15"
        ? "Conoce el plantel Sub-15 de Fuerzas Básicas de Jaguares de Córdoba FC y su camino de formación."
        : `La categoría ${category} de Fuerzas Básicas de Jaguares de Córdoba FC llegará próximamente.`,
  };
}

/**
 * Página pública "Jugadores" — entra desde el menú desplegable del Navbar
 * (?categoria=). Por ahora solo Sub-15 tiene plantel real; Sub-13 y Sub-17
 * muestran un aviso de "próximamente" (mismo criterio que la plataforma
 * interna y que /categorias).
 */
export default async function JugadoresPage({ searchParams }: JugadoresPageProps) {
  const { categoria } = await searchParams;
  const category = parseCategory(categoria);
  const isActiveCategory = activeCategories.includes(category);

  if (!isActiveCategory) {
    return (
      <>
        <Navbar links={navLinks} activeHref="/jugadores" variant="solid" />
        <main>
          <PageHeaderBanner title={`Jugadores ${category}`} breadcrumbLabel="Jugadores" />
          <ComingSoonCategorySection category={category} />
          <FutureBanner />
        </main>
        <Footer />
      </>
    );
  }

  const [homeStats, jugadoresStats, roster, nextMatch] = await Promise.all([
    getPublicHomeStats(),
    getPublicJugadoresStats(),
    getPublicRoster(),
    getPublicNextMatch(),
  ]);

  return (
    <>
      <Navbar links={navLinks} activeHref="/jugadores" variant="solid" />
      <main>
        <PageHeaderBanner title="Jugadores" breadcrumbLabel="Jugadores" />
        <TeamHeroSection stats={homeStats} />
        <RosterSection roster={roster} />
        <MoreThanFootballSection />
        <JourneySection />
        <MatchStatsGallerySection stats={jugadoresStats} nextMatch={nextMatch} />
        <FutureBanner />
      </main>
      <Footer />
    </>
  );
}
