import { createClient } from "@/lib/supabase/server";
import type { Enums, Tables } from "@/lib/supabase/database.types";

export type EvaluationRow = Tables<"evaluations">;
export type EvaluationItemRow = Tables<"evaluation_items">;
export type TrainingRow = Tables<"trainings">;

/** Trae un jugador por id. `null` si no existe o si la consulta falla. */
export async function getPlayerById(id: string): Promise<Tables<"players"> | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("players").select("*").eq("id", id).maybeSingle();

  if (error) {
    console.error("getPlayerById() falló:", error);
    return null;
  }
  return data;
}

/** Historial de evaluaciones de un jugador, más reciente primero. */
export async function getPlayerEvaluations(playerId: string, limit = 12): Promise<EvaluationRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("evaluations")
    .select("*")
    .eq("player_id", playerId)
    .order("evaluation_date", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getPlayerEvaluations() falló:", error);
    return [];
  }
  return data ?? [];
}

/** Próximo entrenamiento programado para la categoría del jugador. */
export async function getNextTrainingForCategory(category: string): Promise<TrainingRow | null> {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("trainings")
    .select("*")
    .eq("category", category)
    .gte("session_date", today)
    .order("session_date", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("getNextTrainingForCategory() falló:", error);
    return null;
  }
  return data;
}

export interface CurrentStaffProfile {
  id: string;
  fullName: string;
  role: Enums<"user_role">;
  isAdmin: boolean;
  onboardedAt: string | null;
}

/**
 * Perfil del usuario autenticado (staff). Usado para decidir, en el servidor,
 * si puede ver/usar controles de edición — solo `role === "admin"` puede.
 */
export async function getCurrentStaffProfile(): Promise<CurrentStaffProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, role, onboarded_at")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) {
    console.error("getCurrentStaffProfile() falló:", error);
    return null;
  }

  return {
    id: data.id,
    fullName: data.full_name,
    role: data.role,
    isAdmin: data.role === "admin",
    onboardedAt: data.onboarded_at,
  };
}

/**
 * Aterrizaje por rol tras el login. Hoy entrenador/coordinador/directivo/admin
 * comparten el mismo Dashboard operativo — la Vista de coordinador/director
 * (siguiente bloque) cambiará únicamente este mapeo, no el resto del flujo de
 * login. `padre` no tiene vista todavía: no debe aterrizar en el panel de staff.
 */
export function getLandingPathForRole(role: Enums<"user_role">): string | null {
  if (role === "padre") return null;
  return "/plataforma";
}
