"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentStaffProfile } from "@/lib/data/player-profile";
import { getPlayers } from "@/lib/data/players";
import { getCategoryMonthlyStats } from "@/lib/data/group-reports";
import { generateGroupReport as buildGroupSummary } from "@/lib/informes/report-generator";
import { generateReport } from "@/app/plataforma/(dashboard)/jugadores/report-actions";

export interface InformesActionState {
  error?: string;
  success?: boolean;
  generatedCount?: number;
}

/** Genera el informe individual (IA) de cada jugador de la categoría que aún no tenga informe para el período — nunca sobreescribe uno existente. */
export async function generateBulkPlayerReports(category: string, period: string): Promise<InformesActionState> {
  const staff = await getCurrentStaffProfile();
  if (!staff) return { error: "Debes iniciar sesión para generar informes." };

  const roster = await getPlayers(category);
  if (roster.length === 0) return { error: "No hay jugadores registrados en esta categoría." };

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("player_reports")
    .select("player_id")
    .eq("period", period)
    .in(
      "player_id",
      roster.map((p) => p.id),
    );

  const existingIds = new Set((existing ?? []).map((r) => r.player_id));
  const pending = roster.filter((p) => !existingIds.has(p.id));

  let generatedCount = 0;
  for (const player of pending) {
    const result = await generateReport(player.id, player.first_name, period);
    if (!result.error) generatedCount += 1;
  }

  revalidatePath("/plataforma/informes");
  revalidatePath("/plataforma/jugadores");
  return { success: true, generatedCount };
}

/** Genera (o regenera) el informe grupal de la categoría — resumen agregado, sin exponer notas individuales. */
export async function generateGroupReport(category: string, period: string): Promise<InformesActionState> {
  const staff = await getCurrentStaffProfile();
  if (!staff) return { error: "Debes iniciar sesión para generar el informe grupal." };

  const stats = await getCategoryMonthlyStats(category, period);
  const summary = buildGroupSummary({
    category,
    period,
    averageScore: stats.averageScore,
    previousAverageScore: stats.previousAverageScore,
    attendancePct: stats.attendancePct,
    evaluationsCount: stats.evaluationsCount,
    playerCount: stats.playerCount,
    standoutNames: stats.standoutNames,
  });

  const supabase = await createClient();
  const { error } = await supabase.from("group_reports").upsert(
    {
      category,
      period,
      summary,
      average_score: stats.averageScore,
      technical_score: stats.areaScores.technical,
      tactical_score: stats.areaScores.tactical,
      physical_score: stats.areaScores.physical,
      attitude_score: stats.areaScores.attitude,
      attendance_pct: stats.attendancePct,
      player_count: stats.playerCount,
      standout_players: stats.standoutNames.join(", ") || null,
      status: "Borrador",
      source: "ia",
    },
    { onConflict: "category,period" },
  );

  if (error) {
    console.error("generateGroupReport() falló:", error);
    return { error: "No se pudo generar el informe grupal." };
  }

  revalidatePath("/plataforma/informes");
  return { success: true };
}

export interface GroupReportEditableFields {
  summary?: string;
  comments?: string | null;
}

/** Guarda el resumen/comentarios editados del informe grupal. */
export async function updateGroupReportFields(reportId: string, fields: GroupReportEditableFields): Promise<InformesActionState> {
  const staff = await getCurrentStaffProfile();
  if (!staff) return { error: "Debes iniciar sesión para editar el informe." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("group_reports")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", reportId);

  if (error) {
    console.error("updateGroupReportFields() falló:", error);
    return { error: "No se pudo guardar el informe grupal." };
  }

  revalidatePath("/plataforma/informes");
  return { success: true };
}

/** Marca el informe grupal como Revisado (listo para compartir). */
export async function markGroupReportReviewed(reportId: string): Promise<InformesActionState> {
  const staff = await getCurrentStaffProfile();
  if (!staff) return { error: "Debes iniciar sesión." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("group_reports")
    .update({ status: "Revisado", reviewed_by: staff.id, updated_at: new Date().toISOString() })
    .eq("id", reportId);

  if (error) {
    console.error("markGroupReportReviewed() falló:", error);
    return { error: "No se pudo actualizar el informe grupal." };
  }

  revalidatePath("/plataforma/informes");
  return { success: true };
}

/** Marca el informe grupal como Enviado en la fecha que el técnico elija. */
export async function sendGroupReport(reportId: string, sendDate: string): Promise<InformesActionState> {
  const staff = await getCurrentStaffProfile();
  if (!staff) return { error: "Debes iniciar sesión." };
  if (!sendDate) return { error: "Elige una fecha de envío." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("group_reports")
    .update({
      status: "Enviado",
      send_date: sendDate,
      sent_at: new Date().toISOString(),
      sent_by: staff.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", reportId);

  if (error) {
    console.error("sendGroupReport() falló:", error);
    return { error: "No se pudo marcar como enviado." };
  }

  revalidatePath("/plataforma/informes");
  return { success: true };
}

/** Sube (o reemplaza) la foto de portada de una categoría — solo administradores. */
export async function uploadCategoryPhoto(category: string, formData: FormData): Promise<InformesActionState> {
  const staff = await getCurrentStaffProfile();
  if (!staff?.isAdmin) return { error: "Solo un administrador puede cambiar la foto de la categoría." };

  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) return { error: "Selecciona una imagen." };

  const supabase = await createClient();
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${category.toLowerCase().replace(/\s+/g, "-")}.${extension}`;

  const { error: uploadError } = await supabase.storage.from("category-photos").upload(path, file, {
    contentType: file.type || "image/jpeg",
    upsert: true,
  });

  if (uploadError) {
    console.error("uploadCategoryPhoto() falló:", uploadError);
    return { error: "No se pudo subir la foto." };
  }

  const { data } = supabase.storage.from("category-photos").getPublicUrl(path);
  const publicUrl = `${data.publicUrl}?v=${Date.now()}`;

  const { error } = await supabase
    .from("category_photos")
    .upsert({ category, photo_url: publicUrl, updated_by: staff.id, updated_at: new Date().toISOString() }, { onConflict: "category" });

  if (error) {
    console.error("uploadCategoryPhoto() upsert falló:", error);
    return { error: "No se pudo guardar la foto." };
  }

  revalidatePath("/plataforma/informes");
  return { success: true };
}
