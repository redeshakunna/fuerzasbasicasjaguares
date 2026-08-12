import { getTrainings } from "./trainings";
import { getMatches } from "./matches";
import type { TrainingRow } from "./player-profile";
import type { MatchRow } from "./matches";

export type ActivityKind = "entrenamiento" | "partido";

/** Referencia liviana y común a un entrenamiento o un partido — la unidad sobre la que se registra asistencia. */
export interface ActivityRef {
  kind: ActivityKind;
  id: string;
  category: string;
  date: string; // YYYY-MM-DD
  time: string | null; // HH:MM
  title: string;
  subtitle: string | null;
}

function trainingToActivity(t: TrainingRow): ActivityRef {
  return {
    kind: "entrenamiento",
    id: t.id,
    category: t.category,
    date: t.session_date,
    time: t.start_time,
    title: t.title,
    subtitle: t.location,
  };
}

function matchToActivity(m: MatchRow): ActivityRef {
  return {
    kind: "partido",
    id: m.id,
    category: m.category,
    date: m.match_date,
    time: m.match_time,
    title: m.is_home ? `Jaguares vs. ${m.opponent}` : `${m.opponent} vs. Jaguares`,
    subtitle: m.competition,
  };
}

/** Entrenamientos y partidos de la categoría, mezclados en una sola línea de tiempo (más reciente primero). */
export async function getActivitiesForCategory(category: string): Promise<ActivityRef[]> {
  const [trainings, matches] = await Promise.all([getTrainings(category), getMatches(category)]);

  const activities = [...trainings.map(trainingToActivity), ...matches.map(matchToActivity)];

  return activities.sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare !== 0) return dateCompare;
    return (b.time ?? "").localeCompare(a.time ?? "");
  });
}

export interface GroupedActivities {
  today: ActivityRef[];
  upcoming: ActivityRef[];
  recent: ActivityRef[];
}

/** Agrupa por Hoy / Próximos / Recientes — para el selector de actividad. */
export function groupActivities(activities: ActivityRef[], todayISO: string, limitEach = 6): GroupedActivities {
  const today = activities.filter((a) => a.date === todayISO);
  const upcoming = activities
    .filter((a) => a.date > todayISO)
    .sort((a, b) => a.date.localeCompare(b.date) || (a.time ?? "").localeCompare(b.time ?? ""))
    .slice(0, limitEach);
  const recent = activities.filter((a) => a.date < todayISO).slice(0, limitEach);
  return { today, upcoming, recent };
}
