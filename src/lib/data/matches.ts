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
