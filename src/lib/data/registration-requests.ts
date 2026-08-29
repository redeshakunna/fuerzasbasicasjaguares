import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/database.types";

export type RegistrationRequest = Tables<"player_registration_requests">;

/** Cantidad de solicitudes de inscripción pendientes — para el badge del sidebar. */
export async function getPendingRegistrationRequestsCount(): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("player_registration_requests")
    .select("id", { count: "exact", head: true })
    .eq("request_status", "Pendiente");

  if (error) {
    console.error("getPendingRegistrationRequestsCount() falló:", error);
    return 0;
  }
  return count ?? 0;
}

/** Lista de solicitudes de inscripción, filtradas por estado — más recientes primero. */
export async function getRegistrationRequests(
  status: "Pendiente" | "Aprobado" | "Rechazado"
): Promise<RegistrationRequest[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("player_registration_requests")
    .select("*")
    .eq("request_status", status)
    .order("submitted_at", { ascending: false });

  if (error) {
    console.error("getRegistrationRequests() falló:", error);
    return [];
  }
  return data ?? [];
}

/** Una solicitud puntual, con toda la hoja de vida enviada. */
export async function getRegistrationRequestById(id: string): Promise<RegistrationRequest | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("player_registration_requests")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("getRegistrationRequestById() falló:", error);
    return null;
  }
  return data;
}
