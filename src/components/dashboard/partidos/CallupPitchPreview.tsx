"use client";

import { AnimatePresence, motion } from "framer-motion";
import { callupPositionLabel, getFullName } from "@/lib/data/players-stats";
import type { PlayerRow } from "@/lib/data/players";

const bandOrder: PlayerRow["position_group"][] = ["Arquero", "Defensa", "Volante", "Extremo", "Delantero"];

// Mismo criterio de acento por posición que ya usa el resto de la plataforma
// (positionGroupTone en players-stats.ts) — así el mosaico no introduce una paleta nueva.
const bandDot: Record<PlayerRow["position_group"], string> = {
  Arquero: "bg-jaguar-gold-500",
  Defensa: "bg-violet-500",
  Volante: "bg-jaguar-turquoise-500",
  Extremo: "bg-jaguar-maroon-500",
  Delantero: "bg-jaguar-green-500",
};

const bandChip: Record<PlayerRow["position_group"], string> = {
  Arquero: "bg-jaguar-gold-500",
  Defensa: "bg-violet-500",
  Volante: "bg-jaguar-turquoise-500",
  Extremo: "bg-jaguar-maroon-500",
  Delantero: "bg-jaguar-green-600",
};

/**
 * Mosaico de convocados para la Convocatoria — no simula una cancha de 11 (los
 * convocados pueden ser hasta 20+), sino una "pared de dorsales" agrupada por
 * línea de posición. A medida que el técnico confirma jugadores, aparecen aquí
 * con dorsal y apodo, sin límite de cupo.
 */
export function CallupPitchPreview({ players }: { players: PlayerRow[] }) {
  const bands = bandOrder
    .map((group) => ({ group, groupPlayers: players.filter((p) => p.position_group === group) }))
    .filter(({ groupPlayers }) => groupPlayers.length > 0);

  return (
    <div className="px-4 sm:px-6">
      <div className="rounded-2xl border border-jaguar-ink/8 bg-jaguar-mist/40 px-4 py-4 sm:px-6 sm:py-5">
        {bands.length === 0 ? (
          <p className="py-6 text-center text-[12.5px] lg:text-[13.5px] font-medium text-jaguar-ink/40">
            Marca jugadores en la lista y aparecerán aquí, agrupados por posición
          </p>
        ) : (
          <div className="space-y-4">
            {bands.map(({ group, groupPlayers }) => (
              <div key={group}>
                <p className="flex items-center gap-1.5 text-[10.5px] lg:text-[11.5px] font-bold uppercase tracking-[0.06em] text-jaguar-ink/40">
                  <span className={`h-1.5 w-1.5 rounded-full ${bandDot[group]}`} aria-hidden />
                  {callupPositionLabel[group]} · {groupPlayers.length}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <AnimatePresence>
                    {groupPlayers.map((player) => {
                      const fullName = getFullName(player);
                      return (
                        <motion.div
                          key={player.id}
                          initial={{ opacity: 0, scale: 0.6, y: 6 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.6 }}
                          transition={{ type: "spring", stiffness: 420, damping: 28 }}
                          className="flex items-center gap-2 rounded-full bg-white py-1 pl-1 pr-3 shadow-sm ring-1 ring-jaguar-ink/6"
                          title={fullName}
                        >
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] lg:text-[12px] font-black leading-none text-white ${bandChip[group]}`}
                          >
                            {player.jersey_number ?? "—"}
                          </span>
                          <span className="max-w-[110px] truncate text-[12px] lg:text-[13px] font-semibold text-jaguar-ink">
                            {player.nickname || fullName}
                          </span>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
