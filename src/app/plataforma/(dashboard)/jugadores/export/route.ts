import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { createClient } from "@/lib/supabase/server";
import { getCurrentStaffProfile } from "@/lib/data/player-profile";
import { parseCategory } from "@/lib/data/categories";
import { playerToExportRow, TEMPLATE_COLUMNS, type PlayerRow } from "@/lib/data/players-template";
import type { Enums } from "@/lib/supabase/database.types";

const statusFilters: Record<string, Enums<"player_status">> = {
  disponibles: "Disponible",
  lesionados: "Lesionado",
  suspendidos: "Suspendido",
};

/**
 * GET /plataforma/jugadores/export?estado=disponibles|lesionados|suspendidos|todos&categoria=Sub-15
 * Descarga un Excel con el plantel filtrado, en el mismo formato que espera
 * el importador (ver players-template.ts) — así exportar y reimportar es un
 * ciclo seguro sin transformar manualmente el archivo.
 */
export async function GET(request: NextRequest) {
  const staff = await getCurrentStaffProfile();
  if (!staff) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const category = parseCategory(searchParams.get("categoria") ?? undefined);
  const estadoParam = (searchParams.get("estado") ?? "todos").toLowerCase();

  const supabase = await createClient();
  let query = supabase.from("players").select("*").eq("category", category).order("first_name");

  const status = statusFilters[estadoParam];
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) {
    console.error("export jugadores falló:", error);
    return NextResponse.json({ error: "No se pudo generar el archivo." }, { status: 500 });
  }

  const players = (data ?? []) as PlayerRow[];
  const rows = players.map(playerToExportRow);

  const worksheet = XLSX.utils.json_to_sheet(rows, {
    header: TEMPLATE_COLUMNS.map((c) => c.header),
  });
  worksheet["!cols"] = TEMPLATE_COLUMNS.map((c) =>
    c.header === "Documento (clave — no editar)" ? { wch: 26 } : { wch: 22 }
  );

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Jugadores");

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
  const body = new Uint8Array(buffer);

  const estadoLabel = statusFilters[estadoParam] ? estadoParam : "todos";
  const fileName = `jugadores-${category.toLowerCase()}-${estadoLabel}.xlsx`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
