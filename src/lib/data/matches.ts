import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/database.types";

export type MatchRow = Tables<"matches">;

/** Todos los partidos de la categoría, más recientes primero. */
export async function getMatches(category?: string): Promise<MatchRow[]> {
  const supabase = await createClient();
  let query = supabase.from("matches").select("*").order("match_date", { ascending: false });
  if (category) query = query.eq("category", category);

  const { data, error } = await query;
  if (error) {
    console.error("getMatches() falló:", error);
    return [];
  }
  return data ?? [];
}

/** Un partido por id. */
export async function getMatchById(id: string): Promise<MatchRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("matches").select("*").eq("id", id).maybeSingle();
  if (error) {
    console.error("getMatchById() falló:", error);
    return null;
  }
  return data;
}

/**
 * Partidos próximos (fecha de hoy en adelante), en cualquier estado —
 * usados en el home público para el calendario informativo. Ordenados por
 * fecha/hora, el más próximo primero.
 */
export async function getUpcomingMatches(limit = 20): Promise<MatchRow[]> {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .gte("match_date", today)
    .order("match_date", { ascending: true })
    .order("match_time", { ascending: true, nullsFirst: false })
    .limit(limit);

  if (error) {
    console.error("getUpcomingMatches() falló:", error);
    return [];
  }
  return data ?? [];
}
