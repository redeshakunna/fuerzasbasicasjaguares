import { createClient } from "@/lib/supabase/server";
import { getTrainings } from "./trainings";
import { getMatches } from "./matches";
import type { Tables } from "@/lib/supabase/database.types";
import type { TrainingRow } from "./player-profile";
import type { MatchRow } from "./matches";
import type { ActivityKind } from "./activities";

export type AttendanceRow = Tables<"attendance">;

/** Asistencia ya registrada para un entrenamiento — mapa player_id → estado. */
export async function getAttendanceForTraining(trainingId: string): Promise<Map<string, AttendanceRow["status"]>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("attendance").select("*").eq("training_id", trainingId);

  if (error) {
    console.error("getAttendanceForTraining() falló:", error);
    return new Map();
  }
  return new Map((data ?? []).map((row) => [row.player_id, row.status]));
}

/** Asistencia ya registrada para un partido (día de partido) — mapa player_id → estado. */
export async function getAttendanceForMatch(matchId: string): Promise<Map<string, AttendanceRow["status"]>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("attendance").select("*").eq("match_id", matchId);

  if (error) {
    console.error("getAttendanceForMatch() falló:", error);
    return new Map();
  }
  return new Map((data ?? []).map((row) => [row.player_id, row.status]));
}

export interface ActivityAttendanceEntry {
  kind: ActivityKind;
  id: string;
  date: string;
  title: string;
  presentes: number;
  ausentes: number;
  tarde: number;
  justificados: number;
}

/** Historial de asistencia por actividad (entrenamientos + partidos) — últimas N de la categoría, mezcladas por fecha. */
export async function getAttendanceHistory(category: string, limit = 8): Promise<ActivityAttendanceEntry[]> {
  const [trainings, matches] = await Promise.all([getTrainings(category), getMatches(category)]);

  const supabase = await createClient();
  const trainingIds = trainings.map((t) => t.id);
  const matchIds = matches.map((m) => m.id);

  const [trainingAttendance, matchAttendance] = await Promise.all([
    trainingIds.length > 0
      ? supabase.from("attendance").select("*").in("training_id", trainingIds)
      : Promise.resolve({ data: [] as AttendanceRow[], error: null }),
    matchIds.length > 0
      ? supabase.from("attendance").select("*").in("match_id", matchIds)
      : Promise.resolve({ data: [] as AttendanceRow[], error: null }),
  ]);

  if (trainingAttendance.error) console.error("getAttendanceHistory() (trainings) falló:", trainingAttendance.error);
  if (matchAttendance.error) console.error("getAttendanceHistory() (matches) falló:", matchAttendance.error);

  const byTraining = new Map<string, AttendanceRow[]>();
  for (const row of trainingAttendance.data ?? []) {
    if (!row.training_id) continue;
    (byTraining.get(row.training_id) ?? byTraining.set(row.training_id, []).get(row.training_id)!).push(row);
  }
  const byMatch = new Map<string, AttendanceRow[]>();
  for (const row of matchAttendance.data ?? []) {
    if (!row.match_id) continue;
    (byMatch.get(row.match_id) ?? byMatch.set(row.match_id, []).get(row.match_id)!).push(row);
  }

  function counts(rows: AttendanceRow[]) {
    return {
      presentes: rows.filter((r) => r.status === "Presente").length,
      ausentes: rows.filter((r) => r.status === "Ausente").length,
      tarde: rows.filter((r) => r.status === "Tarde").length,
      justificados: rows.filter((r) => r.status === "Justificado").length,
    };
  }

  const trainingEntries: ActivityAttendanceEntry[] = trainings.map((t) => ({
    kind: "entrenamiento",
    id: t.id,
    date: t.session_date,
    title: t.title,
    ...counts(byTraining.get(t.id) ?? []),
  }));

  const matchEntries: ActivityAttendanceEntry[] = matches
    .filter((m) => byMatch.has(m.id))
    .map((m) => ({
      kind: "partido" as const,
      id: m.id,
      date: m.match_date,
      title: m.is_home ? `Jaguares vs. ${m.opponent}` : `${m.opponent} vs. Jaguares`,
      ...counts(byMatch.get(m.id) ?? []),
    }));

  return [...trainingEntries, ...matchEntries]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}

