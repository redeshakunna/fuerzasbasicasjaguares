"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Users } from "lucide-react";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { CategorySelector } from "../CategorySelector";
import { CreateMatchDialog } from "./CreateMatchDialog";
import { MatchesCalendarMonth } from "./MatchesCalendarMonth";
import { UpcomingAgenda } from "./UpcomingAgenda";
import { MatchHistoryCards } from "./MatchHistoryCards";
import { MatchSummaryCards } from "./MatchSummaryCards";
import { MatchDrawer } from "./MatchDrawer";
import { computeSeasonStats, formatMatchDateShort, formatMatchTime12h, matchOutcome, outcomeBadgeTone } from "@/lib/data/match-stats";
import { getFullName } from "@/lib/data/players-stats";
import type { Category } from "@/lib/data/categories";
import type { MatchRow } from "@/lib/data/matches";
import type { PlayerRow } from "@/lib/data/players";
import type { CallupRow } from "@/lib/data/match-callups";
import type { StaffProfile } from "@/lib/data/staff";

/** El centro deportivo de la academia — resumen, calendario, agenda, convocatorias e historial en una sola pantalla. */
export function PartidosShell({
  category,
  matches,
  players,
  callupsByMatch,
  staff,
}: {
  category: Category;
  matches: MatchRow[];
  players: PlayerRow[];
  callupsByMatch: Record<string, CallupRow[]>;
  staff: StaffProfile[];
}) {
  const [openMatchId, setOpenMatchId] = useState<string | null>(null);

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = useMemo(
    () => matches.filter((m) => m.match_date >= today).sort((a, b) => a.match_date.localeCompare(b.match_date)),
    [matches, today],
  );
  const played = useMemo(
    () =>
      matches
        .filter((m) => m.our_score !== null && m.opponent_score !== null)
        .sort((a, b) => b.match_date.localeCompare(a.match_date)),
    [matches],
  );
  const nextMatch = upcoming[0] ?? null;
  const lastPlayed = played[0] ?? null;
  const stats = useMemo(() => computeSeasonStats(matches), [matches]);
  const openMatch = matches.find((m) => m.id === openMatchId) ?? null;
  const playerById = useMemo(() => new Map(players.map((p) => [p.id, p])), [players]);

  const topScorer = useMemo(() => {
    const goalsByPlayer = new Map<string, number>();
    for (const rows of Object.values(callupsByMatch)) {
      for (const row of rows) {
        if (row.goals > 0) goalsByPlayer.set(row.player_id, (goalsByPlayer.get(row.player_id) ?? 0) + row.goals);
      }
    }
    let best: { playerId: string; goals: number } | null = null;
    for (const [playerId, goals] of goalsByPlayer) {
      if (!best || goals > best.goals) best = { playerId, goals };
    }
    if (!best) return null;
    const player = playerById.get(best.playerId);
    return player ? { player, goals: best.goals } : null;
  }, [callupsByMatch, playerById]);

  const nextMatchCallups = nextMatch ? callupsByMatch[nextMatch.id] ?? [] : [];
  const nextMatchConfirmedCount = nextMatchCallups.filter((c) => c.call_status === "Confirmado").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold leading-snug text-jaguar-ink lg:text-[30px]">
            <span className="text-jaguar-green-600">Partidos</span>
          </h1>
          <p className="mt-1.5 max-w-md text-[14px] lg:text-[15.5px] text-jaguar-ink/55">
            Programa, organiza y analiza todos los partidos de la categoría.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <CategorySelector active={category} basePath="/plataforma/partidos" />
          <CreateMatchDialog initialCategory={category} />
        </div>
      </div>

      <MatchSummaryCards nextMatch={nextMatch} stats={stats} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.3fr_1fr_1fr]">
        <MatchesCalendarMonth matches={matches} onSelect={setOpenMatchId} />
        <UpcomingAgenda matches={upcoming} onSelect={setOpenMatchId} />
        <div className="space-y-4">
          <Card className="p-5">
            <p className="text-[13px] lg:text-[14px] font-bold text-jaguar-ink">Último partido</p>
            {lastPlayed ? (
              <button type="button" onClick={() => setOpenMatchId(lastPlayed.id)} className="mt-3 block w-full text-left">
                <p className="truncate text-[13.5px] lg:text-[15px] font-semibold text-jaguar-ink">
                  {lastPlayed.is_home ? "Jaguares vs. " : "vs. "}
                  {lastPlayed.opponent}
                </p>
                <p className="mt-1 text-[20px] lg:text-[22px] font-extrabold text-jaguar-ink">
                  {lastPlayed.our_score} <span className="text-jaguar-ink/30">-</span> {lastPlayed.opponent_score}
                </p>
                <div className="mt-2">
                  <Badge tone={outcomeBadgeTone[matchOutcome(lastPlayed)]}>{matchOutcome(lastPlayed)}</Badge>
                </div>
              </button>
            ) : (
              <div className="mt-4 flex flex-col items-center py-4 text-center">
                <p className="text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-ink/45">No hay partidos jugados aún.</p>
                <p className="mt-1 text-[11.5px] lg:text-[12.5px] text-jaguar-ink/35">
                  Cuando registres tu primer partido, verás el resultado y el resumen aquí.
                </p>
              </div>
            )}
          </Card>

          <Card className="p-5">
            <p className="text-[13px] lg:text-[14px] font-bold text-jaguar-ink">Jugador destacado</p>
            {topScorer ? (
              <Link href={`/plataforma/jugadores/${topScorer.player.id}`} className="group mt-3 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-jaguar-gold-500/15 text-[13px] lg:text-[14px] font-bold text-jaguar-gold-700">
                  {getFullName(topScorer.player).slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[13px] lg:text-[14px] font-semibold text-jaguar-ink group-hover:underline">{getFullName(topScorer.player)}</p>
                  <p className="text-[11.5px] lg:text-[12.5px] text-jaguar-ink/45">{topScorer.goals} goles esta temporada</p>
                </div>
              </Link>
            ) : (
              <div className="mt-4 flex flex-col items-center py-4 text-center">
                <Users className="h-5 w-5 text-jaguar-ink/20" strokeWidth={1.6} aria-hidden />
                <p className="mt-2 text-[12.5px] lg:text-[13.5px] text-jaguar-ink/40">Sin datos disponibles.</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      <Card className="p-5">
        <p className="text-[13px] lg:text-[14px] font-bold text-jaguar-ink">Convocaciones pendientes</p>
        {nextMatch ? (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[13.5px] lg:text-[15px] font-semibold text-jaguar-ink">
                {nextMatch.is_home ? "Jaguares vs. " : "vs. "}
                {nextMatch.opponent}
              </p>
              <p className="mt-0.5 text-[12px] lg:text-[13px] text-jaguar-ink/50">
                {formatMatchDateShort(nextMatch.match_date)} · {formatMatchTime12h(nextMatch.match_time)}
              </p>
              {nextMatchConfirmedCount > 0 ? (
                <p className="mt-1.5 text-[11.5px] lg:text-[12.5px] font-semibold text-jaguar-green-600">
                  {nextMatchConfirmedCount} confirmado{nextMatchConfirmedCount === 1 ? "" : "s"} de {players.length}
                </p>
              ) : (
                <p className="mt-1.5 text-[11.5px] lg:text-[12.5px] text-jaguar-ink/35">Convocatoria sin generar todavía.</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setOpenMatchId(nextMatch.id)}
              className="shrink-0 rounded-xl bg-jaguar-green-600 px-4 py-2.5 text-[13px] lg:text-[14px] font-semibold text-white transition-colors hover:bg-jaguar-green-700"
            >
              Convocados
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center py-8 text-center">
            <Users className="h-6 w-6 text-jaguar-ink/20" strokeWidth={1.6} aria-hidden />
            <p className="mt-2 text-[13px] lg:text-[14px] font-semibold text-jaguar-ink/45">No tienes partidos programados.</p>
            <p className="mt-1 text-[12px] lg:text-[13px] text-jaguar-ink/35">
              Cuando programes un partido, aquí podrás generar y revisar la convocatoria.
            </p>
          </div>
        )}
      </Card>

      <MatchHistoryCards matches={played} onSelect={setOpenMatchId} />

      {openMatch ? (
        <MatchDrawer
          match={openMatch}
          players={players}
          callups={callupsByMatch[openMatch.id] ?? []}
          staff={staff}
          onClose={() => setOpenMatchId(null)}
        />
      ) : null}
    </div>
  );
}
