import { Card, CardHeader } from "../../ui/Card";
import { getPositionCoordinates } from "@/lib/data/player-profile-view";
import type { Tables } from "@/lib/supabase/database.types";

type PlayerRow = Tables<"players">;

export function PosicionesCard({ player }: { player: PlayerRow }) {
  const { x, y } = getPositionCoordinates(player.position, player.position_group);

  return (
    <Card>
      <CardHeader title="Posiciones" subtitle="Posición principal registrada" />
      <div className="px-6 pb-6 pt-4">
        <div className="relative mx-auto aspect-[2/3] max-w-[220px] overflow-hidden rounded-2xl bg-jaguar-green-600">
          <svg viewBox="0 0 100 150" className="absolute inset-0 h-full w-full">
            <rect x="4" y="4" width="92" height="142" fill="none" stroke="white" strokeOpacity="0.35" strokeWidth="1.2" />
            <line x1="4" y1="75" x2="96" y2="75" stroke="white" strokeOpacity="0.35" strokeWidth="1.2" />
            <circle cx="50" cy="75" r="14" fill="none" stroke="white" strokeOpacity="0.35" strokeWidth="1.2" />
            <rect x="25" y="4" width="50" height="20" fill="none" stroke="white" strokeOpacity="0.35" strokeWidth="1.2" />
            <rect x="25" y="126" width="50" height="20" fill="none" stroke="white" strokeOpacity="0.35" strokeWidth="1.2" />
          </svg>
          <div
            className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-jaguar-gold-400 ring-2 ring-white shadow-[0_0_0_4px_rgba(255,255,255,0.15)]"
            style={{ left: `${x}%`, top: `${y}%` }}
            title={player.position}
          />
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl bg-jaguar-mist/60 px-3.5 py-2.5">
          <span className="text-[12.5px] lg:text-[13.5px] text-jaguar-ink/55">Principal</span>
          <span className="text-[13px] lg:text-[14px] font-bold text-jaguar-ink">{player.position}</span>
        </div>
      </div>
    </Card>
  );
}
