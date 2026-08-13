import Link from "next/link";
import { ArrowLeftRight, ClipboardCheck, Dumbbell, MapPin, Trophy, User } from "lucide-react";
import { CategorySelector } from "@/components/dashboard/CategorySelector";
import { ActivityInfoCard } from "@/components/dashboard/asistencia/ActivityInfoCard";
import { ActivityPicker } from "@/components/dashboard/asistencia/ActivityPicker";
import { AsistenciaShell } from "@/components/dashboard/asistencia/AsistenciaShell";
import { AttendanceHistoryCard } from "@/components/dashboard/asistencia/AttendanceHistoryCard";
import { Card } from "@/components/dashboard/ui/Card";
import { getTrainingById } from "@/lib/data/trainings";
import { getMatchById } from "@/lib/data/matches";
import { getPlayers } from "@/lib/data/players";
import { getAttendanceForTraining, getAttendanceForMatch, getAttendanceHistory } from "@/lib/data/attendance";
import { getStaffNameById } from "@/lib/data/staff";
import { getActivitiesForCategory, groupActivities } from "@/lib/data/activities";
import { resolveAttendanceClosure } from "@/lib/data/attendance-closures";
import { getRsvpStatusForMatch } from "@/lib/data/match-rsvp";
import { getCallupsForMatch } from "@/lib/data/match-callups";
import { parseCategory } from "@/lib/data/categories";

export const dynamic = "force-dynamic";

const monthNames = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

function formatFullDate(value: string) {
  const [y, m, d] = value.split("-");
  return `${Number(d)} de ${monthNames[Number(m) - 1]} de ${y}`;
}

