import { createClient } from "@/lib/supabase/server";
import type { CalendarEvent } from "@/components/dashboard/data/calendar.data";
import type { DashboardMatch } from "@/components/dashboard/data/matches.data";

const monthShort = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const dayShort = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const calendarDayAbbrev: CalendarEvent["day"][] = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function parseLocalDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

function formatMatchDate(dateStr: string) {
  const date = parseLocalDate(dateStr);
  return `${dayShort[date.getDay()]} ${date.getDate()} ${monthShort[date.getMonth()]}`.replace(/^./, (c) =>
    c.toUpperCase()
  );
}

function formatTime(time: string | null) {
  if (!time) return "Hora por definir";
  const [hStr, mStr] = time.split(":");
  const h = Number(hStr);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${mStr} ${period}`;
}

/** Próximos partidos (tabla `matches`, desde hoy en adelante). */
export async function getUpcomingMatches(category?: string, limit = 5): Promise<DashboardMatch[]> {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  let query = supabase
    .from("matches")
    .select("*")
    .gte("match_date", today)
    .order("match_date", { ascending: true })
    .limit(limit);

  if (category) query = query.eq("category", category);

  const { data, error } = await query;

  if (error) {
    console.error("getUpcomingMatches() falló:", error);
    return [];
  }

  return (data ?? []).map((m) => ({
    id: m.id,
    date: formatMatchDate(m.match_date),
    time: formatTime(m.match_time),
    rival: m.opponent,
    category: m.category,
    location: m.location ?? "Por definir",
    status: m.status,
  }));
}

/** Eventos de la semana actual (entrenamientos + partidos) para el calendario. */
export async function getWeeklyEvents(category?: string): Promise<CalendarEvent[]> {
  const supabase = await createClient();

  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = domingo
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday);
  const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);
  const mondayStr = monday.toISOString().slice(0, 10);
  const sundayStr = sunday.toISOString().slice(0, 10);

  let trainingsQuery = supabase
    .from("trainings")
    .select("*")
    .gte("session_date", mondayStr)
    .lte("session_date", sundayStr);
  let matchesQuery = supabase
    .from("matches")
    .select("*")
    .gte("match_date", mondayStr)
    .lte("match_date", sundayStr);

  if (category) {
    trainingsQuery = trainingsQuery.eq("category", category);
    matchesQuery = matchesQuery.eq("category", category);
  }

  const [trainingsRes, matchesRes] = await Promise.all([trainingsQuery, matchesQuery]);

  if (trainingsRes.error) console.error("getWeeklyEvents() trainings falló:", trainingsRes.error);
  if (matchesRes.error) console.error("getWeeklyEvents() matches falló:", matchesRes.error);

  const trainingEvents: CalendarEvent[] = (trainingsRes.error ? [] : trainingsRes.data ?? []).map((t) => ({
    id: t.id,
    day: calendarDayAbbrev[parseLocalDate(t.session_date).getDay()] ?? "Lun",
    time: formatTime(t.start_time),
    title: t.title,
    type: "entrenamiento",
  }));

  const matchEvents: CalendarEvent[] = (matchesRes.error ? [] : matchesRes.data ?? []).map((m) => ({
    id: m.id,
    day: calendarDayAbbrev[parseLocalDate(m.match_date).getDay()] ?? "Sáb",
    time: formatTime(m.match_time),
    title: `vs. ${m.opponent}`,
    type: "partido",
  }));

  return [...trainingEvents, ...matchEvents];
}
