import { CameraOff, ClipboardList, FileWarning, HeartPulse, Star, Trophy, TrendingUp, UserCheck, UserPlus, Users, PencilLine, CalendarDays } from "lucide-react";
import type { KpiCard } from "@/components/dashboard/data/kpis.data";
import type { RosterPlayer, SquadAlert, UpcomingBirthday } from "@/components/dashboard/data/jugadores-page.data";
import type { SquadStatusSlice } from "@/components/dashboard/data/squad.data";
import type { PlayerRow } from "./players";

/* ---------------------------------------------------------------------- */
/*  Utilidades de fecha                                                    */
/* ---------------------------------------------------------------------- */

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function calculateAge(birthDate: string): number {
  const today = startOfToday();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
  if (!hasHadBirthdayThisYear) age -= 1;
  return age;
}

export function daysUntilNextBirthday(birthDate: string): { days: number; nextDate: Date } {
  const today = startOfToday();
  const birth = new Date(birthDate);
  let next = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
  if (next < today) next = new Date(today.getFullYear() + 1, birth.getMonth(), birth.getDate());
  const days = Math.round((next.getTime() - today.getTime()) / 86_400_000);
  return { days, nextDate: next };
}

const monthShort = [
  "ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic",
];

export function formatShortDate(date: Date) {
  return `${date.getDate()} de ${monthShort[date.getMonth()]}`;
}

export function initialsFrom(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "??";
}

/** Nombre completo para mostrar — nombres y apellidos se guardan por separado. */
export function getFullName(player: { first_name: string; last_name: string }) {
  return `${player.first_name} ${player.last_name}`.trim();
}

/** Orden "de atrás hacia adelante" para armar convocatorias — Porteros, Defensas, Volantes, Extremos, Delanteros. */
export const callupPositionOrder: Record<PlayerRow["position_group"], number> = {
  Arquero: 0,
  Defensa: 1,
  Volante: 2,
  Extremo: 3,
  Delantero: 4,
};

export const callupPositionLabel: Record<PlayerRow["position_group"], string> = {
  Arquero: "Porteros",
  Defensa: "Defensas",
  Volante: "Volantes",
  Extremo: "Extremos",
  Delantero: "Delanteros",
};

/**
 * Ordena el plantel para la convocatoria: por posición (de atrás hacia adelante) y,
 * dentro de cada posición, por mejor promedio (rating) primero.
 */
export function sortRosterForCallup(players: PlayerRow[]): PlayerRow[] {
  return [...players].sort((a, b) => {
    const posDiff = callupPositionOrder[a.position_group] - callupPositionOrder[b.position_group];
    if (posDiff !== 0) return posDiff;
    return (b.rating ?? 0) - (a.rating ?? 0);
  });
}

/** Recibe una fecha "YYYY-MM-DD" (sin hora) — se parsea en horario local para evitar saltos de día por UTC. */
export function formatLastTraining(lastTrainingDate: string | null): string {
  if (!lastTrainingDate) return "Sin registrar";
  const today = startOfToday();
  const [y, m, d] = lastTrainingDate.split("-").map(Number);
  const date = new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
  const days = Math.round((today.getTime() - date.getTime()) / 86_400_000);
  if (days <= 0) return "Hoy";
  if (days === 1) return "Ayer";
  return `Hace ${days} días`;
}

const positionGroupTone: Record<string, RosterPlayer["positionTone"]> = {
  Arquero: "gold",
  Defensa: "violet",
  Volante: "turquoise",
  Extremo: "maroon",
  Delantero: "green",
};

/**
 * Adapta una fila real de `players` al formato que ya consumen las tarjetas/tabla.
 * `lastTrainingDate` es opcional — cuando se pasa (calculado en tiempo real desde
 * `attendance`), reemplaza a la columna `last_training_at`, que nunca se actualiza
 * automáticamente al guardar asistencia.
 */
export function toRosterPlayer(row: PlayerRow, lastTrainingDate?: string | null): RosterPlayer {
  const fullName = getFullName(row);
  return {
    id: row.id,
    name: fullName,
    nickname: row.nickname,
    initials: initialsFrom(fullName),
    photoUrl: row.photo_url,
    category: row.category,
    position: row.position,
    positionTone: positionGroupTone[row.position_group] ?? "green",
    status: row.status,
    rating: row.rating ?? 0,
    age: calculateAge(row.birth_date),
    height: row.height_cm ? `${(row.height_cm / 100).toFixed(2)} m` : "—",
    weight: row.weight_kg ? `${row.weight_kg} kg` : "—",
    lastTraining: formatLastTraining(lastTrainingDate !== undefined ? lastTrainingDate : row.last_training_at),
    dominantFoot: row.dominant_foot,
  };
}

/* ---------------------------------------------------------------------- */
/*  KPIs                                                                   */
/* ---------------------------------------------------------------------- */

