import { createClient } from "@/lib/supabase/server";
import type { ActivityKind } from "./activities";
import type { EvaluationItemRow, EvaluationRow } from "./player-profile";

function activityColumn(kind: ActivityKind): "training_id" | "match_id" {
  return kind === "entrenamiento" ? "training_id" : "match_id";
}

/** Evaluación de un jugador para una actividad puntual (entrenamiento o partido), si existe. */
export async function getEvaluationForPlayerAndActivity(
  playerId: string,
  kind: ActivityKind,
  activityId: string,
): Promise<EvaluationRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("evaluations")
    .select("*")
    .eq("player_id", playerId)
    .eq(activityColumn(kind), activityId)
    .maybeSingle();

  if (error) {
    console.error("getEvaluationForPlayerAndActivity() falló:", error);
    return null;
  }
  return data;
}

/** IDs de jugadores ya evaluados en una actividad — para marcar el roster. */
export async function getEvaluatedPlayerIdsForActivity(kind: ActivityKind, activityId: string): Promise<Set<string>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("evaluations").select("player_id").eq(activityColumn(kind), activityId);

  if (error) {
    console.error("getEvaluatedPlayerIdsForActivity() falló:", error);
    return new Set();
  }
  return new Set((data ?? []).map((row) => row.player_id));
}

/** Todas las evaluaciones de una actividad (entrenamiento o partido), mapeadas por jugador — para el hub de Evaluaciones. */
export async function getEvaluationsForActivity(kind: ActivityKind, activityId: string): Promise<Map<string, EvaluationRow>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("evaluations").select("*").eq(activityColumn(kind), activityId);

  if (error) {
    console.error("getEvaluationsForActivity() falló:", error);
    return new Map();
  }
  return new Map((data ?? []).map((row) => [row.player_id, row]));
}

/** Evaluación de un jugador para una sesión de entrenamiento puntual (si existe). */
export async function getEvaluationForPlayerAndTraining(
  playerId: string,
  trainingId: string
): Promise<EvaluationRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("evaluations")
    .select("*")
    .eq("player_id", playerId)
    .eq("training_id", trainingId)
    .maybeSingle();

  if (error) {
    console.error("getEvaluationForPlayerAndTraining() falló:", error);
    return null;
  }
  return data;
}

/** Puntajes por habilidad de una evaluación puntual. */
export async function getEvaluationItems(evaluationId: string): Promise<EvaluationItemRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("evaluation_items")
    .select("*")
    .eq("evaluation_id", evaluationId);

  if (error) {
    console.error("getEvaluationItems() falló:", error);
    return [];
  }
  return data ?? [];
}

/** IDs de jugadores ya evaluados en una sesión — para marcar el roster. */
export async function getEvaluatedPlayerIdsForTraining(trainingId: string): Promise<Set<string>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("evaluations")
    .select("player_id")
    .eq("training_id", trainingId);

  if (error) {
    console.error("getEvaluatedPlayerIdsForTraining() falló:", error);
    return new Set();
  }
  return new Set((data ?? []).map((row) => row.player_id));
}

/** Todas las evaluaciones de una sesión, mapeadas por jugador — para el hub de Evaluaciones. */
export async function getEvaluationsForTraining(trainingId: string): Promise<Map<string, EvaluationRow>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("evaluations").select("*").eq("training_id", trainingId);

  if (error) {
    console.error("getEvaluationsForTraining() falló:", error);
    return new Map();
  }
  return new Map((data ?? []).map((row) => [row.player_id, row]));
}
