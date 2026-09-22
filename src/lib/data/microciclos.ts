import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/database.types";

export type MicrocicloRow = Tables<"microciclos">;

/** Microciclos (bloques de entrenamientos con un objetivo concreto) — de un ciclo, o todos si no se pasa `cicloId`. */
export async function getMicrociclos(cicloId?: string): Promise<MicrocicloRow[]> {
  const supabase = await createClient();
  let query = supabase.from("microciclos").select("*").order("start_date", { ascending: true });
  if (cicloId) query = query.eq("ciclo_id", cicloId);

  const { data, error } = await query;
  if (error) {
    console.error("getMicrociclos() falló:", error);
    return [];
  }
  return data ?? [];
}

export async function getMicrocicloById(id: string): Promise<MicrocicloRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("microciclos").select("*").eq("id", id).maybeSingle();
  if (error) {
    console.error("getMicrocicloById() falló:", error);
    return null;
  }
  return data ?? null;
}
