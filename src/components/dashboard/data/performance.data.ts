export type PerformancePeriod = "semana" | "mes" | "temporada";

export interface PerformancePoint {
  label: string;
  value: number;
}

/** Series de ejemplo por período — rendimiento promedio del plantel (0-100). */
export const performanceSeries: Record<PerformancePeriod, PerformancePoint[]> = {
  semana: [
    { label: "Lun", value: 74 },
    { label: "Mar", value: 78 },
    { label: "Mié", value: 76 },
    { label: "Jue", value: 81 },
    { label: "Vie", value: 85 },
    { label: "Sáb", value: 83 },
    { label: "Dom", value: 80 },
  ],
  mes: [
    { label: "Sem 1", value: 72 },
    { label: "Sem 2", value: 76 },
    { label: "Sem 3", value: 79 },
    { label: "Sem 4", value: 83 },
  ],
  temporada: [
    { label: "Feb", value: 65 },
    { label: "Mar", value: 68 },
    { label: "Abr", value: 71 },
    { label: "May", value: 74 },
    { label: "Jun", value: 77 },
    { label: "Jul", value: 81 },
    { label: "Ago", value: 83 },
  ],
};

export const performancePeriodLabel: Record<PerformancePeriod, string> = {
  semana: "Semana",
  mes: "Mes",
  temporada: "Temporada",
};
