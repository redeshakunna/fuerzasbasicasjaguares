import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/database.types";

export type PlayerReportRow = Tables<"player_reports">;

export async function getPlayerReports(playerId: string): Promise<PlayerReportRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("player_reports")
    .select("*")
    .eq("player_id", playerId)
    .order("period", { ascending: false });

  if (error) {
    console.error("getPlayerReports() falló:", error);
    return [];
  }
  return data ?? [];
}

/** Tareas/compromisos del informe del período anterior (el más reciente antes de `period`) — para dar seguimiento. */
export async function getPreviousReportTasks(playerId: string, period: string): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("player_reports")
    .select("tasks, period")
    .eq("player_id", playerId)
    .lt("period", period)
    .order("period", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data.tasks;
}

/** Estado del informe de cada jugador para un período — usado por el hub de Informes para saber quién falta. */
export async function getReportsStatusForPeriod(
  playerIds: string[],
  period: string,
): Promise<Map<string, { id: string; status: string }>> {
  const map = new Map<string, { id: string; status: string }>();
  if (playerIds.length === 0) return map;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("player_reports")
    .select("id, player_id, status")
    .eq("period", period)
    .in("player_id", playerIds);

  if (error || !data) return map;
  data.forEach((r) => map.set(r.player_id, { id: r.id, status: r.status }));
  return map;
}

export interface AreaScores {
  technical: number | null;
  tactical: number | null;
  physical: number | null;
  attitude: number | null;
}

export interface MonthlyStats {
  averageScore: number | null;
  previousAverageScore: number | null;
  attendancePct: number | null;
  evaluationsCount: number;
  coachNotes: string[];
  areaScores: AreaScores;
}

export interface PlayerReportContext {
  category: string;
  performanceGroup: string | null;
}

/** Categoría y grupo de desempeño actuales del jugador — insumo para la recomendación del informe. */
export async function getPlayerReportContext(playerId: string): Promise<PlayerReportContext | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("players")
    .select("category, performance_group")
    .eq("id", playerId)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("getPlayerReportContext() falló:", error);
    return null;
  }
  return { category: data.category, performanceGroup: data.performance_group };
}

export function previousPeriod(period: string): string {
  const [y, m] = period.split("-").map(Number);
  const date = new Date(y ?? 2026, (m ?? 1) - 2, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

/** Primer día del mes siguiente al período (YYYY-MM) — límite superior exclusivo para las consultas. */
export function nextPeriodStart(period: string): string {
  const [y, m] = period.split("-").map(Number);
  const date = new Date(y ?? 2026, m ?? 1, 1); // mes siguiente, día 1
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`;
}

export function average(values: (number | null)[]): number | null {
  const nums = values.filter((v): v is number => v !== null);
  return nums.length > 0 ? nums.reduce((a, b) => a + b, 0) / nums.length : null;
}

async function monthlyAverage(
  playerId: string,
  period: string,
): Promise<{ avg: number | null; count: number; notes: string[]; areaScores: AreaScores }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("evaluations")
    .select("overall_score, notes, technical_score, tactical_score, physical_score, attitude_score")
    .eq("player_id", playerId)
    .gte("evaluation_date", `${period}-01`)
    .lt("evaluation_date", nextPeriodStart(period));

  const empty: AreaScores = { technical: null, tactical: null, physical: null, attitude: null };
  if (error || !data) return { avg: null, count: 0, notes: [], areaScores: empty };

  const scores = data.map((r) => r.overall_score).filter((s): s is number => s !== null);
  const notes = data.map((r) => r.notes).filter((n): n is string => !!n && n.trim().length > 0);

  return {
    avg: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null,
    count: data.length,
    notes,
    areaScores: {
      technical: average(data.map((r) => r.technical_score)),
      tactical: average(data.map((r) => r.tactical_score)),
      physical: average(data.map((r) => r.physical_score)),
      attitude: average(data.map((r) => r.attitude_score)),
    },
  };
}

async function monthlyAttendancePct(playerId: string, period: string): Promise<number | null> {
  const supabase = await createClient();
  const { data: trainings, error: trainingsError } = await supabase
    .from("trainings")
    .select("id")
    .gte("session_date", `${period}-01`)
    .lt("session_date", nextPeriodStart(period));

  if (trainingsError || !trainings || trainings.length === 0) return null;

  const { data: attendance, error } = await supabase
    .from("attendance")
    .select("status")
    .eq("player_id", playerId)
    .in(
      "training_id",
      trainings.map((t) => t.id),
    );

  if (error || !attendance || attendance.length === 0) return null;

  const presentes = attendance.filter((a) => a.status === "Presente" || a.status === "Tarde").length;
  return Math.round((presentes / attendance.length) * 100);
}

export interface MonthlyParticipation {
  trainingsTotal: number;
  trainingsAttended: number;
  matchesPlayed: number;
  matchesStarted: number;
  minutesPlayed: number;
}

/**
 * Participación real del jugador en el período — entrenamientos asistidos,
 * partidos jugados (y en cuántos fue titular, inferido de `entered_minute`
 * nulo) y minutos jugados. Insumo del informe individual imprimible.
 */
export async function getMonthlyParticipation(playerId: string, period: string): Promise<MonthlyParticipation> {
  const supabase = await createClient();

  const { data: trainings } = await supabase
    .from("trainings")
    .select("id")
    .gte("session_date", `${period}-01`)
    .lt("session_date", nextPeriodStart(period));

  const trainingIds = (trainings ?? []).map((t) => t.id);
  let trainingsAttended = 0;
  if (trainingIds.length > 0) {
    const { data: attendance } = await supabase
      .from("attendance")
      .select("status")
      .eq("player_id", playerId)
      .in("training_id", trainingIds);
    trainingsAttended = (attendance ?? []).filter((a) => a.status === "Presente" || a.status === "Tarde").length;
  }

  const { data: matches } = await supabase
    .from("matches")
    .select("id")
    .gte("match_date", `${period}-01`)
    .lt("match_date", nextPeriodStart(period));

  const matchIds = (matches ?? []).map((m) => m.id);
  let matchesPlayed = 0;
  let matchesStarted = 0;
  let minutesPlayed = 0;
  if (matchIds.length > 0) {
    const { data: callups } = await supabase
      .from("match_callups")
      .select("call_status, minutes_played, entered_minute")
      .eq("player_id", playerId)
      .in("match_id", matchIds);
    const played = (callups ?? []).filter((c) => c.call_status === "Confirmado" && c.minutes_played !== null);
    matchesPlayed = played.length;
    matchesStarted = played.filter((c) => c.entered_minute === null).length;
    minutesPlayed = played.reduce((sum, c) => sum + (c.minutes_played ?? 0), 0);
  }

  return { trainingsTotal: trainingIds.length, trainingsAttended, matchesPlayed, matchesStarted, minutesPlayed };
}

/** Estadísticas del mes para armar el informe — evaluaciones, tendencia y asistencia. */
export async function getMonthlyStats(playerId: string, period: string): Promise<MonthlyStats> {
  const prev = previousPeriod(period);
  const [current, previous, attendancePct] = await Promise.all([
    monthlyAverage(playerId, period),
    monthlyAverage(playerId, prev),
    monthlyAttendancePct(playerId, period),
  ]);

  return {
    averageScore: current.avg,
    previousAverageScore: previous.avg,
    attendancePct,
    evaluationsCount: current.count,
    coachNotes: current.notes,
    areaScores: current.areaScores,
  };
}
