import type { Enums } from "@/lib/supabase/database.types";
import type { MatchRow } from "./matches";
import type { CallupRow } from "./match-callups";

export type MatchOutcome = "Programado" | "Ganado" | "Perdido" | "Empatado";

const monthShort = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const dayNames = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

/** Resultado derivado de un partido a partir del marcador — nunca se guarda, siempre se calcula. */
export function matchOutcome(match: Pick<MatchRow, "our_score" | "opponent_score">): MatchOutcome {
  if (match.our_score === null || match.opponent_score === null) return "Programado";
  if (match.our_score > match.opponent_score) return "Ganado";
  if (match.our_score < match.opponent_score) return "Perdido";
  return "Empatado";
}

export const outcomeDotClass: Record<MatchOutcome, string> = {
  Programado: "bg-jaguar-turquoise-500",
  Ganado: "bg-jaguar-green-600",
  Perdido: "bg-jaguar-maroon-500",
  Empatado: "bg-jaguar-gold-500",
};

export const outcomeBadgeTone: Record<MatchOutcome, "green" | "turquoise" | "maroon" | "gold"> = {
  Programado: "turquoise",
  Ganado: "green",
  Perdido: "maroon",
  Empatado: "gold",
};

export const callStatusTone: Record<Enums<"call_status">, "green" | "gold" | "maroon" | "neutral"> = {
  Pendiente: "gold",
  Confirmado: "green",
  "No asistirá": "neutral",
  Lesionado: "maroon",
  Suspendido: "maroon",
};

export interface SeasonStats {
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  effectiveness: number | null;
}

/** Estadísticas de temporada — siempre calculables (aunque devuelvan ceros/null sin partidos jugados). */
export function computeSeasonStats(matches: MatchRow[]): SeasonStats {
  const played = matches.filter((m) => m.our_score !== null && m.opponent_score !== null);
  const wins = played.filter((m) => matchOutcome(m) === "Ganado").length;
  const draws = played.filter((m) => matchOutcome(m) === "Empatado").length;
  const losses = played.filter((m) => matchOutcome(m) === "Perdido").length;
  const goalsFor = played.reduce((sum, m) => sum + (m.our_score ?? 0), 0);
  const goalsAgainst = played.reduce((sum, m) => sum + (m.opponent_score ?? 0), 0);

  return {
    played: played.length,
    wins,
    draws,
    losses,
    goalsFor,
    goalsAgainst,
    goalDifference: goalsFor - goalsAgainst,
    effectiveness: played.length > 0 ? Math.round((wins / played.length) * 100) : null,
  };
}

/** Texto de participación de un jugador en un partido — siempre opcional, nunca bloqueante. */
export function formatParticipation(c: Pick<CallupRow, "call_status" | "minutes_played" | "entered_minute">): string {
  if (c.call_status !== "Confirmado") return c.call_status;
  if (c.entered_minute !== null) return `Ingresó al minuto ${c.entered_minute}`;
  if (c.minutes_played !== null) return `Jugó ${c.minutes_played} minutos`;
  return "Convocado, sin minutos registrados";
}

export function formatMatchDateShort(value: string): string {
  const parts = value.split("-");
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  return `${d} de ${monthShort[(m ?? 1) - 1]}`;
}

export function formatMatchDateLong(value: string): string {
  const parts = value.split("-");
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  const date = new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
  const dayName = dayNames[date.getDay()];
  const capitalized = dayName ? dayName[0]?.toUpperCase() + dayName.slice(1) : "";
  return `${capitalized}, ${d} de ${monthShort[(m ?? 1) - 1]} de ${y}`;
}

export function formatMatchTime12h(value: string | null): string {
  if (!value) return "Hora por definir";
  const [hStr, mStr] = value.split(":");
  const h = Number(hStr);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${mStr ?? "00"} ${period}`;
}

/** Etiqueta corta día+hora, usada en agenda/calendario. */
export function formatMatchDateTime(match: Pick<MatchRow, "match_date" | "match_time">): string {
  return `${formatMatchDateShort(match.match_date)} · ${formatMatchTime12h(match.match_time)}`;
}
