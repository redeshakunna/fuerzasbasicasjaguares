"use client";

import { Trophy } from "lucide-react";
import { Badge } from "../ui/Badge";
import { Card, CardHeader } from "../ui/Card";
import { formatMatchDateShort, matchOutcome, outcomeBadgeTone } from "@/lib/data/match-stats";
import type { MatchRow } from "@/lib/data/matches";

/** Historial de partidos jugados — tarjetas limpias, nunca una tabla gigante. */
export function MatchHistoryCards({ matches, onSelect }: { matches: MatchRow[]; onSelect: (matchId: string) => void }) {
  return (
    <Card id="historial" className="pb-5">
      <CardHeader title="Historial" subtitle="Partidos jugados por la categoría" />
      {matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
          <Trophy className="h-7 w-7 text-jaguar-ink/20" strokeWidth={1.6} aria-hidden />
          <p className="mt-3 text-[13.5px] lg:text-[15px] font-semibold text-jaguar-ink/55">No hay partidos jugados aún.</p>
          <p className="mt-1 text-[12.5px] lg:text-[13.5px] text-jaguar-ink/35">Cuando registres el primer resultado, aparecerá aquí.</p>
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-1 gap-3 px-6 pb-1 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((match) => {
            const outcome = matchOutcome(match);
            return (
              <div key={match.id} className="rounded-2xl border border-jaguar-ink/8 p-4">
                <div className="flex items-center justify-between">
                  <Badge tone={outcomeBadgeTone[outcome]}>{outcome}</Badge>
                  <span className="text-[11px] lg:text-[12px] text-jaguar-ink/40">{formatMatchDateShort(match.match_date)}</span>
                </div>
                <p className="mt-2.5 truncate text-[14px] lg:text-[15.5px] font-bold text-jaguar-ink">
                  {match.is_home ? "Jaguares vs. " : "vs. "}
                  {match.opponent}
                </p>
                <p className="mt-1 text-[20px] lg:text-[22px] font-extrabold text-jaguar-ink">
                  {match.our_score} <span className="text-jaguar-ink/30">-</span> {match.opponent_score}
                </p>
                {match.competition ? <p className="mt-0.5 truncate text-[11.5px] lg:text-[12.5px] text-jaguar-ink/45">{match.competition}</p> : null}
                <button
                  type="button"
                  onClick={() => onSelect(match.id)}
                  className="mt-3 w-full rounded-xl bg-jaguar-mist/60 px-3 py-2 text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-ink/70 transition-colors hover:bg-jaguar-mist"
                >
                  Ver resumen
                </button>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
