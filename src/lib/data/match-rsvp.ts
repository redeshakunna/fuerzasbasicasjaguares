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
  isExpired: boolean;
}

/**
 * Hora límite para responder un link de RSVP — se calcula al generar el mensaje de
 * convocatoria, no en el momento en que el jugador abre el link. Damos 3 horas de
 * margen después del silbatazo inicial (llegadas tarde, cambios de última hora) en
 * vez de cortar el link justo a la hora de citación. Colombia no tiene horario de
 * verano, así que el offset -05:00 es fijo todo el año.
 */
export function computeRsvpExpiry(activityDate: string, activityTime: string | null): string {
  const timePart = activityTime ?? "23:59:00";
  const kickoff = new Date(`${activityDate}T${timePart}-05:00`);
  const withGrace = new Date(kickoff.getTime() + 3 * 60 * 60 * 1000);
  return withGrace.toISOString();
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
    isExpired: Boolean(data.is_expired),
  };
}

export interface RsvpRosterEntry {
  playerId: string;
  playerFirstName: string;
  playerNickname: string | null;
  playerPhotoUrl: string | null;
  response: RsvpResponse | null;
  reason: string | null;
  isExpired: boolean;
}

export interface RsvpMatchRosterResult {
  activityTitle: string | null;
  activityDate: string | null;
  activityTime: string | null;
  activityLocation: string | null;
  roster: RsvpRosterEntry[];
}

/**
 * Roster público (sin sesión) de convocados de un partido, detrás de un solo link
 * compartido — el jugador toca su propio nombre en vez de recibir un link personal.
 * Pasa por `rsvp_match_roster` (SECURITY DEFINER) por la misma razón que `rsvp_lookup`.
 */
export async function getRsvpMatchRoster(matchId: string): Promise<RsvpMatchRosterResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("rsvp_match_roster", { p_match_id: matchId });

  const first = data?.[0];
  if (error || !data || !first) {
    if (error) console.error("getRsvpMatchRoster() falló:", error);
    return { activityTitle: null, activityDate: null, activityTime: null, activityLocation: null, roster: [] };
  }

  return {
    activityTitle: first.activity_title,
    activityDate: first.activity_date,
    activityTime: first.activity_time,
    activityLocation: first.activity_location,
    roster: data.map((row) => ({
      playerId: row.player_id,
      playerFirstName: row.player_first_name,
      playerNickname: row.player_nickname,
      playerPhotoUrl: row.player_photo_url,
      response: asRsvpResponse(row.response),
      reason: row.reason,
      isExpired: Boolean(row.is_expired),
    })),
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
