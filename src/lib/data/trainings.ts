import { createClient } from "@/lib/supabase/server";
export type { TrainingRow } from "./player-profile";
import type { TrainingRow } from "./player-profile";

const DEFAULT_CATEGORY = "Sub-15";

/** Todas las sesiones de entrenamiento de la categoría, más recientes primero. */
export async function getTrainings(category?: string): Promise<TrainingRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trainings")
    .select("*")
    .eq("category", category ?? DEFAULT_CATEGORY)
    .order("session_date", { ascending: false })
    .order("start_time", { ascending: false });

  if (error) {
    console.error("getTrainings() falló:", error);
    return [];
  }
  return data ?? [];
}

/** Una sesión de entrenamiento por id. */
export async function getTrainingById(id: string): Promise<TrainingRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("trainings").select("*").eq("id", id).maybeSingle();

  if (error) {
    console.error("getTrainingById() falló:", error);
    return null;
  }
  return data;
}
