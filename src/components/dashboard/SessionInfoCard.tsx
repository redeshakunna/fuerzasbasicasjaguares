import Link from "next/link";
import type { ComponentType } from "react";
import { Briefcase, CalendarDays, Clock, Eye, User } from "lucide-react";
import { Card } from "./ui/Card";
import type { TrainingRow } from "@/lib/data/trainings";

const monthShort = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function formatDate(value: string) {
  const parts = value.split("-");
  return `${Number(parts[2])} de ${monthShort[(Number(parts[1]) || 1) - 1]} de ${parts[0]}`;
}

function formatTimeRange(start: string, end: string | null) {
  const fmt = (t: string) => {
    const [h, m] = t.split(":");
    const hour = Number(h);
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${hour12}:${m} ${period}`;
  };
  return end ? `${fmt(start)} - ${fmt(end)}` : fmt(start);
}

/** Encabezado compacto de la sesión seleccionada — mismo formato en Asistencia y Evaluaciones. */
export function SessionInfoCard({
  training,
  coachName,
  icon: Icon,
}: {
  training: TrainingRow;
  coachName: string | null;
  icon: ComponentType<{ className?: string; strokeWidth?: number; "aria-hidden"?: boolean }>;
}) {
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-jaguar-green-50 text-jaguar-green-600">
            <Icon className="h-5 w-5" strokeWidth={1.9} aria-hidden />
          </span>
          <div>
            <p className="text-[13.5px] lg:text-[15px] font-bold text-jaguar-ink">{training.title}</p>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] lg:text-[13px] text-jaguar-ink/50">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-jaguar-ink/35" strokeWidth={2} aria-hidden />
                {formatDate(training.session_date)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-jaguar-ink/35" strokeWidth={2} aria-hidden />
                {formatTimeRange(training.start_time, training.end_time)}
              </span>
              <span>
                <span className="text-jaguar-ink/35">Categoría </span>
                <span className="font-semibold text-jaguar-ink/70">{training.category}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-jaguar-ink/35" strokeWidth={2} aria-hidden />
                {coachName ?? "Sin asignar"}
              </span>
              {training.responsible_role ? (
                <span className="flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-jaguar-ink/35" strokeWidth={2} aria-hidden />
                  {training.responsible_role}
                </span>
              ) : null}
            </div>
          </div>
        </div>
        <Link
          href={`/plataforma/entrenamientos/${training.id}`}
          className="flex shrink-0 items-center gap-1.5 rounded-xl border border-jaguar-ink/10 px-3.5 py-2 text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-ink/65 transition-colors hover:bg-jaguar-ink/[0.03]"
        >
          <Eye className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          Ver detalles de la sesión
        </Link>
      </div>
    </Card>
  );
}
