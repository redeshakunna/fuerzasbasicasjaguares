"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Star } from "lucide-react";
import { Avatar } from "../ui/Avatar";
import { Card, CardHeader } from "../ui/Card";
import { StarRating } from "../ui/StarRating";
import { getFullName } from "@/lib/data/players-stats";
import type { PlayerRow } from "@/lib/data/players";
import type { Tables } from "@/lib/supabase/database.types";

type EvaluationRow = Tables<"evaluations">;

/** Lista de jugadores de la sesión — un click abre el Drawer de evaluación rápida. */
export function EvaluationPlayerList({
  players,
  evaluations,
  onEvaluate,
}: {
  players: PlayerRow[];
  evaluations: Map<string, EvaluationRow>;
  onEvaluate: (playerId: string) => void;
}) {
  const [search, setSearch] = useState("");
  const filtered = players.filter((p) => getFullName(p).toLowerCase().includes(search.toLowerCase()));

  return (
    <Card>
      <CardHeader
        title={`Jugadores (${players.length})`}
        action={
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-jaguar-ink/30" strokeWidth={2} aria-hidden />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar jugador…"
              className="w-full rounded-xl border border-jaguar-ink/10 bg-jaguar-mist/40 py-2 pl-8 pr-3 text-[12.5px] lg:text-[13.5px] text-jaguar-ink placeholder:text-jaguar-ink/35 focus:border-jaguar-green-500/40 focus:outline-none sm:w-auto"
            />
          </div>
        }
      />
      {filtered.length === 0 ? (
        <p className="px-6 py-8 text-center text-[13px] lg:text-[14px] text-jaguar-ink/40">
          {players.length === 0 ? "No hay jugadores en esta categoría todavía." : "No hay jugadores que coincidan con la búsqueda."}
        </p>
      ) : (
        <div className="mt-3 grid grid-cols-1 gap-x-2 px-3 pb-3 sm:grid-cols-2">
          {filtered.map((player) => {
            const fullName = getFullName(player);
            const evaluation = evaluations.get(player.id);
            const rating = evaluation?.overall_score != null ? evaluation.overall_score / 2 : null;
            return (
              <div
                key={player.id}
                className={`flex items-center gap-2.5 rounded-xl border-l-[3px] px-2 py-2.5 transition-colors hover:bg-jaguar-mist/40 ${
                  evaluation?.is_standout ? "border-l-jaguar-gold-500 bg-jaguar-gold-500/[0.04]" : "border-l-transparent"
                }`}
              >
                <Link href={`/plataforma/jugadores/${player.id}`} className="shrink-0">
                  <Avatar initials={fullName.slice(0, 2).toUpperCase()} photoUrl={player.photo_url} size={38} />
                </Link>
                <Link href={`/plataforma/jugadores/${player.id}`} className="group min-w-0 flex-1">
                  <p className="flex items-center gap-1 truncate text-[13px] lg:text-[14px] font-semibold text-jaguar-ink group-hover:underline">
                    {fullName}
                    {evaluation?.is_standout ? (
                      <Star className="h-3 w-3 shrink-0 text-jaguar-gold-500" strokeWidth={0} fill="currentColor" aria-hidden />
                    ) : null}
                  </p>
                  <p className="text-[11.5px] lg:text-[12.5px] text-jaguar-ink/45">{player.position}</p>
                </Link>
                {rating !== null ? (
                  <div className="flex shrink-0 items-center gap-1 rounded-full bg-jaguar-gold-500/10 px-2 py-1 sm:gap-1.5 sm:bg-transparent sm:px-0 sm:py-0">
                    <span className="hidden sm:block">
                      <StarRating value={rating} size={12} />
                    </span>
                    <span className="text-[11px] lg:text-[12px] font-bold text-jaguar-gold-700 sm:text-[12px] sm:text-jaguar-ink">
                      {rating.toFixed(1)}
                    </span>
                  </div>
                ) : (
                  <span className="shrink-0 rounded-full bg-jaguar-mist/70 px-2 py-1 text-[10.5px] lg:text-[11.5px] font-semibold text-jaguar-ink/40 sm:bg-transparent sm:px-0 sm:py-0 sm:text-[11.5px] sm:font-normal sm:text-jaguar-ink/30">
                    <span className="sm:hidden">Pendiente</span>
                    <span className="hidden sm:inline">Sin evaluar</span>
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => onEvaluate(player.id)}
                  className="shrink-0 rounded-lg bg-jaguar-green-600 px-3 py-1.5 text-[11.5px] lg:text-[12.5px] font-semibold text-white transition-colors hover:bg-jaguar-green-700"
                >
                  {evaluation ? "Editar" : "Evaluar"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
