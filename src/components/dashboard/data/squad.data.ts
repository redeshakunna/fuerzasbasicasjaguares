export interface SquadStatusSlice {
  id: string;
  label: string;
  value: number;
  color: string;
}

/** Estado general del plantel — 26 jugadores activos. */
export const squadStatus: SquadStatusSlice[] = [
  { id: "disponibles", label: "Disponibles", value: 19, color: "#1f7a3d" },
  { id: "seguimiento", label: "Seguimiento", value: 4, color: "#17b8bd" },
  { id: "recuperacion", label: "Recuperación", value: 2, color: "#e0a723" },
  { id: "lesionados", label: "Lesionados", value: 1, color: "#6e1b2b" },
];
