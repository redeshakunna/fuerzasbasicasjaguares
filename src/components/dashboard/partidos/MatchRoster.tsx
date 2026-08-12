import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Avatar } from "../ui/Avatar";
import { Card, CardHeader } from "../ui/Card";
import { getFullName } from "@/lib/data/players-stats";
import type { PlayerRow } from "@/lib/data/players";

/** Plantel de la categoría — acceso directo al perfil de cada jugador convocable. */
export function MatchRoster({ players }: { players: PlayerRow[] }) {
  return (
    <Card>
      <CardHeader title="Plantel disponible" subtitle={`${players.length} jugadores de la categoría`} />
      <div className="mt-3 divide-y divide-jaguar-ink/6 px-3 pb-3">
        {players.map((player) => {
          const fullName = getFullName(player);
          return (
            <Link
              key={player.id}
              href={`/plataforma/jugadores/${player.id}`}
              className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-jaguar-mist/50"
            >
              <Avatar initials={fullName.slice(0, 2).toUpperCase()} photoUrl={player.photo_url} size={36} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] lg:text-[15px] font-semibold text-jaguar-ink">{fullName}</p>
                <p className="text-[12px] lg:text-[13px] text-jaguar-ink/45">
                  {player.jersey_number ? `#${player.jersey_number} · ` : ""}
                  {player.position}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-jaguar-ink/25" strokeWidth={2} aria-hidden />
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
