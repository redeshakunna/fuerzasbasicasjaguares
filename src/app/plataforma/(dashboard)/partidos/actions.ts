"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentStaffProfile } from "@/lib/data/player-profile";
import { getSiteUrl } from "@/lib/site-url";
import { buildMatchCallupMessage } from "@/lib/data/match-whatsapp";
import { computeRsvpExpiry } from "@/lib/data/match-rsvp";
import { sortRosterForCallup } from "@/lib/data/players-stats";
import type { Enums } from "@/lib/supabase/database.types";

export interface MatchFormState {
  error?: string;
  success?: boolean;
}

function str(formData: FormData, key: string): string | null {
  const value = String(formData.get(key) ?? "").trim();
  return value ? value : null;
}

function intOrNull(formData: FormData, key: string): number | null {
  const value = String(formData.get(key) ?? "").trim();
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

const matchStatuses: Enums<"match_status">[] = ["Confirmado", "Por confirmar"];
const callStatuses: Enums<"call_status">[] = ["Pendiente", "Confirmado", "No asistirá", "Lesionado", "Suspendido"];

/** Server Action — crea un partido. */
export async function createMatch(_prevState: MatchFormState, formData: FormData): Promise<MatchFormState> {
  const staff = await getCurrentStaffProfile();
  if (!staff) return { error: "Debes iniciar sesión para crear un partido." };

  const category = str(formData, "category");
  const opponent = str(formData, "opponent");
  const matchDate = str(formData, "match_date");

  if (!category || !opponent || !matchDate) {
    return { error: "Categoría, rival y fecha son obligatorios." };
  }

  const status = str(formData, "status");
  const supabase = await createClient();
  const { error } = await supabase.from("matches").insert({
    category,
    opponent,
    match_date: matchDate,
    match_time: str(formData, "match_time"),
    location: str(formData, "location"),
    competition: str(formData, "competition"),
    is_home: formData.get("is_home") === "true",
    status: status && matchStatuses.includes(status as Enums<"match_status">) ? (status as Enums<"match_status">) : "Por confirmar",
  });

  if (error) {
    console.error("createMatch() falló:", error);
    return { error: "No se pudo crear el partido. Intenta de nuevo." };
  }

  revalidatePath("/plataforma/partidos");
  revalidatePath("/plataforma");
  return { success: true };
}

/** Server Action — actualiza un partido (resultado, estado, datos generales). */
export async function updateMatch(matchId: string, _prevState: MatchFormState, formData: FormData): Promise<MatchFormState> {
  const staff = await getCurrentStaffProfile();
  if (!staff) return { error: "Debes iniciar sesión." };

  const category = str(formData, "category");
  const opponent = str(formData, "opponent");
  const matchDate = str(formData, "match_date");

  if (!category || !opponent || !matchDate) {
    return { error: "Categoría, rival y fecha son obligatorios." };
  }

  const status = str(formData, "status");
  const supabase = await createClient();
  const { error } = await supabase
    .from("matches")
    .update({
      category,
      opponent,
      match_date: matchDate,
      match_time: str(formData, "match_time"),
      location: str(formData, "location"),
      competition: str(formData, "competition"),
      is_home: formData.get("is_home") === "true",
      result: str(formData, "result"),
      our_score: intOrNull(formData, "our_score"),
      opponent_score: intOrNull(formData, "opponent_score"),
      status: status && matchStatuses.includes(status as Enums<"match_status">) ? (status as Enums<"match_status">) : "Por confirmar",
    })
    .eq("id", matchId);

  if (error) {
    console.error("updateMatch() falló:", error);
    return { error: "No se pudo guardar el partido." };
  }

  revalidatePath(`/plataforma/partidos/${matchId}`);
  revalidatePath("/plataforma/partidos");
  revalidatePath("/plataforma");
  return { success: true };
}

export interface CallupRecordInput {
  player_id: string;
  call_status: Enums<"call_status">;
  minutes_played: number | null;
  entered_minute: number | null;
  goals: number;
  yellow_cards: number;
  red_card: boolean;
  notes: string | null;
}

/** Server Action — guarda la convocatoria completa de un partido (upsert masivo por jugador). */
export async function saveCallups(matchId: string, records: CallupRecordInput[]): Promise<MatchFormState> {
  const staff = await getCurrentStaffProfile();
  if (!staff) return { error: "Debes iniciar sesión." };
  if (records.length === 0) return { success: true };

  const supabase = await createClient();
  const { error } = await supabase.from("match_callups").upsert(
    records.map((r) => ({
      match_id: matchId,
      player_id: r.player_id,
      call_status: callStatuses.includes(r.call_status) ? r.call_status : "Pendiente",
      minutes_played: r.minutes_played,
      entered_minute: r.entered_minute,
      goals: r.goals,
      yellow_cards: r.yellow_cards,
      red_card: r.red_card,
      notes: r.notes,
      updated_at: new Date().toISOString(),
    })),
    { onConflict: "match_id,player_id" },
  );

  if (error) {
    console.error("saveCallups() falló:", error);
    return { error: "No se pudo guardar la convocatoria. Intenta de nuevo." };
  }

  revalidatePath(`/plataforma/partidos/${matchId}`);
  revalidatePath("/plataforma/partidos");
  revalidatePath("/plataforma/jugadores");
  return { success: true };
}

export interface CallupWhatsAppResult {
  message?: string;
  error?: string;
}

/**
 * Server Action — arma el mensaje de convocatoria con el link personal de confirmación
 * de cada convocado. Lee la convocatoria guardada directamente de la base (no del estado
 * del cliente, que puede estar desactualizado) y crea/reutiliza el token de cada jugador
 * de forma idempotente — volver a generar el mensaje no rompe links ya compartidos.
 */
export async function buildCallupWhatsAppMessage(matchId: string): Promise<CallupWhatsAppResult> {
  const staff = await getCurrentStaffProfile();
  if (!staff) return { error: "Debes iniciar sesión." };

  const supabase = await createClient();

  const { data: match, error: matchError } = await supabase.from("matches").select("*").eq("id", matchId).maybeSingle();
  if (matchError || !match) {
    console.error("buildCallupWhatsAppMessage() no encontró el partido:", matchError);
    return { error: "No se encontró el partido." };
  }

  const { data: callups, error: callupsError } = await supabase
    .from("match_callups")
    .select("player_id")
    .eq("match_id", matchId)
    .eq("call_status", "Confirmado");

  if (callupsError) {
    console.error("buildCallupWhatsAppMessage() falló leyendo convocatoria:", callupsError);
    return { error: "No se pudo leer la convocatoria guardada." };
  }

  const playerIds = (callups ?? []).map((c) => c.player_id);

  if (playerIds.length === 0) {
    return { message: buildMatchCallupMessage({ match, confirmedPlayers: [] }) };
  }

  const { data: players, error: playersError } = await supabase.from("players").select("*").in("id", playerIds);
  if (playersError) {
    console.error("buildCallupWhatsAppMessage() falló leyendo jugadores:", playersError);
    return { error: "No se pudo leer el plantel convocado." };
  }

  const expiresAt = computeRsvpExpiry(match.match_date, match.match_time);
  const { error: upsertError } = await supabase.from("match_rsvp").upsert(
    playerIds.map((playerId) => ({ match_id: matchId, player_id: playerId, expires_at: expiresAt })),
    { onConflict: "match_id,player_id", ignoreDuplicates: true },
  );
  if (upsertError) {
    console.error("buildCallupWhatsAppMessage() falló creando tokens rsvp:", upsertError);
  }

  const { data: rsvpRows, error: rsvpError } = await supabase
    .from("match_rsvp")
    .select("player_id, token")
    .eq("match_id", matchId)
    .in("player_id", playerIds);
  if (rsvpError) {
    console.error("buildCallupWhatsAppMessage() falló leyendo tokens rsvp:", rsvpError);
  }

  const siteUrl = await getSiteUrl();
  const rsvpLinks: Record<string, string> = {};
  for (const row of rsvpRows ?? []) {
    rsvpLinks[row.player_id] = `${siteUrl}/confirmar/${row.token}`;
  }

  const confirmedPlayers = sortRosterForCallup(players ?? []);
  const message = buildMatchCallupMessage({ match, confirmedPlayers, rsvpLinks });
  return { message };
}

/** Server Action — registra el resultado final de un partido (marcador + competencia), opcional y no bloqueante. */
export async function registerMatchResult(matchId: string, _prevState: MatchFormState, formData: FormData): Promise<MatchFormState> {
  const staff = await getCurrentStaffProfile();
  if (!staff) return { error: "Debes iniciar sesión." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("matches")
    .update({
      our_score: intOrNull(formData, "our_score"),
      opponent_score: intOrNull(formData, "opponent_score"),
      competition: str(formData, "competition"),
      status: "Confirmado",
    })
    .eq("id", matchId);

  if (error) {
    console.error("registerMatchResult() falló:", error);
    return { error: "No se pudo registrar el resultado." };
  }

  revalidatePath(`/plataforma/partidos/${matchId}`);
  revalidatePath("/plataforma/partidos");
  revalidatePath("/plataforma");
  return { success: true };
}
