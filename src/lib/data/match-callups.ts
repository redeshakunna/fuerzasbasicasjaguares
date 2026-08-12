import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/database.types";
import type { MatchRow } from "./matches";

export type CallupRow = Tables<"match_callups">;

/** Convocatorias de varios partidos a la vez, agrupadas por match_id. */
export async function getCallupsForMatches(matchIds: string[]): Promise<Record<string, CallupRow[]>> {
  if (matchIds.length === 0) return {};
  const supabase = await createClient();
  const { data, error } = await supabase.from("match_callups").select("*").in("match_id", matchIds);

  if (error) {
    console.error("getCallupsForMatches() falló:", error);
    return {};
  }

  const grouped: Record<string, CallupRow[]> = {};
  for (const row of data ?? []) {
    (grouped[row.match_id] ??= []).push(row);
  }
  return grouped;
}

/** Convocatoria de un solo partido. */
export async function getCallupsForMatch(matchId: string): Promise<CallupRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("match_callups").select("*").eq("match_id", matchId);

  if (error) {
    console.error("getCallupsForMatch() falló:", error);
    return [];
  }
  return data ?? [];
}

export interface PlayerCallupHistoryEntry extends CallupRow {
  match: MatchRow;
}

/**
 * Historial de convocatorias/participación de un jugador — alimenta automáticamente
 * su perfil sin depender de que existan estadísticas registradas.
 */
export async function getPlayerCallupHistory(playerId: string, limit = 8): Promise<PlayerCallupHistoryEntry[]> {
  const supabase = await createClient();
  const { data: callups, error } = await supabase
    .from("match_callups")
    .select("*")
    .eq("player_id", playerId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getPlayerCallupHistory() falló:", error);
    return [];
  }
  if (!callups || callups.length === 0) return [];

  const matchIds = callups.map((c) => c.match_id);
  const { data: matches, error: matchError } = await supabase.from("matches").select("*").in("id", matchIds);

  if (matchError) {
    console.error("getPlayerCallupHistory() (matches) falló:", matchError);
    return [];
  }

  const matchById = new Map((matches ?? []).map((m) => [m.id, m]));

  return callups
    .map((c) => {
      const match = matchById.get(c.match_id);
      return match ? { ...c, match } : null;
    })
    .filter((entry): entry is PlayerCallupHistoryEntry => entry !== null)
    .sort((a, b) => b.match.match_date.localeCompare(a.match.match_date));
}
