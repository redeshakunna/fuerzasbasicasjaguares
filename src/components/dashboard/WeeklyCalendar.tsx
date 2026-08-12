import Link from "next/link";
import { weekDays, eventTypeClass, type CalendarEvent } from "./data/calendar.data";
import { Card, CardHeader } from "./ui/Card";

function hrefForEvent(event: CalendarEvent) {
  return event.type === "partido" ? `/plataforma/partidos/${event.id}` : `/plataforma/entrenamientos/${event.id}`;
}

/** Calendario semanal — entrenamientos y partidos reales de esta semana. */
export function WeeklyCalendar({ events }: { events: CalendarEvent[] }) {
  return (
    <Card className="pb-6">
      <CardHeader title="Calendario semanal" subtitle="Entrenamientos y partidos" />
      <div className="mt-5 grid grid-cols-7 gap-2 px-6">
        {weekDays.map((day) => {
          const dayEvents = events.filter((event) => event.day === day);
          return (
            <div key={day} className="min-h-[132px] rounded-xl border border-jaguar-ink/6 bg-jaguar-mist/40 p-2">
              <p className="text-center text-[11px] lg:text-[12px] font-bold uppercase tracking-[0.04em] text-jaguar-ink/45">
                {day}
              </p>
              <div className="mt-2 space-y-1.5">
                {dayEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={hrefForEvent(event)}
                    className={`block rounded-lg border px-1.5 py-1 text-[10px] lg:text-[11px] font-semibold leading-tight transition-opacity hover:opacity-75 ${eventTypeClass[event.type]}`}
                  >
                    <p>{event.time}</p>
                    <p className="mt-0.5 line-clamp-2 font-medium">{event.title}</p>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
