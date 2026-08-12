import Link from "next/link";
import { History } from "lucide-react";
import { Card, CardHeader } from "../ui/Card";
import { Badge } from "../ui/Badge";
import type { ActivityAttendanceEntry } from "@/lib/data/attendance";

const monthShort = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function formatShort(value: string) {
  const parts = value.split("-");
  return `${Number(parts[2])} ${monthShort[(Number(parts[1]) || 1) - 1]}`;
}

/** Historial de asistencia por actividad (entrenamientos + partidos) — fecha, tipo, presentes/ausentes. */
export function AttendanceHistoryCard({
  entries,
  category,
  currentActivity,
}: {
  entries: ActivityAttendanceEntry[];
  category: string;
  currentActivity: { kind: "entrenamiento" | "partido"; id: string };
}) {
  return (
    <Card className="pb-4">
      <CardHeader title="Historial de asistencias" />
      {entries.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-8 text-center">
          <History className="h-6 w-6 text-jaguar-ink/20" strokeWidth={1.6} aria-hidden />
          <p className="mt-2 text-[12.5px] lg:text-[13.5px] text-jaguar-ink/45">Aún no hay asistencias registradas.</p>
        </div>
      ) : (
        <div className="mt-2 divide-y divide-jaguar-ink/6 px-3">
          {entries.map((entry) => {
            const param = entry.kind === "entrenamiento" ? "sesion" : "partido";
            const isCurrent = entry.kind === currentActivity.kind && entry.id === currentActivity.id;
            return (
              <Link
                key={`${entry.kind}-${entry.id}`}
                href={`/plataforma/asistencia?categoria=${category}&${param}=${entry.id}`}
                className={`flex items-center justify-between gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-jaguar-mist/50 ${
                  isCurrent ? "bg-jaguar-green-50/60" : ""
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-ink">{formatShort(entry.date)}</p>
                    {entry.kind === "partido" ? <Badge tone="gold">Partido</Badge> : null}
                  </div>
                  <p className="truncate text-[11.5px] lg:text-[12.5px] text-jaguar-ink/45">{entry.title}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-[12px] lg:text-[13px] font-bold">
                  <span className="text-jaguar-green-600">{entry.presentes}</span>
                  <span className="text-jaguar-maroon-500">{entry.ausentes}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </Card>
  );
}
