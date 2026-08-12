import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/database.types";

export type AcademiaRow = Tables<"academias">;
export type TemporadaRow = Tables<"temporadas">;

/** Única academia activa hoy — la fundación de multi-tenancy ya existe en el esquema. */
export async function getPrimaryAcademia(): Promise<AcademiaRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("academias").select("*").order("created_at", { ascending: true }).limit(1).maybeSingle();
  if (error) {
    console.error("getPrimaryAcademia() falló:", error);
    return null;
  }
  return data ?? null;
}

export async function getTemporadas(): Promise<TemporadaRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("temporadas").select("*").order("start_date", { ascending: false });
  if (error) {
    console.error("getTemporadas() falló:", error);
    return [];
  }
  return data ?? [];
}
