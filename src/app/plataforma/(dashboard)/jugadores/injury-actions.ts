"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentStaffProfile } from "@/lib/data/player-profile";
import type { InjurySeverity } from "@/lib/data/injuries";

export interface InjuryActionState {
  error?: string;
  success?: boolean;
}

export interface RegisterInjuryInput {
  injuryType: string;
  severity: InjurySeverity;
  startDate: string;
  expectedRecoveryDate: string | null;
  notes: string | null;
}

const severities: InjurySeverity[] = ["Leve", "Moderada", "Severa"];

/**
 * Registra una lesión nueva y pone al jugador en estado "Lesionado" — el
 * mismo estado que ya se usaba en el roster, ahora respaldado por un
 * historial real en vez de ser solo una etiqueta.
 */
export async function registrarLesion(playerId: string, input: RegisterInjuryInput): Promise<InjuryActionState> {
  const staff = await getCurrentStaffProfile();
  if (!staff) return { error: "Debes iniciar sesión para registrar una lesión." };

  const injuryType = input.injuryType.trim();
  if (!injuryType) return { error: "Describe el tipo de lesión." };
  if (!severities.includes(input.severity)) return { error: "Selecciona una gravedad válida." };
  if (!input.startDate) return { error: "La fecha de inicio es obligatoria." };

  const supabase = await createClient();

  const { error: injuryError } = await supabase.from("player_injuries").insert({
    player_id: playerId,
    injury_type: injuryType,
    severity: input.severity,
    start_date: input.startDate,
    expected_recovery_date: input.expectedRecoveryDate,
    notes: input.notes,
    created_by: staff.id,
  });

  if (injuryError) {
    console.error("registrarLesion() falló:", injuryError);
    return { error: "No se pudo registrar la lesión. Intenta de nuevo." };
  }

  const { error: statusError } = await supabase
    .from("players")
    .update({ status: "Lesionado", updated_at: new Date().toISOString() })
    .eq("id", playerId);

  if (statusError) {
    console.error("registrarLesion() — falló al actualizar status:", statusError);
    // La lesión ya quedó guardada; el estado se puede ajustar manualmente después.
  }

  revalidatePath(`/plataforma/jugadores/${playerId}`);
  revalidatePath("/plataforma/jugadores");
  return { success: true };
}

/** Marca una lesión como recuperada y regresa al jugador a estado "Disponible". */
export async function marcarRecuperado(injuryId: string, playerId: string): Promise<InjuryActionState> {
  const staff = await getCurrentStaffProfile();
  if (!staff) return { error: "Debes iniciar sesión." };

  const supabase = await createClient();

  const { error: injuryError } = await supabase
    .from("player_injuries")
    .update({ recovered_at: new Date().toISOString().slice(0, 10), updated_at: new Date().toISOString() })
    .eq("id", injuryId);

  if (injuryError) {
    console.error("marcarRecuperado() falló:", injuryError);
    return { error: "No se pudo actualizar la lesión." };
  }

  const { error: statusError } = await supabase
    .from("players")
    .update({ status: "Disponible", updated_at: new Date().toISOString() })
    .eq("id", playerId);

  if (statusError) {
    console.error("marcarRecuperado() — falló al actualizar status:", statusError);
  }

  revalidatePath(`/plataforma/jugadores/${playerId}`);
  revalidatePath("/plataforma/jugadores");
  return { success: true };
}
