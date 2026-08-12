import type { LucideIcon } from "lucide-react";
import { ClipboardCheck, Dumbbell, Trophy, UserPlus } from "lucide-react";

export interface ActivityEvent {
  id: string;
  icon: LucideIcon;
  text: string;
  time: string;
}

/** Actividad reciente de ejemplo. */
export const recentActivity: ActivityEvent[] = [
  {
    id: "a1",
    icon: ClipboardCheck,
    text: "Juan Pérez completó su evaluación física.",
    time: "Hace 2 horas",
  },
  {
    id: "a2",
    icon: Dumbbell,
    text: "Carlos Gómez creó el entrenamiento de mañana.",
    time: "Hace 4 horas",
  },
  {
    id: "a3",
    icon: Trophy,
    text: "Sub-17 ganó 2-0 en condición de local.",
    time: "Ayer",
  },
  {
    id: "a4",
    icon: UserPlus,
    text: "Nueva inscripción registrada para pruebas Sub-15.",
    time: "Ayer",
  },
];
