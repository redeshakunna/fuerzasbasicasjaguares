import type { Enums } from "@/lib/supabase/database.types";

export type PositionGroup = Enums<"position_group">;

export interface PositionOption {
  label: string;
  group: PositionGroup;
}

/**
 * Catálogo único de posiciones específicas — cada una ya trae su grupo
 * (Arquero/Defensa/Volante/Extremo/Delantero) para no pedirle al staff
 * que elija dos veces lo mismo. `position` guarda la etiqueta específica;
 * `position_group` se deriva automáticamente para filtros/estadísticas.
 */
export const positionOptions: PositionOption[] = [
  { label: "Arquero", group: "Arquero" },
  { label: "Defensa Central", group: "Defensa" },
  { label: "Lateral Derecho", group: "Defensa" },
  { label: "Lateral Izquierdo", group: "Defensa" },
  { label: "Volante de Marca", group: "Volante" },
  { label: "Volante Mixto", group: "Volante" },
  { label: "Mediocampista Ofensivo", group: "Volante" },
  { label: "Extremo Derecho", group: "Extremo" },
  { label: "Extremo Izquierdo", group: "Extremo" },
  { label: "Segundo Delantero", group: "Delantero" },
  { label: "Delantero Centro", group: "Delantero" },
];

export function groupForPosition(label: string): PositionGroup | null {
  return positionOptions.find((p) => p.label === label)?.group ?? null;
}
