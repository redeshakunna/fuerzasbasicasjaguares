import { PartidosShell } from "@/components/dashboard/partidos/PartidosShell";
import { getMatches } from "@/lib/data/matches";
import { getPlayers } from "@/lib/data/players";
import { getCallupsForMatches } from "@/lib/data/match-callups";
import { getCoachingStaff } from "@/lib/data/staff";
import { parseCategory } from "@/lib/data/categories";

export const dynamic = "force-dynamic";

interface PartidosPageProps {
  searchParams: Promise<{ categoria?: string }>;
}

/** Partidos — el centro deportivo de la academia: resumen, calendario, convocatorias e historial. */
export default async function PartidosPage({ searchParams }: PartidosPageProps) {
  const { categoria } = await searchParams;
  const category = parseCategory(categoria);

  const [matches, players, staff] = await Promise.all([getMatches(category), getPlayers(category), getCoachingStaff()]);
  const callupsByMatch = await getCallupsForMatches(matches.map((m) => m.id));

  return <PartidosShell category={category} matches={matches} players={players} callupsByMatch={callupsByMatch} staff={staff} />;
}
