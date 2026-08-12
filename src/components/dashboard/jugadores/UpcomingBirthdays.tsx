import Link from "next/link";
import { Cake } from "lucide-react";
import type { UpcomingBirthday } from "../data/jugadores-page.data";
import { Avatar } from "../ui/Avatar";
import { Card, CardHeader } from "../ui/Card";

/** Próximos cumpleaños del plantel — recordatorio rápido para el staff. */
export function UpcomingBirthdays({ birthdays }: { birthdays: UpcomingBirthday[] }) {
  return (
    <Card className="pb-4">
      <CardHeader
        title="Próximos Cumpleaños"
        action={
          <Link href="/plataforma/jugadores" className="text-[12px] lg:text-[13px] font-semibold text-jaguar-green-600">
            Ver todos
          </Link>
        }
      />
      {birthdays.length === 0 ? (
        <div className="mt-3 flex flex-col items-center px-6 py-6 text-center">
          <Cake className="h-6 w-6 text-jaguar-ink/20" strokeWidth={1.6} aria-hidden />
          <p className="mt-2 text-[12.5px] lg:text-[13.5px] text-jaguar-ink/45">Sin cumpleaños próximos aún</p>
        </div>
      ) : (
        <ul className="mt-3 space-y-1 px-3">
          {birthdays.map((b) => (
            <li key={b.id} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-jaguar-ink/[0.02]">
              <Avatar initials={b.initials} size={36} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] lg:text-[14px] font-bold text-jaguar-ink">{b.name}</p>
                <p className="text-[11.5px] lg:text-[12.5px] text-jaguar-ink/45">{b.category}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[12px] lg:text-[13px] font-semibold text-jaguar-green-600">{b.daysLabel}</p>
                <p className="text-[11px] lg:text-[12px] text-jaguar-ink/40">{b.date}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
