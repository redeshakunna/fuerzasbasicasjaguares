import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/database.types";

export type TrainingTemplateRow = Tables<"training_templates">;

/** Plantillas de sesión disponibles para el modo "Usar plantilla" del Wizard. */
export async function getTrainingTemplates(): Promise<TrainingTemplateRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("training_templates")
    .select("*")
    .order("title", { ascending: true });

  if (error) {
    console.error("getTrainingTemplates() falló:", error);
    return [];
  }
  return data ?? [];
}
