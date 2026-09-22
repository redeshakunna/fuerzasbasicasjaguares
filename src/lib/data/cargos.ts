import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/database.types";

export type CargoRow = Tables<"cargos">;

/** Catálogo de cargos/profesiones del cuerpo técnico (Entrenador Principal, Psicólogo, etc.), administrado desde Configuración. */
export async function getCargos(): Promise<CargoRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("cargos").select("*").eq("activo", true).order("nombre", { ascending: true });

  if (error) {
    console.error("getCargos() falló:", error);
    return [];
  }
  return data ?? [];
}
