import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/database.types";
import { getPlayers } from "@/lib/data/players";
import { getFullName } from "@/lib/data/players-stats";
import { average, nextPeriodStart, previousPeriod, type AreaScores } from "@/lib/data/reports";

export type GroupReportRow = Tables<"group_reports">;

export interface CategoryMonthlyStats {
  averageScore: number | null;
  previousAverageScore: number | null;
  attendancePct: number | null;
  evaluationsCount: number;
  playerCount: number;
  areaScores: AreaScores;
  standoutNames: string[];
}

async function categoryAverage(
  playerIds: string[],
  period: string,
): Promise<{ avg: number | null; count: number; areaScores: AreaScores; standoutNames: string[] }> {
  const empty: AreaScores = { technical: null, tactical: null, physical: null, attitude: null };
  if (playerIds.length === 0) return { avg: null, count: 0, areaScores: empty, standoutNames: [] };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("evaluations")
    .select("overall_score, technical_score, tactical_score, physical_score, attitude_score, is_standout, player_id, players(first_name, last_name, nickname)")
    .in("player_id", playerIds)
    .gte("evaluation_date", `${period}-01`)
    .lt("evaluation_date", nextPeriodStart(period));

  if (error || !data) return { avg: null, count: 0, areaScores: empty, standoutNames: [] };

  const scores = data.map((r) => r.overall_score).filter((s): s is number => s !== null);

  const standoutNames = Array.from(
    new Map(
      data
        .filter((r) => r.is_standout && r.players)
        .map((r) => {
          const p = r.players as unknown as { first_name: string; last_name: string; nickname: string | null };
          return [r.player_id, getFullName(p)] as const;
        }),
    ).values(),
  );

  return {
    avg: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null,
    count: data.length,
    areaScores: {
      technical: average(data.map((r) => r.technical_score)),
      tactical: average(data.map((r) => r.tactical_score)),
      physical: average(data.map((r) => r.physical_score)),
      attitude: average(data.map((r) => r.attitude_score)),
    },
    standoutNames,
  };
}

async function categoryAttendancePct(category: string, period: string): Promise<number | null> {
  const supabase = await createClient();
  const { data: trainings, error: trainingsError } = await supabase
    .from("trainings")
    .select("id")
    .eq("category", category)
    .gte("session_date", `${period}-01`)
    .lt("session_date", nextPeriodStart(period));

  if (trainingsError || !trainings || trainings.length === 0) return null;

  const { data: attendance, error } = await supabase
    .from("attendance")
    .select("status")
    .in(
      "training_id",
      trainings.map((t) => t.id),
    );

  if (error || !attendance || attendance.length === 0) return null;

  const presentes = attendance.filter((a) => a.status === "Presente" || a.status === "Tarde").length;
  return Math.round((presentes / attendance.length) * 100);
}

/** Estadísticas agregadas del plantel de una categoría para un período — insumo del informe grupal. */
export async function getCategoryMonthlyStats(category: string, period: string): Promise<CategoryMonthlyStats> {
  const roster = await getPlayers(category);
  const playerIds = roster.map((p) => p.id);
  const prev = previousPeriod(period);

  const [current, previous, attendancePct] = await Promise.all([
    categoryAverage(playerIds, period),
    categoryAverage(playerIds, prev),
    categoryAttendancePct(category, period),
  ]);

  return {
    averageScore: current.avg,
    previousAverageScore: previous.avg,
    attendancePct,
    evaluationsCount: current.count,
    playerCount: roster.length,
    areaScores: current.areaScores,
    standoutNames: current.standoutNames,
  };
}

export async function getGroupReports(category: string): Promise<GroupReportRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("group_reports")
    .select("*")
    .eq("category", category)
    .order("period", { ascending: false });

  if (error) {
    console.error("getGroupReports() falló:", error);
    return [];
  }
  return data ?? [];
}

export async function getCategoryPhoto(category: string): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("category_photos").select("photo_url").eq("category", category).maybeSingle();
  if (error || !data) return null;
  return data.photo_url;
}
