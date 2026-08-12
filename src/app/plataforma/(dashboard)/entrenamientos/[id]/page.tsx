import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, ChevronLeft, ClipboardCheck, ClipboardList, Clock, MapPin, PenLine, User } from "lucide-react";
import { Card } from "@/components/dashboard/ui/Card";
import { Badge } from "@/components/dashboard/ui/Badge";
import { SessionPlanView } from "@/components/dashboard/entrenamientos/SessionPlanView";
import { SessionActionsBar } from "@/components/dashboard/entrenamientos/SessionActionsBar";
import { getTrainingById } from "@/lib/data/trainings";
import { getPlayers } from "@/lib/data/players";
import { getEvaluatedPlayerIdsForTraining } from "@/lib/data/evaluations";
import { getAttendanceForTraining } from "@/lib/data/attendance";
import type { SessionPlan } from "@/lib/training/session-types";

export const dynamic = "force-dynamic";

const monthShort = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function formatSessionDate(value: string) {
  const parts = value.split("-");
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  return `${d} de ${monthShort[m - 1]} de ${y}`;
}

function formatTime(value: string | null) {
  if (!value) return null;
  return value.slice(0, 5);
}

function minutesBetween(start: string, end: string | null): number | null {
  if (!end) return null;
  const startParts = start.split(":");
  const endParts = end.split(":");
  const startTotal = Number(startParts[0]) * 60 + Number(startParts[1]);
  const endTotal = Number(endParts[0]) * 60 + Number(endParts[1]);
  return (endTotal - startTotal + 24 * 60) % (24 * 60);
}

interface TrainingDetailPageProps {
  params: Promise<{ id: string }>;
}

/** Detalle de una sesión de entrenamiento + plantel Sub-15 para evaluar. */
export default async function TrainingDetailPage({ params }: TrainingDetailPageProps) {
  const { id } = await params;

  const training = await getTrainingById(id);
  if (!training) notFound();

  const [players, evaluatedPlayerIds, attendanceMap] = await Promise.all([
    getPlayers(training.category),
    getEvaluatedPlayerIdsForTraining(id),
    getAttendanceForTraining(id),
  ]);

  const evaluatedCount = players.filter((p) => evaluatedPlayerIds.has(p.id)).length;
  const presentCount = [...attendanceMap.values()].filter((s) => s === "Presente").length;
  const attendanceTaken = attendanceMap.size > 0;

  const session = training.session as SessionPlan | null;
  const objectiveSummary = session?.generalObjective ?? training.objective ?? training.title;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-[13px] lg:text-[14px] text-jaguar-ink/50">
        <Link
          href="/plataforma/entrenamientos"
          className="flex items-center gap-1 font-semibold text-jaguar-ink/60 hover:text-jaguar-green-600"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2.25} aria-hidden />
          Entrenamientos
        </Link>
        <span className="text-jaguar-ink/25">/</span>
        <span className="font-semibold text-jaguar-ink">{training.title}</span>
      </div>

      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[20px] lg:text-[22px] font-extrabold text-jaguar-ink">{training.title}</h1>
              {training.objective ? <Badge tone="green">{training.objective}</Badge> : null}
              {training.intensity ? (
                <Badge tone={training.intensity === "Alta" ? "maroon" : training.intensity === "Media" ? "gold" : "turquoise"}>
                  Intensidad {training.intensity}
                </Badge>
              ) : null}
              {training.creation_mode === "ia" ? <Badge tone="violet">✨ Generado con IA</Badge> : null}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] lg:text-[14px] text-jaguar-ink/55">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 text-jaguar-ink/35" strokeWidth={2} aria-hidden />
                {formatSessionDate(training.session_date)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-jaguar-ink/35" strokeWidth={2} aria-hidden />
                {formatTime(training.start_time)}
                {training.end_time ? ` – ${formatTime(training.end_time)}` : ""}
              </span>
              {training.location ? (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-jaguar-ink/35" strokeWidth={2} aria-hidden />
                  {training.location}
                </span>
              ) : null}
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4 text-jaguar-ink/35" strokeWidth={2} aria-hidden />
                Categoría {training.category}
              </span>
            </div>
          </div>
        </div>
        {training.notes ? (
          <p className="mt-4 rounded-xl bg-jaguar-mist/50 px-4 py-3 text-[13px] lg:text-[14px] leading-relaxed text-jaguar-ink/65">
            {training.notes}
          </p>
        ) : null}

        <div className="mt-5 border-t border-jaguar-ink/6 pt-4">
          <SessionActionsBar
            trainingId={id}
            category={training.category}
            sessionDate={training.session_date}
            startTime={training.start_time}
            durationMin={minutesBetween(training.start_time, training.end_time)}
            location={training.location}
            objectiveSummary={objectiveSummary}
          />
        </div>
      </Card>

      {session ? (
        <SessionPlanView session={session} />
      ) : (
        <Card className="flex flex-col items-center gap-3 p-10 text-center">
          <PenLine className="h-7 w-7 text-jaguar-ink/25" strokeWidth={1.6} aria-hidden />
          <p className="text-[14px] lg:text-[15.5px] font-semibold text-jaguar-ink/60">Esta sesión aún no tiene un plan detallado.</p>
          <Link
            href={`/plataforma/entrenamientos/${id}/editar`}
            className="rounded-xl bg-jaguar-green-600 px-4 py-2 text-[13px] lg:text-[14px] font-semibold text-white hover:bg-jaguar-green-700"
          >
            Crear plan de sesión
          </Link>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href={`/plataforma/asistencia?categoria=${training.category}&sesion=${id}`}
          className="flex items-center gap-3 rounded-[18px] border border-jaguar-ink/8 bg-white p-5 shadow-[0_1px_2px_rgba(13,18,16,0.04)] transition-shadow hover:shadow-[0_4px_16px_-8px_rgba(13,18,16,0.18)]"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-jaguar-green-50 text-jaguar-green-600">
            <ClipboardCheck className="h-5 w-5" strokeWidth={1.9} aria-hidden />
          </span>
          <div>
            <p className="text-[13.5px] lg:text-[15px] font-bold text-jaguar-ink">Asistencia</p>
            <p className="text-[12px] lg:text-[13px] text-jaguar-ink/50">
              {attendanceTaken ? `${presentCount} de ${players.length} presentes` : "Aún no se ha registrado"}
            </p>
          </div>
        </Link>
        <Link
          href={`/plataforma/evaluaciones?categoria=${training.category}&sesion=${id}`}
          className="flex items-center gap-3 rounded-[18px] border border-jaguar-ink/8 bg-white p-5 shadow-[0_1px_2px_rgba(13,18,16,0.04)] transition-shadow hover:shadow-[0_4px_16px_-8px_rgba(13,18,16,0.18)]"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600">
            <ClipboardList className="h-5 w-5" strokeWidth={1.9} aria-hidden />
          </span>
          <div>
            <p className="text-[13.5px] lg:text-[15px] font-bold text-jaguar-ink">Evaluaciones</p>
            <p className="text-[12px] lg:text-[13px] text-jaguar-ink/50">{evaluatedCount} de {players.length} evaluados</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
