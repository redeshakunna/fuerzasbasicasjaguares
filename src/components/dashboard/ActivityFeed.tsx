import { Activity } from "lucide-react";
import type { ActivityEvent } from "./data/activity.data";
import { Card, CardHeader } from "./ui/Card";

/** Actividad reciente del equipo — evaluaciones, entrenamientos, resultados. */
export function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  return (
    <Card className="pb-6">
      <CardHeader title="Actividad reciente" />
      {events.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-8 text-center">
          <Activity className="h-6 w-6 text-jaguar-ink/20" strokeWidth={1.6} aria-hidden />
          <p className="mt-2 text-[12.5px] lg:text-[13.5px] text-jaguar-ink/45">
            Aún no hay actividad registrada.
          </p>
        </div>
      ) : (
        <ul className="mt-4 space-y-1 px-3">
          {events.map((event) => {
            const Icon = event.icon;
            return (
              <li key={event.id} className="flex items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-jaguar-ink/[0.02]">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-jaguar-green-50 text-jaguar-green-600">
                  <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                </span>
                <div>
                  <p className="text-[13px] lg:text-[14px] leading-snug text-jaguar-ink/80">{event.text}</p>
                  <p className="mt-0.5 text-[11.5px] lg:text-[12.5px] text-jaguar-ink/40">{event.time}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
