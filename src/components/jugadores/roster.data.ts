import type { Enums } from "@/lib/supabase/database.types";

export type RosterFilter = "Todos" | "Arqueros" | "Defensas" | "Mediocampistas" | "Delanteros";

export const rosterFilters: RosterFilter[] = ["Todos", "Arqueros", "Defensas", "Mediocampistas", "Delanteros"];

/** Agrupa los 5 position_group del esquema en las 4 líneas que muestra el filtro público. */
export function filterForPositionGroup(group: Enums<"position_group">): Exclude<RosterFilter, "Todos"> {
  switch (group) {
    case "Arquero":
      return "Arqueros";
    case "Defensa":
      return "Defensas";
    case "Volante":
    case "Extremo":
      return "Mediocampistas";
    case "Delantero":
      return "Delanteros";
  }
}

export const rosterCardAccent: Record<Exclude<RosterFilter, "Todos">, string> = {
  Arqueros: "bg-jaguar-gold-500",
  Defensas: "bg-jaguar-green-900",
  Mediocampistas: "bg-jaguar-green-600",
  Delanteros: "bg-jaguar-maroon-500",
};
