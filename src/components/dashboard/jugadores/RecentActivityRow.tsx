import Link from "next/link";
import { Activity } from "lucide-react";
import type { RosterActivity } from "../data/jugadores-page.data";
import { Card, CardHeader } from "../ui/Card";

const toneClass = {
  green: "bg-jaguar-green-50 text-jaguar-green-700",
  turquoise: "bg-jaguar-turquoise-500/10 text-jaguar-turquoise-600",
  gold: "bg-jaguar-gold-500/15 text-jaguar-gold-600",
  maroon: "bg-jaguar-maroon-500/10 text-jaguar-maroon-600",
};

/** Actividad reciente del plantel — fila horizontal de eventos. */
export function RecentActivityRow({ activities }: { activities: RosterActivity[] }) {
  return (
    <Card className="pb-6">
      <CardHeader
        title="Actividad Reciente"
        action={
          <Link href="/plataforma/jugadores" className="text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-green-600">
            Ver toda la actividad
          </Link>
        }
      />
      {activities.length === 0 ? (
        <div className="mt-2 flex flex-col items-center px-6 py-8 text-center">
          <Activity className="h-6 w-6 text-jaguar-ink/20" strokeWidth={1.6} aria-hidden />
          <p className="mt-2 text-[12.5px] lg:text-[13.5px] text-jaguar-ink/45">
            Aún no hay actividad registrada — aparecerá aquí a medida que el staff use la plataforma.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 px-6 sm:grid-cols-2 lg:grid-cols-5">
          {activities.map((event) => {
            const Icon = event.icon;
            return (
              <div key={event.id} className="rounded-xl border border-jaguar-ink/6 p-3.5">
                <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${toneClass[event.tone]}`}>
                  <Icon className="h-4 w-4" strokeWidth={1.8} aria-hidden />
                </span>
                <p className="mt-2.5 text-[13px] lg:text-[14px] font-bold text-jaguar-ink">{event.actor}</p>
                <p className="mt-0.5 text-[12px] lg:text-[13px] leading-snug text-jaguar-ink/60">{event.action}</p>
                <p className="mt-2 text-[11px] lg:text-[12px] text-jaguar-ink/40">{event.time}</p>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
