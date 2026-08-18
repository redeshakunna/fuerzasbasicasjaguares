import { HeroSection } from "@/components/hero/HeroSection";
import { heroSlides } from "@/components/hero/hero.data";
import { Footer } from "@/components/layout/Footer";
import { MatchAndNewsSection } from "@/components/sections/MatchAndNewsSection";
import { MethodologySection } from "@/components/sections/MethodologySection";
import { SubQuinceSection } from "@/components/sections/SubQuinceSection";
import { getPublicHomeStats } from "@/lib/data/public-stats";
import { getUpcomingMatches } from "@/lib/data/matches";

export default async function Home() {
  const [stats, upcomingMatches] = await Promise.all([getPublicHomeStats(), getUpcomingMatches()]);
  // La tarjeta destacada solo muestra partidos ya confirmados por el técnico;
  // el calendario emergente (solo informativo) muestra todos los próximos,
  // confirmados o no, para que las familias vean la agenda completa.
  const confirmedMatches = upcomingMatches.filter((m) => m.status === "Confirmado");

  return (
    <>
      <main>
        <HeroSection slides={heroSlides} />
        <MethodologySection />
        <SubQuinceSection stats={stats} />
        <MatchAndNewsSection matches={confirmedMatches} allMatches={upcomingMatches} />
      </main>
      <Footer />
    </>
  );
}
