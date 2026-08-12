import type { LucideIcon } from "lucide-react";
import { AlertTriangle, ClipboardCheck, Star, TrendingUp, Trophy, Users } from "lucide-react";

export interface KpiCard {
  id: string;
  icon: LucideIcon;
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down" | "flat";
  accent: "green" | "turquoise" | "violet" | "gold" | "maroon" | "blue";
  /** Fuerza el color del texto de la variación, independiente de `trend`
   *  (p. ej. un KPI negativo como "Lesionados" que sube debe verse en rojo). */
  trendTone?: "green" | "maroon" | "neutral";
}

/** KPIs de ejemplo — Sub-15, 26 jugadores en plantel. */
export const kpiCards: KpiCard[] = [
  {
    id: "jugadores-activos",
    icon: Users,
    label: "Jugadores activos",
    value: "26",
    delta: "+12% vs. anterior",
    trend: "up",
    accent: "green",
  },
  {
    id: "asistencia-promedio",
    icon: ClipboardCheck,
    label: "Asistencia promedio",
    value: "91%",
    delta: "+8% vs. anterior",
    trend: "up",
    accent: "green",
  },
  {
    id: "rendimiento-promedio",
    icon: TrendingUp,
    label: "Rendimiento promedio",
    value: "7.8",
    delta: "+5% vs. anterior",
    trend: "up",
    accent: "violet",
  },
  {
    id: "jugadores-destacados",
    icon: Star,
    label: "Jugadores destacados",
    value: "5",
    delta: "Este mes",
    trend: "flat",
    accent: "gold",
  },
  {
    id: "jugadores-riesgo",
    icon: AlertTriangle,
    label: "Jugadores en riesgo",
    value: "2",
    delta: "Requieren seguimiento",
    trend: "down",
    accent: "maroon",
  },
  {
    id: "proximos-partidos",
    icon: Trophy,
    label: "Próximos partidos",
    value: "2",
    delta: "Esta semana",
    trend: "flat",
    accent: "turquoise",
  },
];
