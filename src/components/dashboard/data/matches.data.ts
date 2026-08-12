export type MatchStatus = "Confirmado" | "Por confirmar";

export interface DashboardMatch {
  id: string;
  time: string;
  date: string;
  rival: string;
  category: string;
  location: string;
  status: MatchStatus;
}

/** Próximos partidos de ejemplo. */
export const dashboardMatches: DashboardMatch[] = [
  {
    id: "m1",
    date: "Sáb 8 ago",
    time: "10:00 AM",
    rival: "Rival por confirmar",
    category: "Sub-15",
    location: "Cancha Sede Principal — Las Lamas",
    status: "Por confirmar",
  },
  {
    id: "m2",
    date: "Sáb 15 ago",
    time: "9:00 AM",
    rival: "Atlético del Sinú",
    category: "Sub-15",
    location: "Cancha Alterna, Montería",
    status: "Confirmado",
  },
];
