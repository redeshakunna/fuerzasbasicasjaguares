"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentStaffProfile, getPlayerById } from "@/lib/data/player-profile";
import { composeJerseyPhoto } from "@/lib/jersey/compose-jersey-photo";
import { templateKeyForPositionGroup } from "@/lib/jersey/jersey-templates";

export interface GenerateJerseyPhotoState {
  error?: string;
  success?: boolean;
  url?: string;
}

/**
 * Server Action — genera automáticamente la foto de perfil "con camiseta"
 * de un jugador: compone su foto tipo carnet sobre la plantilla oficial
 * (campo o portero, según position_group) y la guarda en `jersey_photo_url`.
 * Restringida al súper admin, igual que el resto de la edición de jugadores.
 * Exige `image_authorization` en true — sin esa autorización del acudiente
 * no se procesa ninguna foto del jugador, ni siquiera para este montaje.
 */
export async function generateJerseyPhoto(
  playerId: string,
  _prevState: GenerateJerseyPhotoState,
  formData: FormData
): Promise<GenerateJerseyPhotoState> {
  const staff = await getCurrentStaffProfile();
  if (!staff?.isAdmin) {
    return { error: "Solo el súper admin puede generar la foto con camiseta." };
  }

  const player = await getPlayerById(playerId);
  if (!player) {
    return { error: "No se encontró el jugador." };
  }

  if (!player.image_authorization) {
    return {
      error:
        "Este jugador no tiene autorización de uso de imagen activada. Actívala en Editar información antes de generar la foto.",
    };
  }

  const photoFile = formData.get("photo");
  if (!(photoFile instanceof File) || photoFile.size === 0) {
    return { error: "Sube una foto tipo carnet (rostro visible, de frente)." };
  }
  if (!photoFile.type.startsWith("image/")) {
    return { error: "El archivo debe ser una imagen (JPG o PNG)." };
  }

  try {
    const photoBuffer = Buffer.from(await photoFile.arrayBuffer());
    const templateKey = templateKeyForPositionGroup(player.position_group);
    const composedBuffer = await composeJerseyPhoto(photoBuffer, templateKey);

    const supabase = await createClient();
    const path = `jersey-${crypto.randomUUID()}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from("player-photos")
      .upload(path, composedBuffer, { contentType: "image/jpeg", upsert: false });

    if (uploadError) {
      console.error("generateJerseyPhoto() upload falló:", uploadError);
      return { error: "No se pudo guardar la foto generada. Intenta de nuevo." };
    }

    const { data: publicUrlData } = supabase.storage.from("player-photos").getPublicUrl(path);
    const url = publicUrlData.publicUrl;

    const { error: updateError } = await supabase
      .from("players")
      .update({ jersey_photo_url: url })
      .eq("id", playerId);

    if (updateError) {
      console.error("generateJerseyPhoto() update falló:", updateError);
      return { error: "La foto se generó pero no se pudo asociar al jugador. Intenta de nuevo." };
    }

    revalidatePath(`/plataforma/jugadores/${playerId}`);
    revalidatePath("/plataforma/jugadores");
    revalidatePath("/plataforma");
    return { success: true, url };
  } catch (err) {
    console.error("generateJerseyPhoto() falló:", err);
    return { error: "No se pudo procesar la imagen. Verifica que sea una foto válida e intenta de nuevo." };
  }
}
