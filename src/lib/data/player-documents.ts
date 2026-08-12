import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/database.types";

export type PlayerDocumentRow = Tables<"player_documents">;

export interface PlayerDocumentWithUrl extends PlayerDocumentRow {
  signedUrl: string | null;
}

const SIGNED_URL_TTL_SECONDS = 60 * 60; // 1 hora — suficiente para ver/descargar en la sesión actual

/** Documentos del jugador (consentimientos, certificados, etc.) con enlace firmado temporal para ver/descargar. */
export async function getPlayerDocuments(playerId: string): Promise<PlayerDocumentWithUrl[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("player_documents")
    .select("*")
    .eq("player_id", playerId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("getPlayerDocuments() falló:", error);
    return [];
  }

  const withUrls = await Promise.all(
    data.map(async (doc) => {
      const { data: signed } = await supabase.storage
        .from("player-documents")
        .createSignedUrl(doc.file_path, SIGNED_URL_TTL_SECONDS);
      return { ...doc, signedUrl: signed?.signedUrl ?? null };
    }),
  );

  return withUrls;
}