function formatTime(value: string | null) {
  if (!value) return null;
  const [h, m] = value.split(":");
  const hour = Number(h);
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${m} ${period}`;
}

function formatTimeRange(start: string, end: string | null) {
  const startLabel = formatTime(start);
  return end ? `${startLabel} - ${formatTime(end)}` : startLabel;
}

interface AsistenciaPageProps {
  searchParams: Promise<{ categoria?: string; sesion?: string; partido?: string }>;
}

/** Asistencia — primero la actividad (entrenamiento o partido), después un clic por jugador. */
export default async function AsistenciaPage({ searchParams }: AsistenciaPageProps) {
  const { categoria, sesion, partido } = await searchParams;
  const category = parseCategory(categoria);

  const header = (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-[26px] font-extrabold leading-snug text-jaguar-ink lg:text-[30px]">
          <span className="text-jaguar-green-600">Asistencia</span>
        </h1>
        <p className="mt-1.5 max-w-md text-[14px] lg:text-[15.5px] text-jaguar-ink/55">Registra quién llegó a cada entrenamiento o partido.</p>
      </div>
      <div className="flex w-full min-w-0 flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
        <CategorySelector active={category} basePath="/plataforma/asistencia" />
        {sesion || partido ? (
          <Link
            href={`/plataforma/asistencia?categoria=${category}`}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-jaguar-ink/10 bg-white px-3.5 py-2.5 text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-ink/65 transition-colors hover:bg-jaguar-ink/[0.03] sm:w-auto"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            Cambiar actividad
          </Link>
        ) : null}
      </div>
    </div>
  );

  // Sin actividad explícita: el profesor la elige primero — nunca la adivinamos en silencio.
  if (!sesion && !partido) {
    const activities = await getActivitiesForCategory(category);
    const todayISO = new Date().toISOString().slice(0, 10);
    const grouped = groupActivities(activities, todayISO);

    return (
      <div className="space-y-6">
        {header}
        <ActivityPicker category={category} today={grouped.today} upcoming={grouped.upcoming} recent={grouped.recent} />
      </div>
    );
  }

  // Modo partido — misma pantalla y mismo lenguaje de asistencia que un entrenamiento.
  if (partido) {
    const match = await getMatchById(partido);

    if (!match) {
      return (
        <div className="space-y-6">
          {header}
          <Card className="flex flex-col items-center gap-3 p-14 text-center">
            <Trophy className="h-8 w-8 text-jaguar-ink/25" strokeWidth={1.6} aria-hidden />
            <p className="text-[14px] lg:text-[15.5px] font-semibold text-jaguar-ink/60">No se encontró ese partido.</p>
            <Link href={`/plataforma/asistencia?categoria=${category}`} className="rounded-xl bg-jaguar-green-600 px-4 py-2 text-[13px] lg:text-[14px] font-semibold text-white hover:bg-jaguar-green-700">
              Elegir otra actividad
            </Link>
          </Card>
        </div>
      );
    }

    const [roster, callups, attendanceMap, history, closure, rsvpByPlayerMap] = await Promise.all([
      getPlayers(category),
      getCallupsForMatch(match.id),
      getAttendanceForMatch(match.id),
      getAttendanceHistory(category),
      resolveAttendanceClosure("partido", match.id, match.match_date, match.match_time),
      getRsvpStatusForMatch(match.id),
    ]);

    // La asistencia de un partido es solo de los convocados guardados, no de toda la
    // categoría — si todavía no se guardó la convocatoria, no hay a quién marcar.
    // Incluye también a quien el técnico ya marcó "No asistirá" en la convocatoria:
    // sigue siendo un convocado, solo que ya sabemos que no va a estar.
    const convocadoIds = new Set(
      callups.filter((c) => c.call_status === "Confirmado" || c.call_status === "No asistirá").map((c) => c.player_id),
    );
    const players = roster.filter((p) => convocadoIds.has(p.id));
    const manualNoShow = Object.fromEntries(
      callups.filter((c) => c.call_status === "No asistirá").map((c) => [c.player_id, true]),
    );

    const todayISO = new Date().toISOString().slice(0, 10);
    const canClose = match.match_date <= todayISO;

    const meta = [
      { icon: MapPin, label: match.location ?? (match.is_home ? "Local" : "Visitante") },
      ...(match.competition ? [{ icon: Trophy, label: match.competition }] : []),
    ];

    const rsvpEntries = [...rsvpByPlayerMap.values()];
    const rsvpSummary =
      rsvpEntries.length > 0
        ? {
            confirmed: rsvpEntries.filter((r) => r.response === "Confirmado").length,
            declined: rsvpEntries.filter((r) => r.response === "No asiste").length,
            pending: rsvpEntries.filter((r) => r.response === null).length,
          }
        : undefined;

    if (players.length === 0) {
      return (
        <div className="space-y-6">
          {header}
          <ActivityInfoCard
            icon={Trophy}
            iconTone="gold"
            title={match.is_home ? `Jaguares vs. ${match.opponent}` : `${match.opponent} vs. Jaguares`}
            dateLabel={formatFullDate(match.match_date)}
            timeLabel={formatTime(match.match_time)}
            category={category}
            meta={meta}
            viewHref={`/plataforma/partidos/${match.id}`}
            viewLabel="Ver partido y convocatoria"
          />
          <Card className="flex flex-col items-center gap-3 p-14 text-center">
            <ClipboardCheck className="h-8 w-8 text-jaguar-ink/25" strokeWidth={1.6} aria-hidden />
            <p className="text-[14px] lg:text-[15.5px] font-semibold text-jaguar-ink/60">
              Todavía no hay convocatoria guardada para este partido.
            </p>
            <p className="max-w-sm text-[12.5px] lg:text-[13.5px] text-jaguar-ink/45">
              La asistencia se marca sobre los convocados — arma la convocatoria primero y después vuelve acá.
            </p>
            <Link
              href={`/plataforma/partidos/${match.id}`}
              className="rounded-xl bg-jaguar-green-600 px-4 py-2 text-[13px] lg:text-[14px] font-semibold text-white hover:bg-jaguar-green-700"
            >
              Armar convocatoria
            </Link>
          </Card>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {header}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <ActivityInfoCard
              icon={Trophy}
              iconTone="gold"
              title={match.is_home ? `Jaguares vs. ${match.opponent}` : `${match.opponent} vs. Jaguares`}
              dateLabel={formatFullDate(match.match_date)}
              timeLabel={formatTime(match.match_time)}
              category={category}
              meta={meta}
              viewHref={`/plataforma/partidos/${match.id}`}
              viewLabel="Ver partido y convocatoria"
            />
            <AsistenciaShell
              activity={{ kind: "partido", id: match.id }}
              category={category}
              players={players}
              initialStatuses={Object.fromEntries(attendanceMap)}
              closure={closure}
              canClose={canClose}
              rsvpByPlayer={Object.fromEntries(rsvpByPlayerMap)}
              manualNoShow={manualNoShow}
            />
          </div>
          <AttendanceHistoryCard entries={history} category={category} currentActivity={{ kind: "partido", id: match.id }} />
        </div>
      </div>
    );
  }

  // Modo entrenamiento — flujo original, ahora dentro del mismo esquema de actividad.
  const training = await getTrainingById(sesion!);

  if (!training) {
    return (
      <div className="space-y-6">
        {header}
        <Card className="flex flex-col items-center gap-3 p-14 text-center">
          <ClipboardCheck className="h-8 w-8 text-jaguar-ink/25" strokeWidth={1.6} aria-hidden />
          <p className="text-[14px] lg:text-[15.5px] font-semibold text-jaguar-ink/60">No se encontró esa sesión.</p>
          <Link href={`/plataforma/asistencia?categoria=${category}`} className="rounded-xl bg-jaguar-green-600 px-4 py-2 text-[13px] lg:text-[14px] font-semibold text-white hover:bg-jaguar-green-700">
            Elegir otra actividad
          </Link>
        </Card>
      </div>
    );
  }

  const [players, attendanceMap, history, coachName, closure] = await Promise.all([
    getPlayers(category),
    getAttendanceForTraining(training.id),
    getAttendanceHistory(category),
    getStaffNameById(training.coach_id),
    resolveAttendanceClosure("entrenamiento", training.id, training.session_date, training.start_time),
  ]);

  const todayISO = new Date().toISOString().slice(0, 10);
  const canClose = training.session_date <= todayISO;

  const meta = [
    { icon: User, label: coachName ?? "Sin asignar" },
  ];

  return (
    <div className="space-y-6">
      {header}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <ActivityInfoCard
            icon={Dumbbell}
            iconTone="green"
            title={training.title}
            dateLabel={formatFullDate(training.session_date)}
            timeLabel={formatTimeRange(training.start_time, training.end_time)}
            category={category}
            meta={meta}
            viewHref={`/plataforma/entrenamientos/${training.id}`}
            viewLabel="Ver detalles de la sesión"
          />
          <AsistenciaShell
            activity={{ kind: "entrenamiento", id: training.id }}
            category={category}
            players={players}
            initialStatuses={Object.fromEntries(attendanceMap)}
            closure={closure}
            canClose={canClose}
          />
        </div>
        <AttendanceHistoryCard entries={history} category={category} currentActivity={{ kind: "entrenamiento", id: training.id }} />
      </div>
    </div>
  );
}
