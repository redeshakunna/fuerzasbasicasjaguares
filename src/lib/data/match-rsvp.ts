import { createClient } from "@/lib/supabase/server";

export type RsvpResponse = "Confirmado" | "No asiste";

export interface RsvpLookupResult {
  playerFirstName: string;
  playerNickname: string | null;
  playerPhotoUrl: string | null;
  activityKind: "entrenamiento" | "partido";
  activityTitle: string | null;
  activityDate: string | null;
  activityTime: string | null;
  activityLocation: string | null;
  currentResponse: RsvpResponse | null;
  currentReason: string | null;
}

function asRsvpResponse(value: string | null): RsvpResponse | null {
  return value === "Confirmado" || value === "No asiste" ? value : null;
}

/**
 * Lookup público (sin sesión) de la info personal detrás de un token de confirmación —
 * pasa por la función `rsvp_lookup` (SECURITY DEFINER) para no exponer RLS pública
 * sobre `players`/`matches`/`match_rsvp`.
 */
export async function lookupRsvp(token: string): Promise<RsvpLookupResult | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("rsvp_lookup", { p_token: token }).maybeSingle();

  if (error || !data) {
    if (error) console.error("lookupRsvp() falló:", error);
    return null;
  }

  return {
    playerFirstName: data.player_first_name,
    playerNickname: data.player_nickname,
    playerPhotoUrl: data.player_photo_url,
    activityKind: data.activity_kind === "partido" ? "partido" : "entrenamiento",
    activityTitle: data.activity_title,
    activityDate: data.activity_date,
    activityTime: data.activity_time,
    activityLocation: data.activity_location,
    currentResponse: asRsvpResponse(data.current_response),
    currentReason: data.current_reason,
  };
}

export interface RsvpStatus {
  response: RsvpResponse | null;
  reason: string | null;
  respondedAt: string | null;
}

/**
 * Respuestas de confirmación previa (RSVP) de los convocados de un partido — es solo
 * una pista para el cuerpo técnico ("dijo que sí va"), nunca reemplaza la asistencia
 * real que se marca el día de la actividad.
 */
export async function getRsvpStatusForMatch(matchId: string): Promise<Map<string, RsvpStatus>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("match_rsvp")
    .select("player_id, response, reason, responded_at")
    .eq("match_id", matchId);

  if (error) {
    console.error("getRsvpStatusForMatch() falló:", error);
    return new Map();
  }

  return new Map(
    (data ?? []).map((row) => [
      row.player_id,
      { response: asRsvpResponse(row.response), reason: row.reason, respondedAt: row.responded_at },
    ]),
  );
}
