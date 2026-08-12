import Link from "next/link";
import type { SquadAlert } from "../data/jugadores-page.data";
import { Card, CardHeader } from "../ui/Card";

const toneClass = {
  maroon: "bg-jaguar-maroon-500/10 text-jaguar-maroon-600",
  gold: "bg-jaguar-gold-500/15 text-jaguar-gold-600",
  turquoise: "bg-jaguar-turquoise-500/10 text-jaguar-turquoise-600",
  green: "bg-jaguar-green-50 text-jaguar-green-700",
};

const countClass = {
  maroon: "bg-jaguar-maroon-500 text-white",
  gold: "bg-jaguar-gold-500 text-jaguar-ink",
  turquoise: "bg-jaguar-turquoise-500 text-white",
  green: "bg-jaguar-green-600 text-white",
};

/** Alertas operativas del plantel — documentación, salud, seguimiento. */
export function SquadAlerts({ alerts }: { alerts: SquadAlert[] }) {
  return (
    <Card className="pb-4">
      <CardHeader
        title="Alertas del Plantel"
        action={
          <Link href="/plataforma/jugadores" className="text-[12px] lg:text-[13px] font-semibold text-jaguar-green-600">
            Ver todas
          </Link>
        }
      />
      <ul className="mt-3 space-y-1 px-3">
        {alerts.map((alert) => {
          const Icon = alert.icon;
          return (
            <li
              key={alert.id}
              className="flex items-center gap-3 rounded-xl px-2 py-2.5 hover:bg-jaguar-ink/[0.02]"
            >
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${toneClass[alert.tone]}`}>
                <Icon className="h-4 w-4" strokeWidth={1.8} aria-hidden />
              </span>
              <p className="flex-1 text-[13px] lg:text-[14px] text-jaguar-ink/75">{alert.label}</p>
              <span
                className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] lg:text-[12px] font-bold ${countClass[alert.tone]}`}
              >
                {alert.count}
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
