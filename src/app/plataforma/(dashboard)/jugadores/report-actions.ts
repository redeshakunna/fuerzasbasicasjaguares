"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentStaffProfile } from "@/lib/data/player-profile";
import { getMonthlyStats, getPlayerReportContext, getPreviousReportTasks } from "@/lib/data/reports";
import { nextCategory } from "@/lib/data/categories";
import { generateAreaConcepts, generateMonthlyReport, generateRecommendation, generateTasks } from "@/lib/informes/report-generator";

export interface ReportActionState {
  error?: string;
  success?: boolean;
}

export interface ManualReportInput {
  technicalNotes: string;
  tacticalNotes: string;
  physicalNotes: string;
  attitudeNotes: string;
  tasks: string;
}

/** Genera (o regenera) el Informe de Evolución del mes por IA (sistema experto por reglas) — queda en Borrador para revisión. */
export async function generateReport(
  playerId: string,
  playerFirstName: string,
  period: string,
): Promise<ReportActionState> {
  const staff = await getCurrentStaffProfile();
  if (!staff) return { error: "Debes iniciar sesión para generar el informe." };

  const [stats, previousTasks, playerContext] = await Promise.all([
    getMonthlyStats(playerId, period),
    getPreviousReportTasks(playerId, period),
    getPlayerReportContext(playerId),
  ]);
  const summary = generateMonthlyReport({
    playerFirstName,
    period,
    averageScore: stats.averageScore,
    previousAverageScore: stats.previousAverageScore,
    attendancePct: stats.attendancePct,
    evaluationsCount: stats.evaluationsCount,
    coachNotes: stats.coachNotes,
  });

  const areaConcepts = generateAreaConcepts(stats.areaScores, stats.evaluationsCount);
  const tasks = generateTasks(stats.areaScores, stats.evaluationsCount);
  const recommendation = playerContext
    ? generateRecommendation({
        averageScore: stats.averageScore,
        previousAverageScore: stats.previousAverageScore,
        attendancePct: stats.attendancePct,
        evaluationsCount: stats.evaluationsCount,
        category: playerContext.category,
        performanceGroup: playerContext.performanceGroup,
        nextCategory: nextCategory(playerContext.category),
      })
    : null;

  const supabase = await createClient();
  const { error } = await supabase.from("player_reports").upsert(
    {
      player_id: playerId,
      period,
      summary,
      attendance_pct: stats.attendancePct,
      average_score: stats.averageScore,
      technical_score: stats.areaScores.technical,
      tactical_score: stats.areaScores.tactical,
      physical_score: stats.areaScores.physical,
      attitude_score: stats.areaScores.attitude,
      technical_notes: areaConcepts.technical,
      tactical_notes: areaConcepts.tactical,
      physical_notes: areaConcepts.physical,
      attitude_notes: areaConcepts.attitude,
      tasks: tasks || null,
      recommended_group: recommendation?.suggestedGroup ?? null,
      recommended_category: recommendation?.suggestedCategory ?? null,
      recommendation_note: recommendation?.note ?? null,
      status: "Borrador",
      source: "ia",
      previous_tasks: previousTasks,
    },
    { onConflict: "player_id,period" },
  );

  if (error) {
    console.error("generateReport() falló:", error);
    return { error: "No se pudo generar el informe. Intenta de nuevo." };
  }

  revalidatePath(`/plataforma/jugadores/${playerId}`);
  return { success: true };
}

/** Crea el Informe de Evolución del mes manualmente, redactado por el técnico por secciones. */
export async function createManualReport(
  playerId: string,
  period: string,
  input: ManualReportInput,
): Promise<ReportActionState> {
  const staff = await getCurrentStaffProfile();
  if (!staff) return { error: "Debes iniciar sesión para crear el informe." };

  const [stats, previousTasks] = await Promise.all([
    getMonthlyStats(playerId, period),
    getPreviousReportTasks(playerId, period),
  ]);

  const sections = [input.technicalNotes, input.tacticalNotes, input.physicalNotes, input.attitudeNotes]
    .map((s) => s.trim())
    .filter(Boolean);
  const summary = sections.length > 0 ? sections.join(" ") : "Informe manual — completa las secciones para verlo aquí.";

  const supabase = await createClient();
  const { error } = await supabase.from("player_reports").upsert(
    {
      player_id: playerId,
      period,
      summary,
      technical_notes: input.technicalNotes || null,
      tactical_notes: input.tacticalNotes || null,
      physical_notes: input.physicalNotes || null,
      attitude_notes: input.attitudeNotes || null,
      tasks: input.tasks || null,
      attendance_pct: stats.attendancePct,
      average_score: stats.averageScore,
      status: "Borrador",
      source: "manual",
      previous_tasks: previousTasks,
    },
    { onConflict: "player_id,period" },
  );

  if (error) {
    console.error("createManualReport() falló:", error);
    return { error: "No se pudo crear el informe. Intenta de nuevo." };
  }

  revalidatePath(`/plataforma/jugadores/${playerId}`);
  return { success: true };
}

export interface ReportEditableFields {
  summary?: string;
  technical_notes?: string | null;
  tactical_notes?: string | null;
  physical_notes?: string | null;
  attitude_notes?: string | null;
  comments?: string | null;
  tasks?: string | null;
  previous_tasks?: string | null;
}

/** Guarda cualquier combinación de campos editables del informe (resumen, secciones, comentarios, tareas). */
export async function updateReportFields(
  reportId: string,
  playerId: string,
  fields: ReportEditableFields,
): Promise<ReportActionState> {
  const staff = await getCurrentStaffProfile();
  if (!staff) return { error: "Debes iniciar sesión para editar el informe." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("player_reports")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", reportId);

  if (error) {
    console.error("updateReportFields() falló:", error);
    return { error: "No se pudo guardar el informe." };
  }

  revalidatePath(`/plataforma/jugadores/${playerId}`);
  return { success: true };
}

/** Marca el informe como Revisado (listo para compartir). */
export async function markReportReviewed(reportId: string, playerId: string): Promise<ReportActionState> {
  const staff = await getCurrentStaffProfile();
  if (!staff) return { error: "Debes iniciar sesión." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("player_reports")
    .update({ status: "Revisado", reviewed_by: staff.id, updated_at: new Date().toISOString() })
    .eq("id", reportId);

  if (error) {
    console.error("markReportReviewed() falló:", error);
    return { error: "No se pudo actualizar el informe." };
  }

  revalidatePath(`/plataforma/jugadores/${playerId}`);
  return { success: true };
}

/** Marca el informe como Enviado en la fecha que el técnico elija — de manejo libre, no automático. */
export async function sendReport(reportId: string, playerId: string, sendDate: string): Promise<ReportActionState> {
  const staff = await getCurrentStaffProfile();
  if (!staff) return { error: "Debes iniciar sesión." };
  if (!sendDate) return { error: "Elige una fecha de envío." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("player_reports")
    .update({
      status: "Enviado",
      send_date: sendDate,
      sent_at: new Date().toISOString(),
      sent_by: staff.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", reportId);

  if (error) {
    console.error("sendReport() falló:", error);
    return { error: "No se pudo marcar como enviado." };
  }

  revalidatePath(`/plataforma/jugadores/${playerId}`);
  return { success: true };
}
