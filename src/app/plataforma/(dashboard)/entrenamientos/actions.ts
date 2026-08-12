"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentStaffProfile } from "@/lib/data/player-profile";
import { evaluationSkills, averageForCategory, overallAverage } from "@/lib/data/evaluation-skills";
import { blankSessionPlan, generateTrainingSession } from "@/lib/training/session-generator";
import type { SessionGenerationInput, SessionPlan } from "@/lib/training/session-types";
import type { Enums, Json } from "@/lib/supabase/database.types";

export interface TrainingFormState {
  error?: string;
  success?: boolean;
}

function str(formData: FormData, key: string): string | null {
  const value = String(formData.get(key) ?? "").trim();
  return value ? value : null;
}

/** Server Action — crea una sesión de entrenamiento (categoría Sub-15, MVP). */
export async function createTraining(
  _prevState: TrainingFormState,
  formData: FormData
): Promise<TrainingFormState> {
  const staff = await getCurrentStaffProfile();
  if (!staff) {
    return { error: "Debes iniciar sesión para crear una sesión." };
  }

  const title = str(formData, "title");
  const sessionDate = str(formData, "session_date");
  const startTime = str(formData, "start_time");

  if (!title || !sessionDate || !startTime) {
    return { error: "Título, fecha y hora de inicio son obligatorios." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("trainings").insert({
    title,
    category: "Sub-15",
    session_date: sessionDate,
    start_time: startTime,
    end_time: str(formData, "end_time"),
    location: str(formData, "location"),
    notes: str(formData, "notes"),
    coach_id: staff.id,
  });

  if (error) {
    console.error("createTraining() falló:", error);
    return { error: "No se pudo crear la sesión. Intenta de nuevo." };
  }

  revalidatePath("/plataforma/entrenamientos");
  revalidatePath("/plataforma");
  return { success: true };
}

export interface SaveEvaluationState {
  error?: string;
  success?: boolean;
}

/**
 * Server Action — guarda (o actualiza) la evaluación de un jugador para una
 * sesión de entrenamiento puntual. Un jugador solo tiene una evaluación por
 * sesión (índice único parcial `player_id + training_id`): si ya existía,
 * se sobrescribe junto con sus ítems por habilidad.
 */
export async function saveEvaluation(trainingId: string, playerId: string, formData: FormData) {
  const staff = await getCurrentStaffProfile();
  if (!staff) {
    return { error: "Debes iniciar sesión para guardar la evaluación." };
  }

  const scores: Record<string, number> = {};
  for (const skill of evaluationSkills) {
    const raw = formData.get(skill.id);
    if (raw === null || raw === "") continue;
    const value = Number(raw);
    if (!Number.isFinite(value)) continue;
    scores[skill.id] = Math.max(0, Math.min(10, Math.round(value * 10) / 10));
  }

  const technical = averageForCategory(scores, "Técnica");
  const tactical = averageForCategory(scores, "Táctica");
  const physical = averageForCategory(scores, "Física");
  const mental = averageForCategory(scores, "Mental");
  const overall = overallAverage([technical, tactical, physical, mental]);

  const supabase = await createClient();

  const { data: evaluation, error: upsertError } = await supabase
    .from("evaluations")
    .upsert(
      {
        player_id: playerId,
        training_id: trainingId,
        evaluator_id: staff.id,
        technical_score: technical,
        tactical_score: tactical,
        physical_score: physical,
        mental_score: mental,
        overall_score: overall,
        status: "Completada",
        notes: str(formData, "notes"),
      },
      { onConflict: "player_id,training_id" }
    )
    .select("id")
    .single();

  if (upsertError || !evaluation) {
    console.error("saveEvaluation() upsert falló:", upsertError);
    return { error: "No se pudo guardar la evaluación. Intenta de nuevo." };
  }

  const { error: deleteError } = await supabase
    .from("evaluation_items")
    .delete()
    .eq("evaluation_id", evaluation.id);

  if (deleteError) {
    console.error("saveEvaluation() delete items falló:", deleteError);
    return { error: "No se pudo actualizar el detalle de la evaluación." };
  }

  const items = Object.entries(scores).map(([skillId, score]) => ({
    evaluation_id: evaluation.id,
    skill_id: skillId,
    score,
  }));

  if (items.length > 0) {
    const { error: insertError } = await supabase.from("evaluation_items").insert(items);
    if (insertError) {
      console.error("saveEvaluation() insert items falló:", insertError);
      return { error: "No se pudo guardar el detalle de la evaluación." };
    }
  }

  revalidatePath(`/plataforma/entrenamientos/${trainingId}`);
  revalidatePath(`/plataforma/jugadores/${playerId}`);
  revalidatePath("/plataforma/jugadores");

  return { success: true };
}

/** Server Action de formulario — guarda la evaluación y navega al siguiente jugador de la sesión. */
export async function saveEvaluationAndGoTo(
  trainingId: string,
  playerId: string,
  nextPath: string,
  _prevState: SaveEvaluationState,
  formData: FormData
): Promise<SaveEvaluationState> {
  const result = await saveEvaluation(trainingId, playerId, formData);
  if (result.error) return result;
  redirect(nextPath);
}

function addMinutesToTime(time: string, minutes: number): string {
  const [hStr, mStr] = time.split(":");
  const total = (Number(hStr) * 60 + Number(mStr ?? "0") + minutes + 24 * 60) % (24 * 60);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export interface GenerateTrainingInput extends SessionGenerationInput {
  mode: Enums<"training_creation_mode">;
}

export interface GenerateTrainingResult {
  error?: string;
  id?: string;
}

/**
 * Server Action — punto de llegada del Wizard. En modo IA/plantilla arma la
 * sesión con el motor basado en metodologías reales; en modo manual crea un
 * esqueleto vacío para completar en el editor. El "motor de IA" hoy es un
 * sistema experto por catálogo (ver session-generator.ts) — el contrato de
 * datos (`SessionPlan`) ya queda listo para que, el día que haya una API key
 * de un modelo de lenguaje, se sustituya sin tocar el resto de la app.
 */
export async function generateTraining(input: GenerateTrainingInput): Promise<GenerateTrainingResult> {
  const staff = await getCurrentStaffProfile();
  if (!staff) return { error: "Debes iniciar sesión para crear una sesión." };

  if (!input.sessionDate || !input.startTime || !input.objectives || input.objectives.length === 0) {
    return { error: "Faltan datos obligatorios del wizard." };
  }

  const session = input.mode === "manual" ? blankSessionPlan(input) : generateTrainingSession(input);
  const endTime = addMinutesToTime(input.startTime, input.durationMin);
  const objectivesLabel = input.objectives.join(", ");
  const title =
    input.objectives.length > 1
      ? `${input.objectives[0]} +${input.objectives.length - 1} — ${input.category}`
      : `${objectivesLabel} — ${input.category}`;
  const notes = input.injuryNote?.trim() ? `Jugadores lesionados: ${input.injuryNote.trim()}` : null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trainings")
    .insert({
      title,
      category: input.category,
      session_date: input.sessionDate,
      start_time: input.startTime,
      end_time: endTime,
      location: input.location || null,
      notes,
      coach_id: staff.id,
      responsible_role: input.responsibleRole || null,
      creation_mode: input.mode,
      objective: objectivesLabel,
      intensity: input.intensity,
      players_count: input.playersCount,
      materials: input.materials,
      special_conditions: input.specialConditions,
      session: session as unknown as Json,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("generateTraining() falló:", error);
    return { error: "No se pudo crear la sesión. Intenta de nuevo." };
  }

  revalidatePath("/plataforma/entrenamientos");
  revalidatePath("/plataforma");
  return { id: data.id };
}

export interface UpdateSessionState {
  error?: string;
  success?: boolean;
}

/** Server Action — guarda ediciones manuales sobre una sesión (generada o creada desde cero). */
export async function updateTrainingSession(trainingId: string, session: SessionPlan): Promise<UpdateSessionState> {
  const staff = await getCurrentStaffProfile();
  if (!staff) return { error: "Debes iniciar sesión." };

  const supabase = await createClient();
  const { error } = await supabase.from("trainings").update({ session: session as unknown as Json }).eq("id", trainingId);

  if (error) {
    console.error("updateTrainingSession() falló:", error);
    return { error: "No se pudo guardar la sesión." };
  }

  revalidatePath(`/plataforma/entrenamientos/${trainingId}`);
  revalidatePath("/plataforma/entrenamientos");
  return { success: true };
}

export interface DuplicateTrainingResult {
  error?: string;
  id?: string;
}

/** Server Action — duplica una sesión completa (misma configuración) en una nueva fecha. */
export async function duplicateTraining(trainingId: string, newDate: string): Promise<DuplicateTrainingResult> {
  const staff = await getCurrentStaffProfile();
  if (!staff) return { error: "Debes iniciar sesión." };
  if (!newDate) return { error: "Selecciona la fecha de la nueva sesión." };

  const supabase = await createClient();
  const { data: original, error: fetchError } = await supabase
    .from("trainings")
    .select("*")
    .eq("id", trainingId)
    .single();

  if (fetchError || !original) {
    return { error: "No se encontró la sesión original." };
  }

  const { data, error } = await supabase
    .from("trainings")
    .insert({
      title: original.title,
      category: original.category,
      session_date: newDate,
      start_time: original.start_time,
      end_time: original.end_time,
      location: original.location,
      notes: original.notes,
      coach_id: staff.id,
      responsible_role: original.responsible_role,
      creation_mode: original.creation_mode,
      objective: original.objective,
      intensity: original.intensity,
      players_count: original.players_count,
      materials: original.materials,
      special_conditions: original.special_conditions,
      session: original.session,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("duplicateTraining() falló:", error);
    return { error: "No se pudo duplicar la sesión." };
  }

  revalidatePath("/plataforma/entrenamientos");
  return { id: data.id };
}

export interface DeleteTrainingState {
  error?: string;
  success?: boolean;
}

/**
 * Server Action — elimina una sesión de entrenamiento. La asistencia asociada
 * se borra en cascada (FK `attendance.training_id`); las evaluaciones ya
 * guardadas se conservan pero pierden el vínculo a la sesión (FK con
 * `on delete set null`), para no perder el histórico de rendimiento del jugador.
 */
export async function deleteTraining(trainingId: string): Promise<DeleteTrainingState> {
  const staff = await getCurrentStaffProfile();
  if (!staff) return { error: "Debes iniciar sesión." };

  const supabase = await createClient();
  const { error } = await supabase.from("trainings").delete().eq("id", trainingId);

  if (error) {
    console.error("deleteTraining() falló:", error);
    return { error: "No se pudo eliminar la sesión." };
  }

  revalidatePath("/plataforma/entrenamientos");
  revalidatePath("/plataforma");
  return { success: true };
}

export interface AttendanceRecord {
  playerId: string;
  status: Enums<"attendance_status">;
}

export interface SaveAttendanceState {
  error?: string;
  success?: boolean;
}

export type AttendanceActivity = { kind: "entrenamiento"; id: string } | { kind: "partido"; id: string };

/** Server Action — guarda la asistencia del plantel para una actividad (entrenamiento o partido), upsert por jugador+actividad. */
export async function saveAttendance(activity: AttendanceActivity, records: AttendanceRecord[]): Promise<SaveAttendanceState> {
  const staff = await getCurrentStaffProfile();
  if (!staff) return { error: "Debes iniciar sesión." };
  if (records.length === 0) return { success: true };

  const supabase = await createClient();
  const isTraining = activity.kind === "entrenamiento";
  const { error } = await supabase.from("attendance").upsert(
    records.map((r) => ({
      training_id: isTraining ? activity.id : null,
      match_id: isTraining ? null : activity.id,
      player_id: r.playerId,
      status: r.status,
    })),
    { onConflict: isTraining ? "training_id,player_id" : "match_id,player_id" }
  );

  if (error) {
    console.error("saveAttendance() falló:", error);
    return { error: "No se pudo guardar la asistencia." };
  }

  revalidatePath(isTraining ? `/plataforma/entrenamientos/${activity.id}` : `/plataforma/partidos/${activity.id}`);
  revalidatePath("/plataforma/asistencia");
  return { success: true };
}

/**
 * Server Action — el técnico cierra/finaliza la asistencia de una actividad de forma manual.
 * A partir de este momento la asistencia queda bloqueada (no editable), con registro de
 * quién y cuándo la cerró. Si el plazo automático de 24h ya la había cerrado, este cierre
 * manual la reemplaza y deja el nombre real de quien la revisó.
 */
export async function closeAttendance(activity: AttendanceActivity, note?: string): Promise<SaveAttendanceState> {
  const staff = await getCurrentStaffProfile();
  if (!staff) return { error: "Debes iniciar sesión." };

  const isTraining = activity.kind === "entrenamiento";
  const supabase = await createClient();
  const { error } = await supabase.from("attendance_closures").upsert(
    {
      training_id: isTraining ? activity.id : null,
      match_id: isTraining ? null : activity.id,
      closed_by: staff.id,
      reason: "manual",
      note: note?.trim() || null,
      closed_at: new Date().toISOString(),
    },
    { onConflict: isTraining ? "training_id" : "match_id" },
  );

  if (error) {
    console.error("closeAttendance() falló:", error);
    return { error: "No se pudo cerrar la asistencia." };
  }

  revalidatePath("/plataforma/asistencia");
  return { success: true };
}
