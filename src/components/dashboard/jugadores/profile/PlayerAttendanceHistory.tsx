import Link from "next/link";
import { ClipboardCheck } from "lucide-react";
import { Badge } from "../../ui/Badge";
import { Card, CardHeader } from "../../ui/Card";
import type { PlayerAttendanceEntry } from "@/lib/data/attendance";
import type { Enums } from "@/lib/supabase/database.types";

const monthShort = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function formatShort(value: string) {
  const parts = value.split("-");
  return `${Number(parts[2])} ${monthShort[(Number(parts[1]) || 1) - 1]}`;
}

const statusTone: Record<Enums<"attendance_status">, "green" | "gold" | "turquoise" | "maroon"> = {
  Presente: "green",
  Tarde: "gold",
  Justificado: "turquoise",
  Ausente: "maroon",
};

/** Historial de asistencia del jugador (entrenamientos + partidos) — se alimenta automáticamente al guardar asistencia. */
export function PlayerAttendanceHistory({ history }: { history: PlayerAttendanceEntry[] }) {
  return (
    <Card>
      <CardHeader title="Historial de asistencia" subtitle="Entrenamientos y partidos recientes" />
      {history.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-8 text-center">
          <ClipboardCheck className="h-6 w-6 text-jaguar-ink/20" strokeWidth={1.6} aria-hidden />
          <p className="mt-2 text-[12.5px] lg:text-[13.5px] text-jaguar-ink/45">Aún no hay asistencia registrada.</p>
        </div>
      ) : (
        <div className="mt-3 divide-y divide-jaguar-ink/6 px-3 pb-3">
          {history.map((entry) => (
            <Link
              key={`${entry.kind}-${entry.id}`}
              href={entry.kind === "entrenamiento" ? `/plataforma/entrenamientos/${entry.id}` : `/plataforma/partidos/${entry.id}`}
              className="flex items-center justify-between gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-jaguar-mist/50"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-ink">{formatShort(entry.date)}</p>
                  {entry.kind === "partido" ? <Badge tone="gold">Partido</Badge> : null}
                </div>
                <p className="truncate text-[11.5px] lg:text-[12.5px] text-jaguar-ink/45">{entry.title}</p>
              </div>
              <Badge tone={statusTone[entry.status]}>{entry.status}</Badge>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}
