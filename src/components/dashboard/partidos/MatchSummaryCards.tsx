import type { ComponentType, ReactNode } from "react";
import { CalendarClock, Goal, ShieldAlert, Target, Trophy } from "lucide-react";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { formatMatchDateShort, formatMatchTime12h, type SeasonStats } from "@/lib/data/match-stats";
import type { MatchRow } from "@/lib/data/matches";

function StatCard({
  icon: Icon,
  label,
  value,
  empty,
}: {
  icon: ComponentType<{ className?: string; strokeWidth?: number; "aria-hidden"?: boolean }>;
  label: string;
  value: ReactNode;
  empty: boolean;
}) {
  return (
    <Card className="p-4">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-jaguar-mist/70 text-jaguar-ink/40">
        <Icon className="h-4 w-4" strokeWidth={1.9} aria-hidden />
      </span>
      <p className={`mt-3 text-[22px] lg:text-[24px] font-extrabold ${empty ? "text-jaguar-ink/25" : "text-jaguar-ink"}`}>{value}</p>
      <p className="mt-0.5 text-[12px] lg:text-[13px] font-medium text-jaguar-ink/50">{label}</p>
      {empty ? <p className="mt-1 text-[11px] lg:text-[12px] text-jaguar-ink/30">Sin datos disponibles</p> : null}
    </Card>
  );
}

/** Resumen de temporada — 6 tarjetas, siempre con estado vacío elegante si no hay datos aún. */
export function MatchSummaryCards({ nextMatch, stats }: { nextMatch: MatchRow | null; stats: SeasonStats }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
      <Card className="p-4">
        <p className="text-[11px] lg:text-[12px] font-bold uppercase tracking-[0.03em] text-jaguar-ink/40">Próximo partido</p>
        {nextMatch ? (
          <>
            <p className="mt-2 truncate text-[14px] lg:text-[15.5px] font-bold text-jaguar-ink">
              {nextMatch.is_home ? "Jaguares vs. " : "vs. "}
              {nextMatch.opponent}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-[12px] lg:text-[13px] text-jaguar-ink/50">
              <CalendarClock className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              {formatMatchDateShort(nextMatch.match_date)} · {formatMatchTime12h(nextMatch.match_time)}
            </p>
            <div className="mt-2.5">
              <Badge tone="turquoise">Convocatoria abierta</Badge>
            </div>
          </>
        ) : (
          <p className="mt-4 text-[12.5px] lg:text-[13.5px] text-jaguar-ink/35">No hay partidos programados aún.</p>
        )}
      </Card>

      <StatCard icon={Trophy} label="Partidos jugados" value={stats.played} empty={stats.played === 0} />
      <StatCard
        icon={Target}
        label="Efectividad"
        value={`${stats.effectiveness ?? 0}%`}
        empty={stats.effectiveness === null}
      />
      <StatCard icon={Goal} label="Goles a favor" value={stats.goalsFor} empty={stats.played === 0} />
      <StatCard icon={ShieldAlert} label="Goles en contra" value={stats.goalsAgainst} empty={stats.played === 0} />
      <StatCard
        icon={Target}
        label="Diferencia de gol"
        value={stats.played > 0 ? (stats.goalDifference > 0 ? `+${stats.goalDifference}` : stats.goalDifference) : 0}
        empty={stats.played === 0}
      />
    </div>
  );
}
