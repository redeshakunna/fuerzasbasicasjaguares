import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/database.types";

export type StaffProfile = Tables<"profiles">;

/** Cuerpo técnico — perfiles de staff deportivo (entrenador/coordinador/directivo/admin), sin padres. */
export async function getCoachingStaff(): Promise<StaffProfile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .in("role", ["entrenador", "coordinador", "directivo", "admin"])
    .order("full_name", { ascending: true });

  if (error) {
    console.error("getCoachingStaff() falló:", error);
    return [];
  }
  return data ?? [];
}

/**
 * Entrenador principal y coordinador deportivo — MVP con un solo titular por
 * rol, usados para las firmas de los informes imprimibles. Si en el futuro
 * hay más de uno por categoría, esto debe evolucionar a una relación real.
 */
export async function getPrimaryStaffNames(): Promise<{ coachName: string | null; coordinatorName: string | null }> {
  const staff = await getCoachingStaff();
  const coach = staff.find((s) => s.role === "entrenador");
  const coordinator = staff.find((s) => s.role === "coordinador");
  return { coachName: coach?.full_name ?? null, coordinatorName: coordinator?.full_name ?? null };
}

/** Nombre de un miembro del staff por id — usado para mostrar "Entrenador: X" en sesiones. */
export async function getStaffNameById(id: string | null): Promise<string | null> {
  if (!id) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.from("profiles").select("full_name").eq("id", id).maybeSingle();

  if (error || !data) return null;
  return data.full_name;
}
