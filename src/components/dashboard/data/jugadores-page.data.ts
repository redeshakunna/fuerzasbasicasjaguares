import type { LucideIcon } from "lucide-react";

/* ---------------------------------------------------------------------- */
/*  Tipos compartidos de la vista "Gestión de Jugadores"                   */
/*  Los datos ya no son de ejemplo: se calculan en                        */
/*  src/lib/data/players-stats.ts a partir de la tabla `players` real.     */
/* ---------------------------------------------------------------------- */

export type RosterStatus = "Disponible" | "Suspendido" | "Lesionado";

export interface RosterPlayer {
  id: string;
  name: string;
  nickname: string | null;
  initials: string;
  photoUrl: string | null;
  category: string;
  position: string;
  positionTone: "green" | "turquoise" | "violet" | "maroon" | "gold";
  status: RosterStatus;
  rating: number; // 0-5, admite medios puntos
  age: number;
  height: string;
  weight: string;
  lastTraining: string;
  dominantFoot: string | null;
}

export interface UpcomingBirthday {
  id: string;
  name: string;
  initials: string;
  category: string;
  daysLabel: string;
  date: string;
}

export interface SquadAlert {
  id: string;
  icon: LucideIcon;
  label: string;
  count: number;
  tone: "maroon" | "gold" | "turquoise" | "green";
}

export interface RosterActivity {
  id: string;
  icon: LucideIcon;
  actor: string;
  action: string;
  time: string;
  tone: "green" | "turquoise" | "gold" | "maroon";
}
