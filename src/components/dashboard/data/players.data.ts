export type PhysicalStatus = "Óptimo" | "En seguimiento" | "Recuperación";

export interface FeaturedPlayer {
  id: string;
  name: string;
  initials: string;
  category: string;
  position: string;
  performance: number; // 0-100
  physicalStatus: PhysicalStatus;
  lastEvaluation: string;
}

/** Jugadores destacados de ejemplo. */
export const featuredPlayers: FeaturedPlayer[] = [
  {
    id: "p1",
    name: "Samuel Martínez",
    initials: "SM",
    category: "Sub-15",
    position: "Delantero",
    performance: 92,
    physicalStatus: "Óptimo",
    lastEvaluation: "2 ago, 2026",
  },
  {
    id: "p2",
    name: "Juan Pérez",
    initials: "JP",
    category: "Sub-15",
    position: "Mediocampista",
    performance: 87,
    physicalStatus: "Óptimo",
    lastEvaluation: "30 jul, 2026",
  },
  {
    id: "p3",
    name: "Carlos Gómez",
    initials: "CG",
    category: "Sub-15",
    position: "Defensa central",
    performance: 79,
    physicalStatus: "En seguimiento",
    lastEvaluation: "28 jul, 2026",
  },
  {
    id: "p4",
    name: "Andrés Rojas",
    initials: "AR",
    category: "Sub-15",
    position: "Arquero",
    performance: 84,
    physicalStatus: "Óptimo",
    lastEvaluation: "27 jul, 2026",
  },
  {
    id: "p5",
    name: "Miguel Torres",
    initials: "MT",
    category: "Sub-15",
    position: "Lateral derecho",
    performance: 71,
    physicalStatus: "Recuperación",
    lastEvaluation: "20 jul, 2026",
  },
];
