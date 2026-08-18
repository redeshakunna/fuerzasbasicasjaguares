import { HeroSection } from "@/components/hero/HeroSection";
import { heroSlides } from "@/components/hero/hero.data";
import { Footer } from "@/components/layout/Footer";
import { MatchAndNewsSection } from "@/components/sections/MatchAndNewsSection";
import { MethodologySection } from "@/components/sections/MethodologySection";
import { SubQuinceSection } from "@/components/sections/SubQuinceSection";
import { getPublicHomeStats } from "@/lib/data/public-stats";
import { getUpcomingConfirmedMatches } from "@/lib/data/matches";

export default async function Home() {
  const [stats, upcomingMatches] = await Promise.all([getPublicHomeStats(), getUpcomingConfirmedMatches()]);

  return (
    <>
      <main>
        <HeroSection slides={heroSlides} />
        <MethodologySection />
        <SubQuinceSection stats={stats} />
        <MatchAndNewsSection matches={upcomingMatches} />
      </main>
      <Footer />
    </>
  );
}
