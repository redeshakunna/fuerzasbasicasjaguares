import { createClient } from "@/lib/supabase/server";
import { computeSeasonStats, matchOutcome, type MatchOutcome, type SeasonStats } from "./match-stats";
import type { MatchRow } from "./matches";

export type PerformancePeriod = "semana" | "mes" | "temporada";

export const performancePeriodLabel: Record<PerformancePeriod, string> = {
  semana: "Semana",
  mes: "Mes",
  temporada: "Temporada",
};

export interface MatchPoint {
  id: string;
  opponent: string;
  ourScore: number;
  opponentScore: number;
  outcome: MatchOutcome;
  isHome: boolean;
}

export interface TeamPerformancePoint {
  label: string;
  value: number | null;
  sampleSize: number;
  matches: MatchPoint[];
}

export interface TeamPerformanceSummary extends SeasonStats {
  averageScore: number | null;
  evaluationsCount: number;
}

const dayAbbrev = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const monthAbbrev = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseISO(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

function addDays(d: Date, days: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function toMatchPoint(m: MatchRow): MatchPoint {
  return {
    id: m.id,
    opponent: m.opponent,
    ourScore: m.our_score ?? 0,
    opponentScore: m.opponent_score ?? 0,
    outcome: matchOutcome(m),
    isHome: m.is_home,
  };
}

/**
 * Serie de "Rendimiento del equipo" alimentada 100% con datos reales: el promedio diario/semanal/
 * mensual de `evaluations.overall_score` del plantel de la categoría, con los partidos jugados
 * (marcador real de `matches`) superpuestos como marcadores en el mismo eje de tiempo. Si un
 * período no tiene evaluaciones registradas todavía, el punto queda en `value: null` — nunca se
 * inventa un dato para rellenar el gráfico.
 */
export async function getTeamPerformanceSeries(category: string): Promise<{
  series: Record<PerformancePeriod, TeamPerformancePoint[]>;
  summary: TeamPerformanceSummary;
}> {
  const supabase = await createClient();
  const empty = {
    series: { semana: [], mes: [], temporada: [] } as Record<PerformancePeriod, TeamPerformancePoint[]>,
    summary: { ...computeSeasonStats([]), averageScore: null, evaluationsCount: 0 },
  };

  const { data: players, error: playersError } = await supabase.from("players").select("id").eq("category", category);
  if (playersError) {
    console.error("getTeamPerformanceSeries() players falló:", playersError);
    return empty;
  }
  const playerIds = (players ?? []).map((p) => p.id);

  const [evaluationsRes, matchesRes] = await Promise.all([
    playerIds.length > 0
      ? supabase.from("evaluations").select("evaluation_date, overall_score").in("player_id", playerIds)
      : Promise.resolve({ data: [], error: null }),
    supabase.from("matches").select("*").eq("category", category).order("match_date", { ascending: true }),
  ]);

  if (evaluationsRes.error) console.error("getTeamPerformanceSeries() evaluations falló:", evaluationsRes.error);
  if (matchesRes.error) console.error("getTeamPerformanceSeries() matches falló:", matchesRes.error);

  const evaluations = (evaluationsRes.error ? [] : evaluationsRes.data ?? []) as {
    evaluation_date: string;
    overall_score: number | null;
  }[];
  const allMatches = (matchesRes.error ? [] : matchesRes.data ?? []) as MatchRow[];
  const playedMatches = allMatches.filter((m) => m.our_score !== null && m.opponent_score !== null);

  // Bucket de evaluaciones por fecha exacta (YYYY-MM-DD) → suma + conteo.
  const evalByDate = new Map<string, { sum: number; count: number }>();
  for (const ev of evaluations) {
    if (ev.overall_score === null) continue;
    const bucket = evalByDate.get(ev.evaluation_date) ?? { sum: 0, count: 0 };
    bucket.sum += Number(ev.overall_score);
    bucket.count += 1;
    evalByDate.set(ev.evaluation_date, bucket);
  }

  const matchByDate = new Map<string, MatchPoint[]>();
  for (const m of playedMatches) {
    const list = matchByDate.get(m.match_date) ?? [];
    list.push(toMatchPoint(m));
    matchByDate.set(m.match_date, list);
  }

  const today = new Date();
  const todayISO = isoDate(today);

  // --- Semana: últimos 7 días de calendario, terminando hoy. ---
  const semana: TeamPerformancePoint[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = addDays(today, -i);
    const key = isoDate(d);
    const bucket = evalByDate.get(key);
    semana.push({
      label: dayAbbrev[d.getDay()] ?? "",
      value: bucket ? round1(bucket.sum / bucket.count) : null,
      sampleSize: bucket?.count ?? 0,
      matches: matchByDate.get(key) ?? [],
    });
  }

  // --- Mes: últimas 4 semanas (bloques de 7 días), terminando hoy. ---
  const mes: TeamPerformancePoint[] = [];
  for (let w = 3; w >= 0; w--) {
    const weekEnd = addDays(today, -7 * w);
    const weekStart = addDays(weekEnd, -6);
    let sum = 0;
    let count = 0;
    const weekMatches: MatchPoint[] = [];
    for (let i = 0; i < 7; i++) {
      const key = isoDate(addDays(weekStart, i));
      const bucket = evalByDate.get(key);
      if (bucket) {
        sum += bucket.sum;
        count += bucket.count;
      }
      const dayMatches = matchByDate.get(key);
      if (dayMatches) weekMatches.push(...dayMatches);
    }
    mes.push({
      label: `Sem ${4 - w}`,
      value: count > 0 ? round1(sum / count) : null,
      sampleSize: count,
      matches: weekMatches,
    });
  }

  // --- Temporada: por mes calendario, desde el primer registro real hasta el mes actual. ---
  const allDates = [...evaluations.map((e) => e.evaluation_date), ...playedMatches.map((m) => m.match_date)];
  const earliestISO = allDates.length > 0 ? allDates.reduce((a, b) => (a < b ? a : b)) : todayISO;
  const earliest = parseISO(earliestISO);
  let cursor = new Date(earliest.getFullYear(), earliest.getMonth(), 1);
  const lastMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const temporada: TeamPerformancePoint[] = [];
  // Tope de seguridad: no más de 12 meses hacia atrás en el gráfico.
  const monthCursorFloor = new Date(lastMonth.getFullYear(), lastMonth.getMonth() - 11, 1);
  if (cursor < monthCursorFloor) cursor = monthCursorFloor;

  while (cursor <= lastMonth) {
    const y = cursor.getFullYear();
    const m = cursor.getMonth();
    const monthStartISO = isoDate(new Date(y, m, 1));
    const monthEndISO = isoDate(new Date(y, m + 1, 0));
    let sum = 0;
    let count = 0;
    const monthMatches: MatchPoint[] = [];
    for (const [dateKey, bucket] of evalByDate) {
      if (dateKey >= monthStartISO && dateKey <= monthEndISO) {
        sum += bucket.sum;
        count += bucket.count;
      }
    }
    for (const [dateKey, pts] of matchByDate) {
      if (dateKey >= monthStartISO && dateKey <= monthEndISO) monthMatches.push(...pts);
    }
    temporada.push({
      label: monthAbbrev[m] ?? "",
      value: count > 0 ? round1(sum / count) : null,
      sampleSize: count,
      matches: monthMatches,
    });
    cursor = new Date(y, m + 1, 1);
  }

  const totalEvalCount = evaluations.filter((e) => e.overall_score !== null).length;
  const totalEvalSum = evaluations.reduce((acc, e) => acc + (e.overall_score !== null ? Number(e.overall_score) : 0), 0);

  const summary: TeamPerformanceSummary = {
    ...computeSeasonStats(allMatches),
    averageScore: totalEvalCount > 0 ? round1(totalEvalSum / totalEvalCount) : null,
    evaluationsCount: totalEvalCount,
  };

  return { series: { semana, mes, temporada }, summary };
}
