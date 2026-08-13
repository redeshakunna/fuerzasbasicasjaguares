import Link from "next/link";
import { ArrowLeftRight, ClipboardList, MapPin, Trophy, User } from "lucide-react";
import { CategorySelector } from "@/components/dashboard/CategorySelector";
import { ActivityInfoCard } from "@/components/dashboard/asistencia/ActivityInfoCard";
import { ActivityPicker } from "@/components/dashboard/asistencia/ActivityPicker";
import { EvaluacionesShell } from "@/components/dashboard/evaluaciones/EvaluacionesShell";
import { Card } from "@/components/dashboard/ui/Card";
import { getTrainingById } from "@/lib/data/trainings";
import { getMatchById } from "@/lib/data/matches";
import { getPlayers } from "@/lib/data/players";
import { getEvaluationsForActivity } from "@/lib/data/evaluations";
import { getAttendanceForTraining, getAttendanceForMatch } from "@/lib/data/attendance";
import { getCallupsForMatches } from "@/lib/data/match-callups";
import { getRsvpStatusForMatch } from "@/lib/data/match-rsvp";
import { getStaffNameById } from "@/lib/data/staff";
import { getActivitiesForCategory, groupActivities } from "@/lib/data/activities";
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

interface EvaluacionesPageProps {
  searchParams: Promise<{ categoria?: string; sesion?: string; partido?: string }>;
}

