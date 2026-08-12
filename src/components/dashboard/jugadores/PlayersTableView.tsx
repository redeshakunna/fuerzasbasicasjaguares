import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import type { RosterPlayer, RosterStatus } from "../data/jugadores-page.data";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { StarRating } from "../ui/StarRating";

const statusTone: Record<RosterStatus, "green" | "gold" | "maroon"> = {
  Disponible: "green",
  Suspendido: "gold",
  Lesionado: "maroon",
};

/** Vista de tabla del plantel real — alternativa compacta a las tarjetas. */
export function PlayersTableView({ players }: { players: RosterPlayer[] }) {
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
    <Card className="overflow-hidden pb-2">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse text-left">
          <thead>
            <tr className="border-y border-jaguar-ink/6 text-[11px] lg:text-[12px] font-bold uppercase tracking-[0.04em] text-jaguar-ink/40">
              <th className="px-6 py-3 font-bold">Jugador</th>
              <th className="px-3 py-3 font-bold">Posición</th>
              <th className="px-3 py-3 font-bold">Estado</th>
              <th className="px-3 py-3 font-bold">Nivel</th>
              <th className="px-3 py-3 font-bold">Edad</th>
              <th className="px-3 py-3 font-bold">Últ. entrenamiento</th>
              <th className="px-6 py-3 font-bold text-right">Acción</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <tr key={player.id} className="border-b border-jaguar-ink/6 last:border-none">
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-3">
                    <Avatar initials={player.initials} photoUrl={player.photoUrl} size={34} />
                    <div>
                      <p className="text-[13.5px] lg:text-[15px] font-semibold text-jaguar-ink">
                        {player.name}
                        {player.nickname ? (
                          <span className="ml-1.5 font-medium italic text-jaguar-green-600/80">
                            &ldquo;{player.nickname}&rdquo;
                          </span>
                        ) : null}
                      </p>
                      <p className="text-[11.5px] lg:text-[12.5px] text-jaguar-ink/45">{player.category}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3.5">
                  <Badge tone={player.positionTone}>{player.position}</Badge>
                </td>
                <td className="px-3 py-3.5">
                  <Badge tone={statusTone[player.status]}>{player.status}</Badge>
                </td>
                <td className="px-3 py-3.5">
                  <StarRating value={player.rating} size={13} />
                </td>
                <td className="px-3 py-3.5 text-[13px] lg:text-[14px] text-jaguar-ink/65">{player.age} años</td>
                <td className="px-3 py-3.5 text-[13px] lg:text-[14px] text-jaguar-ink/55">{player.lastTraining}</td>
                <td className="px-6 py-3.5 text-right">
                  <Link
                    href={`/plataforma/jugadores/${player.id}`}
                    className="group inline-flex items-center gap-1 text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-green-600"
                  >
                    Ver perfil
                    <ArrowRight
                      className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                      strokeWidth={2.25}
                      aria-hidden
                    />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
