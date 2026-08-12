"use server";

import { createClient } from "@/lib/supabase/server";
import type { RsvpResponse } from "@/lib/data/match-rsvp";

export interface SubmitRsvpResult {
  error?: string;
  success?: boolean;
}

/**
 * Server Action pública (sin sesión) — el jugador confirma o avisa que no puede ir,
 * directamente desde su link personal. Pasa por la función `rsvp_respond`
 * (SECURITY DEFINER), que valida el token del lado de la base de datos.
 */
export async function submitRsvp(token: string, response: RsvpResponse, reason: string): Promise<SubmitRsvpResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("rsvp_respond", {
    p_token: token,
    p_response: response,
    p_reason: response === "No asiste" ? reason.trim() || undefined : undefined,
  });

  if (error) {
    console.error("submitRsvp() falló:", error);
    return { error: "No se pudo registrar tu respuesta. Intenta de nuevo." };
  }
  if (!data) {
    return { error: "Este enlace no es válido." };
  }

  return { success: true };
}
