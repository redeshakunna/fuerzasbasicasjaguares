import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import type { RosterPlayer, RosterStatus } from "./data/jugadores-page.data";
import { Avatar } from "./ui/Avatar";
import { Badge } from "./ui/Badge";
import { Card, CardHeader } from "./ui/Card";
import { ProgressBar } from "./ui/ProgressBar";

const statusTone: Record<RosterStatus, "green" | "gold" | "maroon"> = {
  Disponible: "green",
  Suspendido: "gold",
  Lesionado: "maroon",
};

/**
 * Tabla de jugadores destacados — mejor calificados del plantel real. Con `embedded` se omite el
 * Card/CardHeader propio (usado por PlayersTableWidget, que ya provee su propio encabezado con tabs).
 */
export function PlayersTable({ players, embedded = false }: { players: RosterPlayer[]; embedded?: boolean }) {
  const content =
    players.length === 0 ? (
      <div className="flex flex-col items-center px-6 py-10 text-center">
        <Users className="h-6 w-6 text-jaguar-ink/20" strokeWidth={1.6} aria-hidden />
        <p className="mt-2 text-[12.5px] lg:text-[13.5px] text-jaguar-ink/45">
          Aún no hay jugadores registrados en el plantel.
        </p>
      </div>
    ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-y border-jaguar-ink/6 text-[11px] lg:text-[12px] font-bold uppercase tracking-[0.04em] text-jaguar-ink/40">
                <th className="px-6 py-3 font-bold">Jugador</th>
                <th className="px-3 py-3 font-bold">Categoría</th>
                <th className="px-3 py-3 font-bold">Posición</th>
                <th className="px-3 py-3 font-bold">Nivel</th>
                <th className="px-3 py-3 font-bold">Estado</th>
                <th className="px-3 py-3 font-bold">Últ. entrenamiento</th>
                <th className="px-6 py-3 font-bold text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player) => (
                <tr key={player.id} className="border-b border-jaguar-ink/6 last:border-none">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar initials={player.initials} size={34} />
                      <span className="text-[13.5px] lg:text-[15px] font-semibold text-jaguar-ink">{player.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3.5 text-[13px] lg:text-[14px] text-jaguar-ink/65">{player.category}</td>
                  <td className="px-3 py-3.5 text-[13px] lg:text-[14px] text-jaguar-ink/65">{player.position}</td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-20">
                        <ProgressBar value={player.rating * 20} />
                      </div>
                      <span className="text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-ink/70">
                        {player.rating.toFixed(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3.5">
                    <Badge tone={statusTone[player.status]}>{player.status}</Badge>
                  </td>
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
      );

  if (embedded) return content;

  return (
    <Card className="overflow-hidden pb-2">
      <CardHeader title="Jugadores destacados" subtitle="Ordenado por nivel" />
      {content}
    </Card>
  );
}
