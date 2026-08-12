import { Info } from "lucide-react";
import { KpiGrid } from "@/components/dashboard/KpiGrid";
import { JugadoresContent } from "@/components/dashboard/jugadores/JugadoresContent";
import { PlayersPageHeader } from "@/components/dashboard/jugadores/PlayersPageHeader";
import { QuickStats } from "@/components/dashboard/jugadores/QuickStats";
import { RecentActivityRow } from "@/components/dashboard/jugadores/RecentActivityRow";
import { SquadAlerts } from "@/components/dashboard/jugadores/SquadAlerts";
import { UpcomingBirthdays } from "@/components/dashboard/jugadores/UpcomingBirthdays";
import { getPendingEvaluationsCount, getPlayers } from "@/lib/data/players";
import { getLastTrainingAttendanceMap } from "@/lib/data/attendance";
import {
  getByAge,
  getByPosition,
  getFootHandedness,
  getPlayersKpis,
  getSquadAlerts,
  getUpcomingBirthdays,
  toRosterPlayer,
} from "@/lib/data/players-stats";
import { activeCategories, parseCategory } from "@/lib/data/categories";

export const dynamic = "force-dynamic";

interface JugadoresPageProps {
  searchParams: Promise<{ categoria?: string }>;
}

/**
 * Gestión de Jugadores — entra desde el menú "Categorías" del sidebar, ya
 * filtrado por categoría (`?categoria=`). Por ahora solo Sub-15 tiene
 * plantel real conectado a Supabase (tabla `players`); Sub-13 y Sub-17
 * muestran un aviso de "próximamente" en vez de una lista vacía.
 */
export default async function JugadoresPage({ searchParams }: JugadoresPageProps) {
  const { categoria } = await searchParams;
  const category = parseCategory(categoria);
  const isActiveCategory = activeCategories.includes(category);

  const [playerRows, pendingEvaluations] = await Promise.all([
    getPlayers(category),
    getPendingEvaluationsCount(),
  ]);

  const lastTrainingByPlayer = await getLastTrainingAttendanceMap(playerRows.map((p) => p.id));
  const players = playerRows.map((row) => toRosterPlayer(row, lastTrainingByPlayer.get(row.id) ?? null));

  return (
    <div className="space-y-6">
      <PlayersPageHeader category={category} />

      {!isActiveCategory ? (
        <div className="flex items-center gap-2.5 rounded-xl bg-jaguar-gold-500/10 px-4 py-3 text-[13px] font-medium text-jaguar-gold-700">
          <Info className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
          La categoría {category} aún no tiene plantel activo — llegará próximamente. Por ahora, todo el plantel
          registrado está en Sub-15.
        </div>
      ) : null}

      <KpiGrid items={getPlayersKpis(playerRows)} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_340px]">
        <JugadoresContent players={players} />

        <div className="space-y-6">
          <UpcomingBirthdays birthdays={getUpcomingBirthdays(playerRows)} />
          <SquadAlerts alerts={getSquadAlerts(playerRows, pendingEvaluations)} />
          <QuickStats
            footHandedness={getFootHandedness(playerRows)}
            byPosition={getByPosition(playerRows)}
            byAge={getByAge(playerRows)}
            totalPlayers={playerRows.length}
          />
        </div>
      </div>

      <RecentActivityRow activities={[]} />
    </div>
  );
}