export function getPlayersKpis(players: PlayerRow[]): KpiCard[] {
  const total = players.length;
  const disponibles = players.filter((p) => p.status === "Disponible").length;
  const lesionados = players.filter((p) => p.status === "Lesionado").length;
  const suspendidos = players.filter((p) => p.status === "Suspendido").length;

  const now = new Date();
  const nuevosEsteMes = players.filter((p) => {
    const joined = new Date(p.joined_at);
    return joined.getFullYear() === now.getFullYear() && joined.getMonth() === now.getMonth();
  }).length;

  const edadPromedio =
    total > 0 ? players.reduce((sum, p) => sum + calculateAge(p.birth_date), 0) / total : 0;

  const disponiblesPct = total > 0 ? Math.round((disponibles / total) * 100) : 0;

  return [
    {
      id: "total-jugadores",
      icon: Users,
      label: "Total Jugadores",
      value: String(total),
      delta: total > 0 ? `${nuevosEsteMes} nuevos este mes` : "Sin jugadores aún",
      trend: nuevosEsteMes > 0 ? "up" : "flat",
      accent: "green",
    },
    {
      id: "disponibles",
      icon: UserCheck,
      label: "Disponibles",
      value: String(disponibles),
      delta: total > 0 ? `${disponiblesPct}% del plantel` : "—",
      trend: "flat",
      accent: "green",
      trendTone: "neutral",
    },
    {
      id: "lesionados",
      icon: HeartPulse,
      label: "Lesionados",
      value: String(lesionados),
      delta: lesionados > 0 ? "Requieren seguimiento" : "Ninguno",
      trend: lesionados > 0 ? "up" : "flat",
      accent: "maroon",
      trendTone: lesionados > 0 ? "maroon" : "neutral",
    },
    {
      id: "suspendidos",
      icon: PencilLine,
      label: "Suspendidos",
      value: String(suspendidos),
      delta: "Estado disciplinario",
      trend: "flat",
      accent: "gold",
      trendTone: "neutral",
    },
    {
      id: "nuevos-mes",
      icon: UserPlus,
      label: "Nuevos este mes",
      value: String(nuevosEsteMes),
      delta: "Incorporaciones",
      trend: nuevosEsteMes > 0 ? "up" : "flat",
      accent: "blue",
      trendTone: nuevosEsteMes > 0 ? "green" : "neutral",
    },
    {
      id: "edad-promedio",
      icon: CalendarDays,
      label: "Edad promedio",
      value: total > 0 ? edadPromedio.toFixed(1) : "—",
      delta: "Categoría Sub-15",
      trend: "flat",
      accent: "violet",
      trendTone: "neutral",
    },
  ];
}

/* ---------------------------------------------------------------------- */
/*  Próximos cumpleaños                                                    */
/* ---------------------------------------------------------------------- */

export function getUpcomingBirthdays(players: PlayerRow[], limit = 5): UpcomingBirthday[] {
  return players
    .map((p) => {
      const { days, nextDate } = daysUntilNextBirthday(p.birth_date);
      const fullName = getFullName(p);
      return {
        id: p.id,
        name: fullName,
        initials: initialsFrom(fullName),
        category: p.category,
        days,
        date: formatShortDate(nextDate),
      };
    })
    .sort((a, b) => a.days - b.days)
    .slice(0, limit)
    .map((b) => ({
      id: b.id,
      name: b.name,
      initials: b.initials,
      category: b.category,
      daysLabel: b.days === 0 ? "Hoy" : b.days === 1 ? "Mañana" : `${b.days} días`,
      date: b.date,
    }));
}

/* ---------------------------------------------------------------------- */
/*  Alertas del plantel                                                    */
/* ---------------------------------------------------------------------- */

export function getSquadAlerts(players: PlayerRow[], pendingEvaluations: number): SquadAlert[] {
  const documentacionPendiente = players.filter((p) => p.documents_status === "Pendiente").length;
  const sinFoto = players.filter((p) => !p.photo_url).length;
  const lesionesRecuperacion = players.filter((p) => p.status === "Lesionado").length;
  const destacados = players.filter((p) => (p.rating ?? 0) >= 4.5).length;

  return [
    { id: "al1", icon: ClipboardList, label: "Evaluaciones físicas pendientes", count: pendingEvaluations, tone: "maroon" },
    { id: "al2", icon: FileWarning, label: "Documentación pendiente", count: documentacionPendiente, tone: "gold" },
    { id: "al3", icon: CameraOff, label: "Sin foto registrada", count: sinFoto, tone: "turquoise" },
    { id: "al4", icon: HeartPulse, label: "Lesiones en recuperación", count: lesionesRecuperacion, tone: "maroon" },
    { id: "al5", icon: Star, label: "Jugadores destacados", count: destacados, tone: "green" },
  ];
}

/* ---------------------------------------------------------------------- */
/*  Estadísticas rápidas                                                   */
/* ---------------------------------------------------------------------- */

const footOptions = [
  { label: "Derecho", color: "#1f7a3d" },
  { label: "Izquierdo", color: "#17b8bd" },
  { label: "Ambidiestro", color: "#e0a723" },
] as const;

