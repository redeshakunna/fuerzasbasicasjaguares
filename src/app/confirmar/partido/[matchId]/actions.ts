"use server";

import { createClient } from "@/lib/supabase/server";
import type { RsvpResponse } from "@/lib/data/match-rsvp";

export interface SubmitRsvpResult {
  error?: string;
  success?: boolean;
}

/**
 * Server Action pública (sin sesión) — variante del flujo de un solo link: el jugador
 * se identifica tocando su nombre en el roster, así que acá el permiso pasa por
 * (match_id, player_id) en vez de un token individual. Ver `rsvp_respond_by_match`.
 */
export async function submitRsvpForPlayer(
  matchId: string,
  playerId: string,
  response: RsvpResponse,
  reason: string,
): Promise<SubmitRsvpResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("rsvp_respond_by_match", {
    p_match_id: matchId,
    p_player_id: playerId,
    p_response: response,
    p_reason: response === "No asiste" ? reason.trim() || undefined : undefined,
  });

  if (error) {
    console.error("submitRsvpForPlayer() falló:", error);
    return { error: "No se pudo registrar tu respuesta. Intenta de nuevo." };
  }
  if (!data) {
    return { error: "Este enlace ya venció o no es válido." };
  }

  return { success: true };
}
