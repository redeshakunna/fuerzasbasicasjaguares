"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentStaffProfile } from "@/lib/data/player-profile";

export interface ReviewRequestState {
  error?: string;
  success?: boolean;
}

/** Técnico, coordinador y admin pueden revisar solicitudes de inscripción. */
async function requireReviewer() {
  const staff = await getCurrentStaffProfile();
  if (!staff || !(staff.role === "entrenador" || staff.role === "coordinador" || staff.isAdmin)) {
    return null;
  }
  return staff;
}

/**
 * Server Action — aprueba una solicitud de inscripción pública: crea el
 * jugador real en `players` (mismo criterio que `registerPlayer`) y marca
 * la solicitud como Aprobado, enlazándola al jugador creado.
 *
 * El técnico/coordinador/admin puede confirmar o ajustar el número de
 * camiseta que el jugador sugirió antes de crear el registro definitivo
 * (por eso `finalJerseyNumber` es un parámetro aparte, no el de la solicitud).
 * También debe elegir a qué grupo de desempeño de Sub-15 (A o B) entra el
 * jugador — la solicitud pública no lo pregunta, es una decisión del cuerpo
 * técnico.
 */
export async function approveRegistrationRequest(
  requestId: string,
  finalJerseyNumber: number | null,
  performanceGroup: "A" | "B"
): Promise<ReviewRequestState> {
  const staff = await requireReviewer();
  if (!staff) {
    return { error: "Solo el técnico, el coordinador o el admin pueden aprobar solicitudes." };
  }

  if (performanceGroup !== "A" && performanceGroup !== "B") {
    return { error: "Selecciona el grupo de desempeño (A o B) antes de aprobar." };
  }

  const supabase = await createClient();

  const { data: request, error: fetchError } = await supabase
    .from("player_registration_requests")
    .select("*")
    .eq("id", requestId)
    .single();

  if (fetchError || !request) {
    return { error: "No se encontró la solicitud." };
  }

  if (request.request_status !== "Pendiente") {
    return { error: "Esta solicitud ya fue revisada." };
  }

  const { data: newPlayer, error: insertError } = await supabase
    .from("players")
    .insert({
      // Deportivo
      first_name: request.first_name,
      last_name: request.last_name,
      nickname: request.nickname,
      birth_date: request.birth_date,
      position: request.position,
      position_group: request.position_group,
      category: request.category,
      performance_group: performanceGroup,
      photo_url: request.photo_url,
      height_cm: request.height_cm,
      weight_kg: request.weight_kg,
      dominant_foot: request.dominant_foot,
      jersey_number: finalJerseyNumber,
      previous_club: request.previous_club,
      years_playing: request.years_playing,

      // Personal
      document_type: request.document_type,
      document_number: request.document_number,
      birth_place: request.birth_place,
      residence_place: request.residence_place,
      address: request.address,
      school_name: request.school_name,
      school_grade: request.school_grade,
      phone: request.phone,

      // Acudiente y emergencia
      guardian_name: request.guardian_name,
      guardian_relationship: request.guardian_relationship,
      guardian_phone: request.guardian_phone,
      guardian_email: request.guardian_email,
      emergency_contact_name: request.emergency_contact_name,
      emergency_contact_phone: request.emergency_contact_phone,

      // Salud y autorizaciones
      eps_name: request.eps_name,
      blood_type: request.blood_type,
      allergies: request.allergies,
      medical_conditions: request.medical_conditions,
      medical_authorization: request.medical_authorization,
      image_authorization: request.image_authorization,
    })
    .select("id")
    .single();

  if (insertError || !newPlayer) {
    return {
      error:
        insertError?.code === "23505"
          ? "Ya existe un jugador con ese número de camiseta en la categoría Sub-15."
          : "No se pudo crear el jugador. Intenta de nuevo.",
    };
  }

  const { error: updateError } = await supabase
    .from("player_registration_requests")
    .update({
      request_status: "Aprobado",
      reviewed_by: staff.id,
      reviewed_at: new Date().toISOString(),
      created_player_id: newPlayer.id,
    })
    .eq("id", requestId);

  if (updateError) {
    console.error("approveRegistrationRequest() — jugador creado pero falló marcar la solicitud:", updateError);
    return { error: "El jugador se creó, pero no se pudo actualizar el estado de la solicitud." };
  }

  revalidatePath("/plataforma/jugadores/solicitudes");
  revalidatePath("/plataforma/jugadores");
  revalidatePath("/plataforma");
  return { success: true };
}

/** Server Action — rechaza una solicitud de inscripción, con nota opcional para el jugador/acudiente. */
export async function rejectRegistrationRequest(requestId: string, note: string | null): Promise<ReviewRequestState> {
  const staff = await requireReviewer();
  if (!staff) {
    return { error: "Solo el técnico, el coordinador o el admin pueden rechazar solicitudes." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("player_registration_requests")
    .update({
      request_status: "Rechazado",
      reviewed_by: staff.id,
      reviewed_at: new Date().toISOString(),
      review_note: note?.trim() || null,
    })
    .eq("id", requestId)
    .eq("request_status", "Pendiente")
    .select("id")
    .single();

  if (error || !data) {
    return { error: "No se pudo rechazar la solicitud (puede que ya haya sido revisada)." };
  }

  revalidatePath("/plataforma/jugadores/solicitudes");
  return { success: true };
}
