"use server";

import { createClient } from "@/lib/supabase/server";
import { groupForPosition, positionOptions } from "@/lib/data/positions";
import { toTitleCase } from "@/lib/utils/text-format";
import { OTRO_COLEGIO } from "@/lib/data/colegios-monteria";
import type { Enums } from "@/lib/supabase/database.types";

export interface SubmitRegistrationState {
  error?: string;
  success?: boolean;
}

const dominantFeet: Enums<"dominant_foot">[] = ["Derecho", "Izquierdo", "Ambidiestro"];
const documentTypes = ["Registro Civil", "Tarjeta de Identidad", "Cédula de Ciudadanía"];
const bloodTypes = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];
const relationships = ["Madre", "Padre", "Tutor legal", "Abuelo(a)", "Otro"];
const positionLabels = positionOptions.map((p) => p.label);

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

/**
 * Sube la foto de la solicitud al bucket `player-photos`, bajo el prefijo
 * `solicitudes/` — el único que la política RLS de storage permite escribir
 * a usuarios anónimos (`player_photos_anon_upload_solicitudes`).
 */
async function uploadRequestPhoto(
  supabase: Awaited<ReturnType<typeof createClient>>,
  file: File
): Promise<string | null> {
  if (!file || file.size === 0) return null;

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `solicitudes/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("player-photos")
    .upload(path, file, { contentType: file.type || "image/jpeg", upsert: false });

  if (uploadError) {
    console.error("uploadRequestPhoto error:", uploadError);
    return null;
  }

  const { data } = supabase.storage.from("player-photos").getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Server Action pública (sin sesión) — recibe la solicitud de inscripción
 * que un jugador o acudiente de Sub-15 completa en /plataforma/registrojugadores.
 * No crea un jugador real: guarda todo en `player_registration_requests`,
 * pendiente de revisión y aprobación por el técnico, coordinador o admin
 * (ver `approveRegistrationRequest` en jugadores/solicitudes/actions.ts).
 *
 * El formato Título de nombres/apellidos ya se aplica en el cliente mientras
 * el usuario escribe, pero se vuelve a aplicar aquí como defensa en profundidad
 * (el formato del cliente se puede saltar).
 */
export async function submitPlayerRegistration(
  _prevState: SubmitRegistrationState,
  formData: FormData
): Promise<SubmitRegistrationState> {
  const firstNameRaw = str(formData, "first_name");
  const lastNameRaw = str(formData, "last_name");
  const birthDate = str(formData, "birth_date");
  const position = oneOf(formData, "position", positionLabels);

  if (!firstNameRaw || !lastNameRaw || !birthDate || !position) {
    return { error: "Nombres, apellidos, fecha de nacimiento y posición son obligatorios." };
  }

  const positionGroup = groupForPosition(position);
  if (!positionGroup) {
    return { error: "Selecciona una posición válida de la lista." };
  }

  const medicalAuthorization = formData.get("medical_authorization") === "true";
  const imageAuthorization = formData.get("image_authorization") === "true";
  if (!medicalAuthorization || !imageAuthorization) {
    return { error: "Debes aceptar las autorizaciones médica y de imagen para continuar." };
  }

  // Colegio: selector con listado real de Montería, con "Otro" -> texto libre.
  const schoolSelection = str(formData, "school_name");
  const schoolOther = str(formData, "school_name_other");
  const schoolName = schoolSelection === OTRO_COLEGIO ? schoolOther : schoolSelection;

  const supabase = await createClient();

  const photoFile = formData.get("photo");
  const photoUrl =
    photoFile instanceof File && photoFile.size > 0 ? await uploadRequestPhoto(supabase, photoFile) : null;

  const { error } = await supabase.from("player_registration_requests").insert({
    // Deportivo
    first_name: toTitleCase(firstNameRaw),
    last_name: toTitleCase(lastNameRaw),
    nickname: str(formData, "nickname"),
    birth_date: birthDate,
    position,
    position_group: positionGroup,
    category: "Sub-15",
    photo_url: photoUrl,
    height_cm: num(formData, "height_cm"),
    weight_kg: num(formData, "weight_kg"),
    dominant_foot: oneOf(formData, "dominant_foot", dominantFeet) as Enums<"dominant_foot"> | null,
    requested_jersey_number: num(formData, "requested_jersey_number"),
    previous_club: str(formData, "previous_club"),
    years_playing: num(formData, "years_playing"),

    // Personal
    document_type: oneOf(formData, "document_type", documentTypes),
    document_number: str(formData, "document_number"),
    birth_place: str(formData, "birth_place"),
    residence_place: str(formData, "residence_place"),
    address: str(formData, "address"),
    school_name: schoolName,
    school_grade: str(formData, "school_grade"),
    phone: str(formData, "phone"),

    // Acudiente y emergencia
    guardian_name: str(formData, "guardian_name") ? toTitleCase(str(formData, "guardian_name")!) : null,
    guardian_relationship: oneOf(formData, "guardian_relationship", relationships),
    guardian_phone: str(formData, "guardian_phone"),
    guardian_email: str(formData, "guardian_email"),
    emergency_contact_name: str(formData, "emergency_contact_name")
      ? toTitleCase(str(formData, "emergency_contact_name")!)
      : null,
    emergency_contact_phone: str(formData, "emergency_contact_phone"),

    // Salud y autorizaciones
    eps_name: str(formData, "eps_name"),
    blood_type: oneOf(formData, "blood_type", bloodTypes),
    allergies: str(formData, "allergies"),
    medical_conditions: str(formData, "medical_conditions"),
    medical_authorization: medicalAuthorization,
    image_authorization: imageAuthorization,
  });

  if (error) {
    console.error("submitPlayerRegistration() falló:", error);
    return { error: "No se pudo enviar la solicitud. Intenta de nuevo." };
  }

  return { success: true };
}
