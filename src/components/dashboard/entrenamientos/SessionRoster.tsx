import Link from "next/link";
import { Check, ChevronRight } from "lucide-react";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";
import { Card, CardHeader } from "../ui/Card";
import { getFullName } from "@/lib/data/players-stats";
import type { PlayerRow } from "@/lib/data/players";

interface SessionRosterProps {
  trainingId: string;
  players: PlayerRow[];
  evaluatedPlayerIds: Set<string>;
}

/** Plantel Sub-15 para una sesión — acceso directo a evaluar a cada jugador. */
export function SessionRoster({ trainingId, players, evaluatedPlayerIds }: SessionRosterProps) {
  const evaluatedCount = players.filter((p) => evaluatedPlayerIds.has(p.id)).length;

  return (
    <Card>
      <CardHeader
        title="Plantel — Sub-15"
        subtitle={`${evaluatedCount} de ${players.length} jugadores evaluados`}
      />
      <div className="mt-3 divide-y divide-jaguar-ink/6 px-3 pb-3">
        {players.map((player) => {
          const fullName = getFullName(player);
          const evaluated = evaluatedPlayerIds.has(player.id);
          return (
            <Link
              key={player.id}
              href={`/plataforma/entrenamientos/${trainingId}/evaluar/${player.id}`}
              className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-jaguar-mist/50"
            >
              <Avatar initials={fullName.slice(0, 2).toUpperCase()} photoUrl={player.photo_url} size={38} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] lg:text-[15px] font-semibold text-jaguar-ink">
                  {fullName}
                  {player.nickname ? (
                    <span className="ml-1.5 text-[12px] lg:text-[13px] font-medium italic text-jaguar-ink/40">
                      &ldquo;{player.nickname}&rdquo;
                    </span>
                  ) : null}
                </p>
                <p className="text-[12px] lg:text-[13px] text-jaguar-ink/45">
                  {player.jersey_number ? `#${player.jersey_number} · ` : ""}
                  {player.position}
                </p>
              </div>
              {evaluated ? (
                <Badge tone="green">
                  <Check className="mr-1 inline h-3 w-3" strokeWidth={2.5} aria-hidden />
                  Evaluado
                </Badge>
              ) : (
                <span className="text-[12px] lg:text-[13px] font-semibold text-jaguar-green-600">Evaluar</span>
              )}
              <ChevronRight className="h-4 w-4 text-jaguar-ink/25" strokeWidth={2} aria-hidden />
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
