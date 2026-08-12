"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentStaffProfile } from "@/lib/data/player-profile";

export interface DocumentActionState {
  error?: string;
  success?: boolean;
}

const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

/** Sube un documento (PDF/JPG/PNG) a la hoja de vida del jugador. */
export async function uploadPlayerDocument(
  _prevState: DocumentActionState,
  formData: FormData,
): Promise<DocumentActionState> {
  const staff = await getCurrentStaffProfile();
  if (!staff) return { error: "Debes iniciar sesión para subir documentos." };

  const playerId = String(formData.get("playerId") ?? "");
  const category = String(formData.get("category") ?? "Otro");
  const file = formData.get("file");

  if (!playerId) return { error: "Falta el jugador." };
  if (!(file instanceof File) || file.size === 0) return { error: "Selecciona un archivo." };
  if (file.size > MAX_BYTES) return { error: "El archivo pesa más de 10 MB." };
  if (!ALLOWED_TYPES.includes(file.type)) return { error: "Solo se aceptan PDF, JPG o PNG." };

  const supabase = await createClient();
  const extension = file.name.split(".").pop()?.toLowerCase() || "pdf";
  const path = `${playerId}/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("player-documents")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    console.error("uploadPlayerDocument() falló:", uploadError);
    return { error: "No se pudo subir el archivo. Intenta de nuevo." };
  }

  const { error: insertError } = await supabase.from("player_documents").insert({
    player_id: playerId,
    file_name: file.name,
    file_path: path,
    file_type: file.type,
    category,
    size_bytes: file.size,
    uploaded_by: staff.id,
  });

  if (insertError) {
    console.error("uploadPlayerDocument() insert falló:", insertError);
    await supabase.storage.from("player-documents").remove([path]);
    return { error: "No se pudo guardar el documento. Intenta de nuevo." };
  }

  revalidatePath(`/plataforma/jugadores/${playerId}`);
  return { success: true };
}

/** Elimina un documento — solo súper admin, igual que Editar información. */
export async function deletePlayerDocument(
  documentId: string,
  filePath: string,
  playerId: string,
): Promise<DocumentActionState> {
  const staff = await getCurrentStaffProfile();
  if (!staff?.isAdmin) return { error: "Solo un administrador puede eliminar documentos." };

  const supabase = await createClient();
  const { error: storageError } = await supabase.storage.from("player-documents").remove([filePath]);
  if (storageError) {
    console.error("deletePlayerDocument() storage falló:", storageError);
  }

  const { error } = await supabase.from("player_documents").delete().eq("id", documentId);
  if (error) {
    console.error("deletePlayerDocument() falló:", error);
    return { error: "No se pudo eliminar el documento." };
  }

  revalidatePath(`/plataforma/jugadores/${playerId}`);
  return { success: true };
}
