import { Info } from "lucide-react";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { CategorySelector } from "@/components/dashboard/CategorySelector";
import { DashboardFooter } from "@/components/dashboard/DashboardFooter";
import { ExecutiveSummary } from "@/components/dashboard/ExecutiveSummary";
import { KpiGrid } from "@/components/dashboard/KpiGrid";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { PlayersTableWidget } from "@/components/dashboard/PlayersTableWidget";
import { SquadStatusDonut } from "@/components/dashboard/SquadStatusDonut";
import { TodayActionQueue } from "@/components/dashboard/TodayActionQueue";
import { UpcomingMatches } from "@/components/dashboard/UpcomingMatches";
import { WeeklyCalendar } from "@/components/dashboard/WeeklyCalendar";
import { WelcomeBlock } from "@/components/dashboard/WelcomeBlock";
import { getUpcomingMatches, getWeeklyEvents } from "@/lib/data/dashboard";
import { getPlayers } from "@/lib/data/players";
import { getHomeKpis, getSquadStatus, getTopPlayers } from "@/lib/data/players-stats";
import { activeCategories, categories, parseCategory, type Category } from "@/lib/data/categories";
import { getTodayActionQueue } from "@/lib/data/action-queue";
import { getCurrentStaffProfile } from "@/lib/data/player-profile";
import { getFinanceSummary } from "@/lib/data/finance";
import { getTeamPerformanceSeries } from "@/lib/data/team-performance";

export const dynamic = "force-dynamic";

interface PlataformaDashboardProps {
  searchParams: Promise<{ categoria?: string }>;
}

/**
 * Dashboard principal — conectado a Supabase (tablas `players`, `matches`,
 * `trainings`, `evaluations`). Responde en <5s: qué tengo hoy, cómo va mi
 * categoría, qué jugador necesita atención, cuál es el próximo partido. El
 * rendimiento histórico (gráfico de área) usa el promedio real de
 * evaluaciones del plantel, con los partidos jugados superpuestos como
 * marcadores — sin datos de relleno. Un selector de categoría
 * (Sub-13/Sub-15/Sub-17) filtra todo lo demás — por ahora solo Sub-15 tiene
 * plantel activo.
 *
 * Aterrizaje por rol: entrenador (y admin, que también opera el día a día)
 * ven la cola de acción operativa. Coordinador y directivo ven un resumen
 * ejecutivo — seguimiento general, no captura diaria — per Bloque 7.
 */
export default async function PlataformaDashboard({ searchParams }: PlataformaDashboardProps) {
  const { categoria } = await searchParams;
  const category = parseCategory(categoria);
  const isActiveCategory = activeCategories.includes(category);

  const [players, matches, weeklyEvents, staff, performance] = await Promise.all([
    getPlayers(category),
    getUpcomingMatches(category),
    getWeeklyEvents(category),
    getCurrentStaffProfile(),
    getTeamPerformanceSeries(category),
  ]);

  const isOversightRole = staff?.role === "coordinador" || staff?.role === "directivo";

  const [actionQueue, financeSummary, categoryRosters] = await Promise.all([
    isOversightRole ? Promise.resolve(null) : getTodayActionQueue(category),
    isOversightRole ? getFinanceSummary() : Promise.resolve(null),
    Promise.all(categories.map((cat) => getPlayers(cat))),
  ]);

  const rostersByCategory = categories.reduce(
    (acc, cat, index) => {
      acc[cat] = getTopPlayers(categoryRosters[index] ?? []);
      return acc;
    },
    {} as Record<Category, ReturnType<typeof getTopPlayers>>,
  );

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold leading-snug text-jaguar-ink lg:text-[26px]">
              Bienvenido al desarrollo del futuro <span className="text-jaguar-green-600">Jaguares</span>
            </h1>
            <p className="mt-1 text-[14px] lg:text-[15.5px] text-jaguar-ink/55">Formamos talento, construimos sueños.</p>
          </div>
          <div data-tour="categoria-selector">
            <CategorySelector active={category} />
          </div>
        </div>

        {!isActiveCategory ? (
          <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-jaguar-gold-500/10 px-4 py-3 text-[13px] lg:text-[14px] font-medium text-jaguar-gold-700">
            <Info className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
            La categoría {category} aún no tiene plantel activo — llegará próximamente. Por ahora, todo el
            trabajo formativo está concentrado en Sub-15.
          </div>
        ) : null}

        <div className="mt-5" data-tour="resumen-dia">
          {isOversightRole && financeSummary ? (
            <ExecutiveSummary totalPlayers={players.length} nextMatch={matches[0] ?? null} finance={financeSummary} />
          ) : actionQueue ? (
            <TodayActionQueue queue={actionQueue} />
          ) : null}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
          <WelcomeBlock category={category} />
          <UpcomingMatches matches={matches} />
        </div>
      </div>

      <div data-tour="kpis">
        <KpiGrid items={getHomeKpis(players, matches.length)} />
      </div>

      <div data-tour="calendario">
        <WeeklyCalendar events={weeklyEvents} />
      </div>

      <PerformanceChart series={performance.series} summary={performance.summary} />
      <div data-tour="plantel">
        <PlayersTableWidget rostersByCategory={rostersByCategory} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[420px_1fr]">
        <SquadStatusDonut slices={getSquadStatus(players)} />
        <ActivityFeed events={[]} />
      </div>

      <DashboardFooter />
    </div>
  );
}
