import { Users } from "lucide-react";
import type { RosterPlayer } from "../data/jugadores-page.data";
import { PlayerCard } from "./PlayerCard";

/** Grilla de tarjetas de jugadores del plantel real. */
export function PlayersGrid({ players }: { players: RosterPlayer[] }) {
  if (players.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[18px] border border-dashed border-jaguar-ink/12 bg-white py-16 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-jaguar-green-50 text-jaguar-green-600">
          <Users className="h-6 w-6" strokeWidth={1.75} aria-hidden />
        </span>
        <p className="mt-4 text-[14px] lg:text-[15.5px] font-bold text-jaguar-ink">Aún no hay jugadores registrados</p>
        <p className="mt-1 max-w-xs text-[13px] lg:text-[14px] text-jaguar-ink/50">
          Usa el botón &ldquo;Registrar jugador&rdquo; para comenzar a construir el plantel Sub-15.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {players.map((player) => (
        <PlayerCard key={player.id} player={player} />
      ))}
    </div>
  );
}
