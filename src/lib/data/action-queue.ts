import { getTrainings } from "./trainings";
import { getPlayers } from "./players";
import { getAttendanceForTraining } from "./attendance";
import { getEvaluatedPlayerIdsForTraining } from "./evaluations";
import { getUpcomingMatches } from "./dashboard";
import { getCallupsForMatch } from "./match-callups";
import { getObligations } from "./finance";
import { formatShortDate } from "@/lib/finance/format";
import type { TrainingRow } from "./trainings";

/** Misma heurística usada en Asistencia/Evaluaciones: sesión más reciente jugada, o la próxima si no hay pasadas. */
function pickRelevantTraining(trainings: TrainingRow[]): TrainingRow | null {
  if (trainings.length === 0) return null;
  const today = new Date().toISOString().slice(0, 10);
  const past = trainings.filter((t) => t.session_date <= today);
  if (past.length > 0) return past[0] ?? null;
  return trainings[trainings.length - 1] ?? null;
}

export interface ActionQueue {
  attendance: { pending: boolean; trainingId: string | null; trainingLabel: string | null; category: string };
  evaluations: { pendingCount: number; totalCount: number; trainingId: string | null; category: string };
  callups: {
    pending: boolean;
    matchId: string | null;
    matchLabel: string | null;
    confirmedCount: number;
    totalCount: number;
  };
  finance: { pendingCount: number; overdueCount: number; nearestDueLabel: string | null };
}

/**
 * "Qué necesito hacer hoy" — agrega across Asistencia, Evaluaciones, Partidos y
 * Finanzas para que el Dashboard sea una cola de acción, no solo KPIs.
 */
export async function getTodayActionQueue(category: string): Promise<ActionQueue> {
  const [trainings, players, matches, obligations] = await Promise.all([
    getTrainings(category),
    getPlayers(category),
    getUpcomingMatches(category),
    getObligations(),
  ]);

  const relevantTraining = pickRelevantTraining(trainings);

  const [attendanceMap, evaluatedIds] = relevantTraining
    ? await Promise.all([getAttendanceForTraining(relevantTraining.id), getEvaluatedPlayerIdsForTraining(relevantTraining.id)])
    : [new Map(), new Set<string>()];

  const nextMatch = matches[0] ?? null;
  const callups = nextMatch ? await getCallupsForMatch(nextMatch.id) : [];
  const confirmedCount = callups.filter((c) => c.call_status === "Confirmado").length;

  const pendingObligations = obligations.filter((o) => o.status !== "Pagado").sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const overdueCount = obligations.filter((o) => o.status === "Vencido").length;

  return {
    attendance: {
      pending: relevantTraining !== null && attendanceMap.size === 0,
      trainingId: relevantTraining?.id ?? null,
      trainingLabel: relevantTraining?.title ?? null,
      category,
    },
    evaluations: {
      pendingCount: relevantTraining ? Math.max(0, players.length - evaluatedIds.size) : 0,
      totalCount: players.length,
      trainingId: relevantTraining?.id ?? null,
      category,
    },
    callups: {
      pending: nextMatch !== null && confirmedCount === 0,
      matchId: nextMatch?.id ?? null,
      matchLabel: nextMatch ? `vs. ${nextMatch.rival}` : null,
      confirmedCount,
      totalCount: players.length,
    },
    finance: {
      pendingCount: pendingObligations.length,
      overdueCount,
      nearestDueLabel: pendingObligations[0] ? formatShortDate(pendingObligations[0].dueDate) : null,
    },
  };
}
