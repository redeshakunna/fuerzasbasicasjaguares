import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/database.types";

export type CicloRow = Tables<"ciclos">;

/** Ciclos de trabajo (Pretemporada, Competición, etc.) — de una temporada, o todos si no se pasa `temporadaId`. */
export async function getCiclos(temporadaId?: string): Promise<CicloRow[]> {
  const supabase = await createClient();
  let query = supabase.from("ciclos").select("*").order("start_date", { ascending: true });
  if (temporadaId) query = query.eq("temporada_id", temporadaId);

  const { data, error } = await query;
  if (error) {
    console.error("getCiclos() falló:", error);
    return [];
  }
  return data ?? [];
}

export async function getCicloById(id: string): Promise<CicloRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("ciclos").select("*").eq("id", id).maybeSingle();
  if (error) {
    console.error("getCicloById() falló:", error);
    return null;
  }
  return data ?? null;
}
