import Link from "next/link";
import { Trophy } from "lucide-react";
import { Badge } from "../../ui/Badge";
import { Card, CardHeader } from "../../ui/Card";
import { callStatusTone, formatMatchDateShort, formatParticipation } from "@/lib/data/match-stats";
import type { PlayerCallupHistoryEntry } from "@/lib/data/match-callups";

/**
 * Historial de partidos del jugador — convocatoria y participación, alimentado
 * automáticamente por el módulo de Partidos. Nunca depende de que existan
 * estadísticas registradas: sin datos, muestra un estado vacío elegante.
 */
export function PlayerMatchHistory({ history }: { history: PlayerCallupHistoryEntry[] }) {
  return (
    <Card>
      <CardHeader title="Historial de partidos" subtitle="Convocatoria y participación reciente" />
      {history.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-8 text-center">
          <Trophy className="h-6 w-6 text-jaguar-ink/20" strokeWidth={1.6} aria-hidden />
          <p className="mt-2 text-[12.5px] lg:text-[13.5px] text-jaguar-ink/45">Aún no ha sido convocado a ningún partido.</p>
        </div>
      ) : (
        <div className="mt-3 divide-y divide-jaguar-ink/6 px-3 pb-3">
          {history.map((entry) => (
            <Link
              key={entry.id}
              href={`/plataforma/partidos/${entry.match.id}`}
              className="flex items-center justify-between gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-jaguar-mist/50"
            >
              <div className="min-w-0">
                <p className="truncate text-[13px] lg:text-[14px] font-semibold text-jaguar-ink">
                  {entry.match.is_home ? "Jaguares vs. " : "vs. "}
                  {entry.match.opponent}
                </p>
                <p className="mt-0.5 truncate text-[11.5px] lg:text-[12.5px] text-jaguar-ink/45">
                  {formatMatchDateShort(entry.match.match_date)} · {formatParticipation(entry)}
                  {entry.goals > 0 ? ` · ${entry.goals} gol${entry.goals > 1 ? "es" : ""}` : ""}
                </p>
              </div>
              <Badge tone={callStatusTone[entry.call_status]}>{entry.call_status}</Badge>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}