/** Evaluaciones — igual que Asistencia, primero la actividad (entrenamiento o partido), después evaluar. */
export default async function EvaluacionesPage({ searchParams }: EvaluacionesPageProps) {
  const { categoria, sesion, partido } = await searchParams;
  const category = parseCategory(categoria);

  const header = (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-[26px] font-extrabold leading-snug text-jaguar-ink lg:text-[30px]">
          <span className="text-jaguar-green-600">Evaluaciones</span>
        </h1>
        <p className="mt-1.5 max-w-md text-[14px] lg:text-[15.5px] text-jaguar-ink/55">Evalúa el desempeño de los jugadores en entrenamientos y partidos.</p>
      </div>
      <div className="flex w-full min-w-0 flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
        <CategorySelector active={category} basePath="/plataforma/evaluaciones" />
        {sesion || partido ? (
          <Link
            href={`/plataforma/evaluaciones?categoria=${category}`}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-jaguar-ink/10 bg-white px-3.5 py-2.5 text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-ink/65 transition-colors hover:bg-jaguar-ink/[0.03] sm:w-auto"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            Cambiar actividad
          </Link>
        ) : null}
      </div>
    </div>
  );

  // Sin actividad explícita: el profesor la elige primero — solo aplican evaluaciones si hay un entrenamiento o un partido puntual.
  if (!sesion && !partido) {
    const activities = await getActivitiesForCategory(category);
    const todayISO = new Date().toISOString().slice(0, 10);
    const grouped = groupActivities(activities, todayISO);

    return (
      <div className="space-y-6">
        {header}
        <ActivityPicker
          category={category}
          today={grouped.today}
          upcoming={grouped.upcoming}
          recent={grouped.recent}
          basePath="/plataforma/evaluaciones"
          title="¿Para qué actividad vas a evaluar?"
          subtitle="Elige un entrenamiento o un partido — las evaluaciones siempre son de algo puntual."
        />
      </div>
    );
  }

  // Modo partido — además de los 5 indicadores, muestra (si existen) goles/tarjetas/minutos ya cargados en la convocatoria.
  if (partido) {
    const match = await getMatchById(partido);

    if (!match) {
      return (
        <div className="space-y-6">
          {header}
          <Card className="flex flex-col items-center gap-3 p-14 text-center">
            <Trophy className="h-8 w-8 text-jaguar-ink/25" strokeWidth={1.6} aria-hidden />
            <p className="text-[14px] lg:text-[15.5px] font-semibold text-jaguar-ink/60">No se encontró ese partido.</p>
            <Link href={`/plataforma/evaluaciones?categoria=${category}`} className="rounded-xl bg-jaguar-green-600 px-4 py-2 text-[13px] lg:text-[14px] font-semibold text-white hover:bg-jaguar-green-700">
              Elegir otra actividad
            </Link>
          </Card>
        </div>
      );
    }

    const [roster, evaluationsByPlayerMap, attendanceByPlayerMap, callupsByMatch, rsvpByPlayerMap] = await Promise.all([
      getPlayers(category),
      getEvaluationsForActivity("partido", match.id),
      getAttendanceForMatch(match.id),
      getCallupsForMatches([match.id]),
      getRsvpStatusForMatch(match.id),
    ]);

    const callupByPlayer = Object.fromEntries((callupsByMatch[match.id] ?? []).map((c) => [c.player_id, c]));
    const activityTitle = match.is_home ? `Jaguares vs. ${match.opponent}` : `${match.opponent} vs. Jaguares`;

    const meta = [
      { icon: MapPin, label: match.location ?? (match.is_home ? "Local" : "Visitante") },
      ...(match.competition ? [{ icon: Trophy, label: match.competition }] : []),
    ];

    // Evaluar solo tiene sentido para quien realmente va a estar en la cancha —
    // convocados confirmados, sin contar a quien ya avisó (por WhatsApp o manual)
    // que no va a asistir.
    const players = roster.filter((p) => {
      const callup = callupByPlayer[p.id];
      if (!callup || callup.call_status !== "Confirmado") return false;
      if (rsvpByPlayerMap.get(p.id)?.response === "No asiste") return false;
      return true;
    });

    const activityInfoCard = (
      <ActivityInfoCard
        icon={Trophy}
        iconTone="gold"
        title={activityTitle}
        dateLabel={formatFullDate(match.match_date)}
        timeLabel={formatTime(match.match_time)}
        category={category}
        meta={meta}
        viewHref={`/plataforma/partidos/${match.id}`}
        viewLabel="Ver partido y convocatoria"
      />
    );

    if (players.length === 0) {
      return (
        <div className="space-y-6">
          {header}
          {activityInfoCard}
          <Card className="flex flex-col items-center gap-3 p-14 text-center">
            <Trophy className="h-8 w-8 text-jaguar-ink/25" strokeWidth={1.6} aria-hidden />
            <p className="text-[14px] lg:text-[15.5px] font-semibold text-jaguar-ink/60">
              Todavía no hay convocados confirmados para evaluar en este partido.
            </p>
            <p className="max-w-sm text-[12.5px] lg:text-[13.5px] text-jaguar-ink/45">
              Arma la convocatoria primero — si todos avisaron que no van, tampoco hay a quién evaluar todavía.
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
        {activityInfoCard}
        <EvaluacionesShell
          activity={{ kind: "partido", id: match.id }}
          activityTitle={activityTitle}
          category={category}
          players={players}
          evaluationsByPlayer={Object.fromEntries(evaluationsByPlayerMap)}
          attendanceByPlayer={Object.fromEntries(attendanceByPlayerMap)}
          callupByPlayer={callupByPlayer}
        />
      </div>
    );
  }

  // Modo entrenamiento
  const training = await getTrainingById(sesion!);

  if (!training) {
    return (
      <div className="space-y-6">
        {header}
        <Card className="flex flex-col items-center gap-3 p-14 text-center">
          <ClipboardList className="h-8 w-8 text-jaguar-ink/25" strokeWidth={1.6} aria-hidden />
          <p className="text-[14px] lg:text-[15.5px] font-semibold text-jaguar-ink/60">No se encontró esa sesión.</p>
          <Link href={`/plataforma/evaluaciones?categoria=${category}`} className="rounded-xl bg-jaguar-green-600 px-4 py-2 text-[13px] lg:text-[14px] font-semibold text-white hover:bg-jaguar-green-700">
            Elegir otra actividad
          </Link>
        </Card>
      </div>
    );
  }

  const [players, evaluationsByPlayerMap, attendanceByPlayerMap, coachName] = await Promise.all([
    getPlayers(category),
    getEvaluationsForActivity("entrenamiento", training.id),
    getAttendanceForTraining(training.id),
    getStaffNameById(training.coach_id),
  ]);

  const meta = [{ icon: User, label: coachName ?? "Sin asignar" }];

  return (
    <div className="space-y-6">
      {header}
      <ActivityInfoCard
        icon={ClipboardList}
        iconTone="green"
        title={training.title}
        dateLabel={formatFullDate(training.session_date)}
        timeLabel={formatTimeRange(training.start_time, training.end_time)}
        category={category}
        meta={meta}
        viewHref={`/plataforma/entrenamientos/${training.id}`}
        viewLabel="Ver detalles de la sesión"
      />
      <EvaluacionesShell
        activity={{ kind: "entrenamiento", id: training.id }}
        activityTitle={training.title}
        category={category}
        players={players}
        evaluationsByPlayer={Object.fromEntries(evaluationsByPlayerMap)}
        attendanceByPlayer={Object.fromEntries(attendanceByPlayerMap)}
      />
    </div>
  );
}
