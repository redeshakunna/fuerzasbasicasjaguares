"use client";

import { Trophy } from "lucide-react";
import { Badge } from "../ui/Badge";
import { Card, CardHeader } from "../ui/Card";
import { formatMatchDateShort, formatMatchTime12h, matchOutcome, outcomeBadgeTone } from "@/lib/data/match-stats";
import type { MatchRow } from "@/lib/data/matches";

/** Agenda de próximos partidos — click abre el panel de detalle (Drawer), sin salir de la página. */
export function UpcomingAgenda({ matches, onSelect }: { matches: MatchRow[]; onSelect: (matchId: string) => void }) {
  return (
    <Card className="flex h-full flex-col pb-5">
      <CardHeader title="Próximos partidos" />
      {matches.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-8 text-center">
          <Trophy className="h-6 w-6 text-jaguar-ink/20" strokeWidth={1.6} aria-hidden />
          <p className="mt-2 text-[12.5px] lg:text-[13.5px] text-jaguar-ink/45">Aún no hay partidos programados.</p>
        </div>
      ) : (
        <div className="mt-2 flex-1 space-y-1 px-3">
          {matches.slice(0, 6).map((match) => (
            <button
              type="button"
              key={match.id}
              onClick={() => onSelect(match.id)}
              className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors hover:bg-jaguar-mist/50"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-jaguar-turquoise-500/10 text-jaguar-turquoise-600">
                <Trophy className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] lg:text-[14px] font-bold text-jaguar-ink">{match.opponent}</p>
                <p className="mt-0.5 truncate text-[11.5px] lg:text-[12.5px] text-jaguar-ink/50">
                  {formatMatchDateShort(match.match_date)} · {formatMatchTime12h(match.match_time)}
                </p>
                {match.location ? <p className="truncate text-[11px] lg:text-[12px] text-jaguar-ink/40">{match.location}</p> : null}
              </div>
              <Badge tone={outcomeBadgeTone[matchOutcome(match)]}>{matchOutcome(match) === "Programado" ? match.status : matchOutcome(match)}</Badge>
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}
