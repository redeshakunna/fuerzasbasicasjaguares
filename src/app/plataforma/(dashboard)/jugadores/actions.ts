"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { groupForPosition } from "@/lib/data/positions";
import { getCurrentStaffProfile } from "@/lib/data/player-profile";
import { categories, defaultCategory } from "@/lib/data/categories";
import type { Enums } from "@/lib/supabase/database.types";

export interface RegisterPlayerState {
  error?: string;
  success?: boolean;
}

const dominantFeet: Enums<"dominant_foot">[] = ["Derecho", "Izquierdo", "Ambidiestro"];
const documentTypes = ["Registro Civil", "Tarjeta de Identidad", "Cédula de Ciudadanía"];
const bloodTypes = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];
const relationships = ["Madre", "Padre", "Tutor legal", "Abuelo(a)", "Otro"];
const playerStatuses: Enums<"player_status">[] = ["Disponible", "Suspendido", "Lesionado"];
const documentStatuses: Enums<"document_status">[] = ["Completo", "Pendiente"];

function str(formData: FormData, key: string): string | null {
  const value = String(formData.get(key) ?? "").trim();
  return value ? value : null;
}

function num(formData: FormData, key: string): number | null {
  const value = String(formData.get(key) ?? "").trim();
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function oneOf(formData: FormData, key: string, allowed: string[]): string | null {
  const value = str(formData, key);
  return value && allowed.includes(value) ? value : null;
}

/** Sube la foto del jugador al bucket `player-photos` y devuelve su URL pública. */
async function uploadPlayerPhoto(
  supabase: Awaited<ReturnType<typeof createClient>>,
  file: File
): Promise<string | null> {
  if (!file || file.size === 0) return null;

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("player-photos")
    .upload(path, file, { contentType: file.type || "image/jpeg", upsert: false });

  if (uploadError) {
    console.error("uploadPlayerPhoto error:", uploadError);
    return null;
  }

  const { data } = supabase.storage.from("player-photos").getPublicUrl(path);
  return data.publicUrl;
}

/** Server Action — registra la hoja de vida deportiva completa de un jugador. */
export async function registerPlayer(
  _prevState: RegisterPlayerState,
  formData: FormData
): Promise<RegisterPlayerState> {
  const firstName = str(formData, "first_name");
  const lastName = str(formData, "last_name");
  const birthDate = str(formData, "birth_date");
  const position = str(formData, "position");

  if (!firstName || !lastName || !birthDate || !position) {
    return { error: "Nombres, apellidos, fecha de nacimiento y posición son obligatorios." };
  }

  const positionGroup = groupForPosition(position);
  if (!positionGroup) {
    return { error: "Selecciona una posición válida de la lista." };
  }

  const supabase = await createClient();

  const photoFile = formData.get("photo");
  const photoUrl =
    photoFile instanceof File && photoFile.size > 0 ? await uploadPlayerPhoto(supabase, photoFile) : null;

  const category = oneOf(formData, "category", [...categories]) ?? defaultCategory;

  const { error } = await supabase.from("players").insert({
    // Deportivo
    first_name: firstName,
    last_name: lastName,
    nickname: str(formData, "nickname"),
    birth_date: birthDate,
    position,
    position_group: positionGroup,
    category,
    photo_url: photoUrl,
    height_cm: num(formData, "height_cm"),
    weight_kg: num(formData, "weight_kg"),
    dominant_foot: oneOf(formData, "dominant_foot", dominantFeet) as Enums<"dominant_foot"> | null,
    jersey_number: num(formData, "jersey_number"),
    previous_club: str(formData, "previous_club"),
    years_playing: num(formData, "years_playing"),

    // Personal
    document_type: oneOf(formData, "document_type", documentTypes),
    document_number: str(formData, "document_number"),
    birth_place: str(formData, "birth_place"),
    residence_place: str(formData, "residence_place"),
    address: str(formData, "address"),
    school_name: str(formData, "school_name"),
    school_grade: str(formData, "school_grade"),
    phone: str(formData, "phone"),

    // Acudiente y emergencia
    guardian_name: str(formData, "guardian_name"),
    guardian_relationship: oneOf(formData, "guardian_relationship", relationships),
    guardian_phone: str(formData, "guardian_phone"),
    guardian_email: str(formData, "guardian_email"),
    emergency_contact_name: str(formData, "emergency_contact_name"),
    emergency_contact_phone: str(formData, "emergency_contact_phone"),

    // Salud y autorizaciones
    eps_name: str(formData, "eps_name"),
    blood_type: oneOf(formData, "blood_type", bloodTypes),
    allergies: str(formData, "allergies"),
    medical_conditions: str(formData, "medical_conditions"),
    medical_authorization: formData.get("medical_authorization") === "true",
    image_authorization: formData.get("image_authorization") === "true",
  });

  if (error) {
    return {
      error:
        error.code === "23505"
          ? "Ya existe un jugador con ese número de camiseta en la categoría Sub-15."
          : "No se pudo registrar el jugador. Intenta de nuevo.",
    };
  }

  revalidatePath("/plataforma/jugadores");
  revalidatePath("/plataforma");
  return { success: true };
}

/**
 * Server Action — edita la hoja de vida de un jugador ya existente.
 * Restringida al super admin: la UI solo muestra el botón "Editar información"
 * si `isAdmin` es true, pero la restricción real está aquí (y reforzada por
 * la política RLS `players_update_admin_only`, que rechazaría el UPDATE de
 * todas formas aunque alguien intentara saltarse la UI).
 */
export async function updatePlayer(
  playerId: string,
  _prevState: RegisterPlayerState,
  formData: FormData
): Promise<RegisterPlayerState> {
  const staff = await getCurrentStaffProfile();
  if (!staff?.isAdmin) {
    return { error: "Solo el super admin puede editar la información del jugador." };
  }

  const firstName = str(formData, "first_name");
  const lastName = str(formData, "last_name");
  const birthDate = str(formData, "birth_date");
  const position = str(formData, "position");

  if (!firstName || !lastName || !birthDate || !position) {
    return { error: "Nombres, apellidos, fecha de nacimiento y posición son obligatorios." };
  }

  const positionGroup = groupForPosition(position);
  if (!positionGroup) {
    return { error: "Selecciona una posición válida de la lista." };
  }

  const supabase = await createClient();

  const photoFile = formData.get("photo");
  const newPhotoUrl =
    photoFile instanceof File && photoFile.size > 0 ? await uploadPlayerPhoto(supabase, photoFile) : null;

  const rating = num(formData, "rating");

  const { error } = await supabase
    .from("players")
    .update({
      // Deportivo
      first_name: firstName,
      last_name: lastName,
      nickname: str(formData, "nickname"),
      birth_date: birthDate,
      position,
      position_group: positionGroup,
      category: oneOf(formData, "category", [...categories]) ?? defaultCategory,
      ...(newPhotoUrl ? { photo_url: newPhotoUrl } : {}),
      height_cm: num(formData, "height_cm"),
      weight_kg: num(formData, "weight_kg"),
      dominant_foot: oneOf(formData, "dominant_foot", dominantFeet) as Enums<"dominant_foot"> | null,
      jersey_number: num(formData, "jersey_number"),
      previous_club: str(formData, "previous_club"),
      years_playing: num(formData, "years_playing"),
      rating: rating !== null ? Math.max(0, Math.min(5, rating)) : null,
      status: oneOf(formData, "status", playerStatuses) as Enums<"player_status"> | null ?? "Disponible",
      documents_status:
        (oneOf(formData, "documents_status", documentStatuses) as Enums<"document_status"> | null) ?? "Pendiente",

      // Personal
      document_type: oneOf(formData, "document_type", documentTypes),
      document_number: str(formData, "document_number"),
      birth_place: str(formData, "birth_place"),
      residence_place: str(formData, "residence_place"),
      address: str(formData, "address"),
      school_name: str(formData, "school_name"),
      school_grade: str(formData, "school_grade"),
      phone: str(formData, "phone"),

      // Acudiente y emergencia
      guardian_name: str(formData, "guardian_name"),
      guardian_relationship: oneOf(formData, "guardian_relationship", relationships),
      guardian_phone: str(formData, "guardian_phone"),
      guardian_email: str(formData, "guardian_email"),
      emergency_contact_name: str(formData, "emergency_contact_name"),
      emergency_contact_phone: str(formData, "emergency_contact_phone"),

      // Salud y autorizaciones
      eps_name: str(formData, "eps_name"),
      blood_type: oneOf(formData, "blood_type", bloodTypes),
      allergies: str(formData, "allergies"),
      medical_conditions: str(formData, "medical_conditions"),
      medical_authorization: formData.get("medical_authorization") === "true",
      image_authorization: formData.get("image_authorization") === "true",
    })
    .eq("id", playerId);

  if (error) {
    return {
      error:
        error.code === "23505"
          ? "Ya existe un jugador con ese número de camiseta en la categoría Sub-15."
          : "No se pudo guardar la edición. Intenta de nuevo.",
    };
  }

  revalidatePath(`/plataforma/jugadores/${playerId}`);
  revalidatePath("/plataforma/jugadores");
  revalidatePath("/plataforma");
  return { success: true };
}

export interface SetPerformanceGroupState {
  error?: string;
  success?: boolean;
}

/**
 * Server Action — cambia la categoría de desempeño (A/B) de un jugador.
 * Excepción explícita a la regla de "solo súper admin edita jugadores":
 * el técnico (entrenador) también puede usar este control rápido, porque
 * es quien evalúa en cancha día a día. Todo lo demás del jugador sigue
 * siendo exclusivo del súper admin. La función RPC `set_player_performance_group`
 * hace su propia verificación de rol en la base de datos (defensa en profundidad).
 */
export async function setPerformanceGroup(
  playerId: string,
  group: "A" | "B"
): Promise<SetPerformanceGroupState> {
  const staff = await getCurrentStaffProfile();
  if (!staff || !(staff.role === "entrenador" || staff.isAdmin)) {
    return { error: "Solo el técnico o el súper admin pueden cambiar la categoría de desempeño." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("set_player_performance_group", {
    p_player_id: playerId,
    p_group: group,
  });

  if (error) {
    console.error("setPerformanceGroup() falló:", error);
    return { error: "No se pudo actualizar la categoría de desempeño." };
  }

  revalidatePath(`/plataforma/jugadores/${playerId}`);
  revalidatePath("/plataforma/jugadores");
  return { success: true };
}

/** Server Action — marca/desmarca manualmente si el jugador está listo para promoción a la siguiente categoría. Solo súper admin. */
export async function setPromotionReady(playerId: string, ready: boolean): Promise<SetPerformanceGroupState> {
  const staff = await getCurrentStaffProfile();
  if (!staff?.isAdmin) {
    return { error: "Solo el súper admin puede marcar la promoción de categoría." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("players").update({ promotion_ready: ready }).eq("id", playerId);

  if (error) {
    console.error("setPromotionReady() falló:", error);
    return { error: "No se pudo actualizar el estado de promoción." };
  }

  revalidatePath(`/plataforma/jugadores/${playerId}`);
  revalidatePath("/plataforma/jugadores");
  return { success: true };
}
