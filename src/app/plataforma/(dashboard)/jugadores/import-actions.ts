"use server";

import * as XLSX from "xlsx";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentStaffProfile } from "@/lib/data/player-profile";
import { MATCH_COLUMN, rowToPatch } from "@/lib/data/players-template";
import type { TablesUpdate } from "@/lib/supabase/database.types";

export interface ImportPlayersResult {
  error?: string;
  success?: boolean;
  updated?: number;
  unchanged?: number;
  notFound?: string[];
}

/**
 * Server Action — importa el Excel exportado (y editado) desde "Exportar".
 * Reglas de seguridad exigidas por el club:
 *  1. Nunca crea jugadores nuevos — una fila cuyo documento no coincide con
 *     ningún jugador existente se reporta en `notFound` y se ignora.
 *  2. Solo actualiza los campos con valor en la celda; una celda vacía deja
 *     ese campo tal cual está en la base (no la borra).
 *  3. Restringido al súper admin, igual que updatePlayer() — reforzado por
 *     la política RLS `players_update_admin_only`.
 */
export async function importPlayers(
  _prevState: ImportPlayersResult,
  formData: FormData
): Promise<ImportPlayersResult> {
  const staff = await getCurrentStaffProfile();
  if (!staff?.isAdmin) {
    return { error: "Solo el súper admin puede importar cambios de jugadores." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Selecciona el archivo Excel exportado para importar." };
  }

  let rows: Record<string, unknown>[];
  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const firstSheet = workbook.SheetNames[0];
    const sheet = firstSheet ? workbook.Sheets[firstSheet] : undefined;
    if (!sheet) return { error: "El archivo no tiene hojas con datos." };
    rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  } catch (err) {
    console.error("importPlayers: no se pudo leer el archivo:", err);
    return { error: "No se pudo leer el archivo. Verifica que sea el Excel exportado desde la plataforma (.xlsx)." };
  }

  if (rows.length === 0) {
    return { error: "El archivo no tiene filas de jugadores." };
  }

  const supabase = await createClient();
  let updated = 0;
  let unchanged = 0;
  const notFound: string[] = [];

  for (const row of rows) {
    const document = String(row[MATCH_COLUMN] ?? "").trim();
    if (!document) continue; // fila sin documento — no hay forma segura de identificar al jugador, se ignora

    const { data: existing, error: findError } = await supabase
      .from("players")
      .select("id")
      .eq("document_number", document)
      .maybeSingle();

    if (findError || !existing) {
      notFound.push(document);
      continue;
    }

    const patch = rowToPatch(row);
    if (Object.keys(patch).length === 0) {
      unchanged++;
      continue;
    }

    const { error: updateError } = await supabase
      .from("players")
      .update(patch as unknown as TablesUpdate<"players">)
      .eq("id", existing.id);
    if (updateError) {
      console.error(`importPlayers: no se pudo actualizar documento ${document}:`, updateError);
      notFound.push(document);
      continue;
    }
    updated++;
  }

  revalidatePath("/plataforma/jugadores");
  revalidatePath("/plataforma");

  return { success: true, updated, unchanged, notFound };
}
