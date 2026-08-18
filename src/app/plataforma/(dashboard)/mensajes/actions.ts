"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentStaffProfile } from "@/lib/data/player-profile";

export interface AddReplacementState {
  error?: string;
  success?: boolean;
}

/**
 * Server Action — al elegir un candidato de reemplazo en Mensajería, además
 * de mandarle el WhatsApp, lo confirma directamente en la convocatoria real
 * del partido (no hay que ir a repetir el paso en Partidos). Mismo patrón de
 * saveCallups() en partidos/actions.ts — upsert por match_id + player_id, así
 * que si el jugador ya tenía una fila en la convocatoria (por ejemplo
 * "Pendiente") queda sobrescrita a "Confirmado" en vez de duplicarse.
 */
export async function addReplacementToCallup(matchId: string, playerId: string): Promise<AddReplacementState> {
  const staff = await getCurrentStaffProfile();
  if (!staff) return { error: "Debes iniciar sesión." };

  const supabase = await createClient();
  const { error } = await supabase.from("match_callups").upsert(
    {
      match_id: matchId,
      player_id: playerId,
      call_status: "Confirmado",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "match_id,player_id" }
  );

  if (error) {
    console.error("addReplacementToCallup() falló:", error);
    return { error: "No se pudo actualizar la convocatoria. Intenta de nuevo." };
  }

  revalidatePath(`/plataforma/partidos/${matchId}`);
  revalidatePath("/plataforma/partidos");
  revalidatePath("/plataforma/mensajes");
  revalidatePath("/plataforma/jugadores");
  return { success: true };
}
