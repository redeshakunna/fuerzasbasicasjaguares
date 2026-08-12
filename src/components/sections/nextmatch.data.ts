export interface NextMatch {
  tournament: string;
  date: string;
  time: string;
  location: string;
  home: { name: string; logo: string };
  /** Sin escudo real todavía — se muestra un placeholder genérico. */
  away: { name: string };
  calendarHref: string;
}

/**
 * Partido de ejemplo para poblar el diseño (próximo sábado desde hoy,
 * 2026-08-04 → 2026-08-08). Reemplazar con el dato real / conectar a
 * calendario cuando esté definido el rival y el fixture oficial.
 */
export const nextMatch: NextMatch = {
  tournament: "Torneo Nacional Sub-15",
  date: "Sábado 8 de agosto, 2026",
  time: "10:00 AM",
  location: "Cancha Sede Principal Jaguares de Córdoba FC — Caño Viejo, Las Lamas",
  home: { name: "Jaguares de Córdoba", logo: "/brand/logo-fuerzas-basicas.png" },
  away: { name: "Rival por confirmar" },
  calendarHref: "#calendario",
};
