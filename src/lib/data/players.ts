import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/database.types";

export type PlayerRow = Tables<"players">;

/**
 * Trae el plantel completo, ordenado alfabéticamente. Si Supabase falla
 * de forma transitoria, no tumba la página: registra el error y devuelve
 * una lista vacía (el usuario ve un estado vacío en vez de un error 500).
 */
export async function getPlayers(category?: string): Promise<PlayerRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from("players")
    .select("*")
    .order("last_name", { ascending: true })
    .order("first_name", { ascending: true });

  if (category) query = query.eq("category", category);

  const { data, error } = await query;

  if (error) {
    console.error("getPlayers() falló:", error);
    return [];
  }
  return data ?? [];
}

/** Cuenta evaluaciones físicas con estado "Pendiente" (para la alerta del plantel). */
export async function getPendingEvaluationsCount(): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("evaluations")
    .select("id", { count: "exact", head: true })
    .eq("status", "Pendiente");

  if (error) {
    console.error("getPendingEvaluationsCount() falló:", error);
    return 0;
  }
  return count ?? 0;
}