export function getFootHandedness(players: PlayerRow[]) {
  const withFoot = players.filter((p) => p.dominant_foot !== null);
  const total = withFoot.length;
  return footOptions.map(({ label, color }) => {
    const count = withFoot.filter((p) => p.dominant_foot === label).length;
    return {
      id: label.toLowerCase(),
      label,
      value: total > 0 ? Math.round((count / total) * 100) : 0,
      color,
    };
  });
}

const positionOptions = [
  { group: "Arquero", color: "#e0a723" },
  { group: "Defensa", color: "#7c3aed" },
  { group: "Volante", color: "#17b8bd" },
  { group: "Extremo", color: "#6e1b2b" },
  { group: "Delantero", color: "#1f7a3d" },
] as const;

export function getByPosition(players: PlayerRow[]) {
  return positionOptions.map(({ group, color }) => ({
    id: group.toLowerCase(),
    label: `${group}s`,
    value: players.filter((p) => p.position_group === group).length,
    color,
  }));
}

export function getByAge(players: PlayerRow[]) {
  const counts = new Map<number, number>();
  players.forEach((p) => {
    const age = calculateAge(p.birth_date);
    counts.set(age, (counts.get(age) ?? 0) + 1);
  });
  return Array.from(counts.entries())
    .sort(([a], [b]) => a - b)
    .map(([age, value]) => ({ age: String(age), value }));
}

/* ---------------------------------------------------------------------- */
/*  Dashboard principal                                                    */
/* ---------------------------------------------------------------------- */

/** KPIs del home — algunos quedan en "—" hasta tener asistencia/evaluaciones cargadas. */
export function getHomeKpis(players: PlayerRow[], upcomingMatchesCount: number): KpiCard[] {
  const total = players.length;
  const rated = players.filter((p) => p.rating !== null);
  const rendimientoPromedio =
    rated.length > 0 ? rated.reduce((sum, p) => sum + (p.rating ?? 0), 0) / rated.length : null;
  const destacados = players.filter((p) => (p.rating ?? 0) >= 4.5).length;
  const enRiesgo = players.filter((p) => p.status === "Lesionado" || p.status === "Suspendido").length;

  return [
    {
      id: "jugadores-activos",
      icon: Users,
      label: "Jugadores activos",
      value: String(total),
      delta: "Plantel Sub-15",
      trend: "flat",
      accent: "green",
      trendTone: "neutral",
    },
    {
      id: "asistencia-promedio",
      icon: UserCheck,
      label: "Asistencia promedio",
      value: "—",
      delta: "Aún sin registros de asistencia",
      trend: "flat",
      accent: "green",
      trendTone: "neutral",
    },
    {
      id: "rendimiento-promedio",
      icon: TrendingUp,
      label: "Rendimiento promedio",
      value: rendimientoPromedio !== null ? rendimientoPromedio.toFixed(1) : "—",
      delta: rendimientoPromedio !== null ? "Escala 0-5" : "Aún sin evaluaciones",
      trend: "flat",
      accent: "violet",
      trendTone: "neutral",
    },
    {
      id: "jugadores-destacados",
      icon: Star,
      label: "Jugadores destacados",
      value: String(destacados),
      delta: "Rating ≥ 4.5",
      trend: "flat",
      accent: "gold",
      trendTone: "neutral",
    },
    {
      id: "jugadores-riesgo",
      icon: PencilLine,
      label: "Jugadores en riesgo",
      value: String(enRiesgo),
      delta: enRiesgo > 0 ? "Lesionados o suspendidos" : "Ninguno",
      trend: enRiesgo > 0 ? "up" : "flat",
      accent: "maroon",
      trendTone: enRiesgo > 0 ? "maroon" : "neutral",
    },
    {
      id: "proximos-partidos",
      icon: Trophy,
      label: "Próximos partidos",
      value: String(upcomingMatchesCount),
      delta: "Categoría Sub-15",
      trend: "flat",
      accent: "turquoise",
      trendTone: "neutral",
    },
  ];
}

const statusSliceMeta: Record<PlayerRow["status"], { label: string; color: string }> = {
  Disponible: { label: "Disponibles", color: "#1f7a3d" },
  Suspendido: { label: "Suspendidos", color: "#e0a723" },
  Lesionado: { label: "Lesionados", color: "#6e1b2b" },
};

/** Estado general del plantel para el donut del home. */
export function getSquadStatus(players: PlayerRow[]): SquadStatusSlice[] {
  return (["Disponible", "Suspendido", "Lesionado"] as const).map((status) => ({
    id: status.toLowerCase(),
    label: statusSliceMeta[status].label,
    value: players.filter((p) => p.status === status).length,
    color: statusSliceMeta[status].color,
  }));
}

/** Jugadores mejor calificados, para la tabla "Jugadores destacados" del home. */
export function getTopPlayers(players: PlayerRow[], limit = 5): RosterPlayer[] {
  return [...players]
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, limit)
    .map((row) => toRosterPlayer(row));
}
