import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { RosterPlayer, RosterStatus } from "../data/jugadores-page.data";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { StarRating } from "../ui/StarRating";

const statusDotClass: Record<RosterStatus, string> = {
  Disponible: "bg-jaguar-green-500",
  Suspendido: "bg-jaguar-gold-500",
  Lesionado: "bg-jaguar-maroon-500",
};

export function PlayerCard({ player }: { player: RosterPlayer }) {
  return (
    <Card className="relative p-5">
      <span
        className={`absolute left-4 top-4 h-2.5 w-2.5 rounded-full ring-2 ring-white ${statusDotClass[player.status]}`}
        aria-hidden
        title={player.status}
      />

      <div className="flex flex-col items-center text-center">
        <Avatar initials={player.initials} photoUrl={player.photoUrl} size={64} />
        <p className="mt-3 text-[14.5px] lg:text-[16px] font-bold text-jaguar-ink">{player.name}</p>
        {player.nickname ? (
          <p className="text-[12px] lg:text-[13px] font-medium italic text-jaguar-green-600/80">&ldquo;{player.nickname}&rdquo;</p>
        ) : null}
        <p className="text-[12px] lg:text-[13px] text-jaguar-ink/45">{player.category}</p>

        <div className="mt-2.5">
          <Badge tone={player.positionTone}>{player.position}</Badge>
        </div>

        <div className="mt-2.5">
          <StarRating value={player.rating} />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-4 gap-1 border-t border-jaguar-ink/6 pt-4 text-center">
        <div>
          <p className="text-[10.5px] lg:text-[11.5px] font-medium text-jaguar-ink/40">Edad</p>
          <p className="mt-0.5 text-[12px] lg:text-[13px] font-semibold text-jaguar-ink">{player.age} años</p>
        </div>
        <div>
          <p className="text-[10.5px] lg:text-[11.5px] font-medium text-jaguar-ink/40">Altura</p>
          <p className="mt-0.5 text-[12px] lg:text-[13px] font-semibold text-jaguar-ink">{player.height}</p>
        </div>
        <div>
          <p className="text-[10.5px] lg:text-[11.5px] font-medium text-jaguar-ink/40">Peso</p>
          <p className="mt-0.5 text-[12px] lg:text-[13px] font-semibold text-jaguar-ink">{player.weight}</p>
        </div>
        <div>
          <p className="text-[10.5px] lg:text-[11.5px] font-medium text-jaguar-ink/40">Últ. Entrenamiento</p>
          <p className="mt-0.5 text-[12px] lg:text-[13px] font-semibold text-jaguar-ink">{player.lastTraining}</p>
        </div>
      </div>

      <Link
        href={`/plataforma/jugadores/${player.id}`}
        className="group mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-jaguar-ink/10 py-2.5 text-[13px] lg:text-[14px] font-semibold text-jaguar-ink transition-colors hover:border-jaguar-green-500/40 hover:text-jaguar-green-600"
      >
        Ver perfil
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2.25} aria-hidden />
      </Link>
    </Card>
  );
}