/**
 * Fecha del último entrenamiento al que asistió (Presente/Tarde) cada jugador — calculada
 * en tiempo real desde `attendance` + `trainings`. Reemplaza a `players.last_training_at`,
 * que nunca se actualiza al guardar asistencia y por eso siempre aparecía "Sin registrar".
 */
export async function getLastTrainingAttendanceMap(playerIds: string[]): Promise<Map<string, string>> {
  if (playerIds.length === 0) return new Map();
  const supabase = await createClient();

  const { data: rows, error } = await supabase
    .from("attendance")
    .select("player_id, training_id")
    .in("player_id", playerIds)
    .not("training_id", "is", null)
    .in("status", ["Presente", "Tarde"]);

  if (error) {
    console.error("getLastTrainingAttendanceMap() falló:", error);
    return new Map();
  }

  const trainingIds = Array.from(new Set((rows ?? []).map((r) => r.training_id).filter((id): id is string => !!id)));
  if (trainingIds.length === 0) return new Map();

  const { data: trainings, error: trainingsError } = await supabase
    .from("trainings")
    .select("id, session_date")
    .in("id", trainingIds);

  if (trainingsError) {
    console.error("getLastTrainingAttendanceMap() (trainings) falló:", trainingsError);
    return new Map();
  }

  const sessionDateById = new Map((trainings ?? []).map((t) => [t.id, t.session_date]));
  const lastByPlayer = new Map<string, string>();

  for (const row of rows ?? []) {
    if (!row.training_id) continue;
    const sessionDate = sessionDateById.get(row.training_id);
    if (!sessionDate) continue;
    const current = lastByPlayer.get(row.player_id);
    if (!current || sessionDate > current) lastByPlayer.set(row.player_id, sessionDate);
  }

  return lastByPlayer;
}

export interface PlayerAttendanceEntry {
  kind: ActivityKind;
  id: string;
  date: string;
  title: string;
  status: AttendanceRow["status"];
}

/** Historial de asistencia de un jugador (entrenamientos + partidos) — alimenta automáticamente su perfil. */
export async function getPlayerAttendanceHistory(playerId: string, limit = 8): Promise<PlayerAttendanceEntry[]> {
  const supabase = await createClient();
  const { data: rows, error } = await supabase
    .from("attendance")
    .select("*")
    .eq("player_id", playerId)
    .order("recorded_at", { ascending: false })
    .limit(limit * 2);

  if (error) {
    console.error("getPlayerAttendanceHistory() falló:", error);
    return [];
  }
  if (!rows || rows.length === 0) return [];

  const trainingIds = rows.map((r) => r.training_id).filter((id): id is string => !!id);
  const matchIds = rows.map((r) => r.match_id).filter((id): id is string => !!id);

  const [trainingsRes, matchesRes] = await Promise.all([
    trainingIds.length > 0
      ? supabase.from("trainings").select("*").in("id", trainingIds)
      : Promise.resolve({ data: [] as TrainingRow[], error: null }),
    matchIds.length > 0
      ? supabase.from("matches").select("*").in("id", matchIds)
      : Promise.resolve({ data: [] as MatchRow[], error: null }),
  ]);

  const trainingById = new Map((trainingsRes.data ?? []).map((t) => [t.id, t]));
  const matchById = new Map((matchesRes.data ?? []).map((m) => [m.id, m]));

  return rows
    .map((r) => {
      if (r.training_id) {
        const training = trainingById.get(r.training_id);
        if (!training) return null;
        return { kind: "entrenamiento" as const, id: training.id, date: training.session_date, title: training.title, status: r.status };
      }
      if (r.match_id) {
        const match = matchById.get(r.match_id);
        if (!match) return null;
        const title = match.is_home ? `Jaguares vs. ${match.opponent}` : `${match.opponent} vs. Jaguares`;
        return { kind: "partido" as const, id: match.id, date: match.match_date, title, status: r.status };
      }
      return null;
    })
    .filter((entry): entry is PlayerAttendanceEntry => entry !== null)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}
