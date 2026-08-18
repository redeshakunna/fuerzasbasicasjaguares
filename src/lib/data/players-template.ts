import type { Tables, Enums } from "@/lib/supabase/database.types";
import { groupForPosition, positionOptions } from "./positions";
import { categories } from "./categories";

export type PlayerRow = Tables<"players">;

export const dominantFeet: Enums<"dominant_foot">[] = ["Derecho", "Izquierdo", "Ambidiestro"];
export const documentTypes = ["Registro Civil", "Tarjeta de Identidad", "Cédula de Ciudadanía"];
export const bloodTypes = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];
export const relationships = ["Madre", "Padre", "Tutor legal", "Abuelo(a)", "Otro"];
export const playerStatuses: Enums<"player_status">[] = ["Disponible", "Suspendido", "Lesionado"];
export const positionLabels = positionOptions.map((p) => p.label);

/** Nombre de la columna que se usa como clave para encontrar al jugador al reimportar. Nunca se sobrescribe. */
export const MATCH_COLUMN = "Documento (clave — no editar)";

interface TemplateColumn {
  header: string;
  toCell: (p: PlayerRow) => string | number;
  /** Aplica el valor de la celda al patch de actualización. Celda vacía = no se toca ese campo. */
  fromCell?: (raw: unknown, patch: Record<string, unknown>) => void;
}

function cellStr(raw: unknown): string | undefined {
  const value = String(raw ?? "").trim();
  return value ? value : undefined;
}
function cellNum(raw: unknown): number | undefined {
  const value = String(raw ?? "").trim();
  if (!value) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}
function cellBool(raw: unknown): boolean | undefined {
  const value = String(raw ?? "").trim().toLowerCase();
  if (!value) return undefined;
  return ["sí", "si", "true", "1", "x"].includes(value);
}
function boolLabel(v: boolean | null): string {
  return v ? "Sí" : "No";
}

function strCol(header: string, key: keyof PlayerRow): TemplateColumn {
  return {
    header,
    toCell: (p) => (p[key] as string | null) ?? "",
    fromCell: (raw, patch) => {
      const v = cellStr(raw);
      if (v !== undefined) patch[key] = v;
    },
  };
}
function numCol(header: string, key: keyof PlayerRow): TemplateColumn {
  return {
    header,
    toCell: (p) => (p[key] as number | null) ?? "",
    fromCell: (raw, patch) => {
      const v = cellNum(raw);
      if (v !== undefined) patch[key] = v;
    },
  };
}
function enumCol(header: string, key: keyof PlayerRow, allowed: readonly string[]): TemplateColumn {
  return {
    header,
    toCell: (p) => (p[key] as string | null) ?? "",
    fromCell: (raw, patch) => {
      const v = cellStr(raw);
      if (v !== undefined && allowed.includes(v)) patch[key] = v;
    },
  };
}
function boolCol(header: string, key: keyof PlayerRow): TemplateColumn {
  return {
    header,
    toCell: (p) => boolLabel(p[key] as boolean | null),
    fromCell: (raw, patch) => {
      const v = cellBool(raw);
      if (v !== undefined) patch[key] = v;
    },
  };
}

/**
 * Columnas de la plantilla, en el orden en que aparecen en el Excel — mismo
 * conjunto de campos que ya edita el súper admin desde "Editar información"
 * (ver updatePlayer() en jugadores/actions.ts), organizado en los mismos
 * bloques: Deportivo / Personal / Acudiente y emergencia / Salud.
 *
 * La columna "Documento" es la clave de reimportación: nunca se escribe de
 * vuelta a la base — solo sirve para encontrar al jugador correcto. Una fila
 * cuyo documento no coincida con ningún jugador se ignora (nunca crea uno
 * nuevo); una celda vacía en cualquier otra columna deja ese campo intacto.
 */
export const TEMPLATE_COLUMNS: TemplateColumn[] = [
  { header: MATCH_COLUMN, toCell: (p) => p.document_number ?? "" },

  // Deportivo
  strCol("Nombres", "first_name"),
  strCol("Apellidos", "last_name"),
  strCol("Apodo", "nickname"),
  enumCol("Categoría", "category", categories),
  enumCol("Posición", "position", positionLabels),
  enumCol("Estado", "status", playerStatuses),
  numCol("Dorsal", "jersey_number"),
  strCol("Fecha de nacimiento (AAAA-MM-DD)", "birth_date"),
  numCol("Altura (cm)", "height_cm"),
  numCol("Peso (kg)", "weight_kg"),
  enumCol("Pie dominante", "dominant_foot", dominantFeet),
  strCol("Club anterior", "previous_club"),
  numCol("Años jugando", "years_playing"),

  // Personal
  enumCol("Tipo de documento", "document_type", documentTypes),
  strCol("Lugar de nacimiento", "birth_place"),
  strCol("Lugar de residencia", "residence_place"),
  strCol("Dirección", "address"),
  strCol("Colegio", "school_name"),
  strCol("Grado escolar", "school_grade"),
  strCol("Teléfono del jugador", "phone"),

  // Acudiente y emergencia
  strCol("Nombre del acudiente", "guardian_name"),
  enumCol("Parentesco", "guardian_relationship", relationships),
  strCol("Teléfono del acudiente", "guardian_phone"),
  strCol("Correo del acudiente", "guardian_email"),
  strCol("Contacto de emergencia", "emergency_contact_name"),
  strCol("Teléfono de emergencia", "emergency_contact_phone"),

  // Salud y autorizaciones
  strCol("EPS", "eps_name"),
  enumCol("Tipo de sangre", "blood_type", bloodTypes),
  strCol("Alergias", "allergies"),
  strCol("Condiciones médicas", "medical_conditions"),
  boolCol("Autorización médica (Sí/No)", "medical_authorization"),
  boolCol("Autorización de imagen (Sí/No)", "image_authorization"),
];

/** Convierte un jugador en una fila de exportación (header → valor), en el orden de TEMPLATE_COLUMNS. */
export function playerToExportRow(player: PlayerRow): Record<string, string | number> {
  const row: Record<string, string | number> = {};
  for (const col of TEMPLATE_COLUMNS) row[col.header] = col.toCell(player);
  return row;
}

/** A partir de una fila leída del Excel (header → valor de celda), arma el patch de UPDATE — solo campos con valor. */
export function rowToPatch(row: Record<string, unknown>): Record<string, unknown> {
  const patch: Record<string, unknown> = {};
  for (const col of TEMPLATE_COLUMNS) {
    if (!col.fromCell) continue;
    col.fromCell(row[col.header], patch);
  }

  // La posición se guarda junto con su grupo derivado — si la posición no es
  // válida, se descarta el cambio completo para no dejar position/position_group desalineados.
  if (typeof patch.position === "string") {
    const group = groupForPosition(patch.position);
    if (group) patch.position_group = group;
    else delete patch.position;
  }

  return patch;
}
