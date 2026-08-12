"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentStaffProfile } from "@/lib/data/player-profile";
import type { AttendanceActivity } from "@/app/plataforma/(dashboard)/entrenamientos/actions";

export interface EvaluationFormState {
  error?: string;
  success?: boolean;
}

export interface QuickEvaluationInput {
  technical: number; // 0-5
  tactical: number; // 0-5
  physical: number; // 0-5
  discipline: number; // 0-5
  attitude: number; // 0-5
  notes: string;
  standout: boolean;
}

/**
 * Server Action — guarda la evaluación rápida de 5 indicadores para una actividad puntual
 * (entrenamiento o partido). Los puntajes llegan en escala 0-5 (estrellas) y se guardan en
 * 0-10 para mantener compatibilidad con el resto de la plataforma (Estado General, gráfico
 * de evolución). Reemplaza al formulario detallado de 40 habilidades — no escribe `evaluation_items`.
 */
export async function saveQuickEvaluation(
  activity: AttendanceActivity,
  playerId: string,
  input: QuickEvaluationInput,
): Promise<EvaluationFormState> {
  const staff = await getCurrentStaffProfile();
  if (!staff) return { error: "Debes iniciar sesión para guardar la evaluación." };

  const toTen = (v: number) => Math.max(0, Math.min(10, Math.round(v * 2 * 10) / 10));
  const technical = toTen(input.technical);
  const tactical = toTen(input.tactical);
  const physical = toTen(input.physical);
  const discipline = toTen(input.discipline);
  const attitude = toTen(input.attitude);
  const overall = Math.round(((technical + tactical + physical + discipline + attitude) / 5) * 10) / 10;

  const supabase = await createClient();
  const { error } = await supabase.from("evaluations").upsert(
    {
      player_id: playerId,
      training_id: activity.kind === "entrenamiento" ? activity.id : null,
      match_id: activity.kind === "partido" ? activity.id : null,
      evaluator_id: staff.id,
      technical_score: technical,
      tactical_score: tactical,
      physical_score: physical,
      discipline_score: discipline,
      attitude_score: attitude,
      overall_score: overall,
      status: "Completada",
      notes: input.notes || null,
      is_standout: input.standout,
    },
    { onConflict: activity.kind === "entrenamiento" ? "player_id,training_id" : "player_id,match_id" },
  );

  if (error) {
    console.error("saveQuickEvaluation() falló:", error);
    return { error: "No se pudo guardar la evaluación. Intenta de nuevo." };
  }

  revalidatePath("/plataforma/evaluaciones");
  revalidatePath(`/plataforma/jugadores/${playerId}`);
  revalidatePath("/plataforma/jugadores");
  return { success: true };
}
