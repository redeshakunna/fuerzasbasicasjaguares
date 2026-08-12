import type { LucideIcon } from "lucide-react";
import { CalendarDays, Shirt, Trophy, Users } from "lucide-react";
import type { PublicHomeStats } from "@/lib/data/public-stats";

export type StatAccent = "green" | "maroon" | "gold";

export interface SubQuinceStat {
  id: string;
  icon: LucideIcon;
  value: number;
  label: string;
  accent: StatAccent;
}

/**
 * Arma las 4 cifras de la sección Sub-15 a partir de datos reales de la
 * base de datos (ver `getPublicHomeStats`) — nada hardcodeado. Si algún
 * número está en cero es porque la base de datos todavía no tiene esa
 * información cargada, no porque lo hayamos inventado.
 */
export function buildSubQuinceStats(stats: PublicHomeStats): SubQuinceStat[] {
  return [
    { id: "jugadores", icon: Users, value: stats.jugadoresActivos, label: "Jugadores", accent: "green" },
    { id: "cuerpo-tecnico", icon: Shirt, value: stats.cuerpoTecnico, label: "Cuerpo técnico", accent: "maroon" },
    {
      id: "entrenamientos",
      icon: CalendarDays,
      value: stats.entrenamientosRecientes,
      label: "Entrenamientos últimos 7 días",
      accent: "maroon",
    },
    { id: "partidos", icon: Trophy, value: stats.partidosProgramados, label: "Partidos programados", accent: "gold" },
  ];
}
