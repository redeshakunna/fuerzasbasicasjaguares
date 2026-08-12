export interface TourStep {
  id: string;
  /** Selector CSS del elemento a resaltar — debe existir un `data-tour="..."` en el DOM. */
  selector: string;
  title: string;
  description: string;
}

/**
 * Recorrido guiado de la plataforma — un paso por cada tarjeta clave del
 * Dashboard y por cada opción del menú lateral. Si un paso no encuentra su
 * elemento en pantalla (rol sin esa tarjeta, sidebar oculto en mobile, etc.)
 * el tour lo salta automáticamente — ver GuidedTour.tsx.
 */
export const tourSteps: TourStep[] = [
  {
    id: "categoria",
    selector: '[data-tour="categoria-selector"]',
    title: "Selector de categoría",
    description: "Cambia entre Sub-13, Sub-15 y Sub-17 — todo el panel se filtra según la categoría que elijas.",
  },
  {
    id: "resumen",
    selector: '[data-tour="resumen-dia"]',
    title: "Resumen del día",
    description:
      "Lo que necesita tu atención hoy: asistencia, evaluaciones y convocatorias pendientes (o el resumen ejecutivo, si tu rol es de seguimiento general).",
  },
  {
    id: "kpis",
    selector: '[data-tour="kpis"]',
    title: "Indicadores clave",
    description: "Jugadores activos, asistencia, evaluaciones pendientes y próximos partidos, de un vistazo.",
  },
  {
    id: "calendario",
    selector: '[data-tour="calendario"]',
    title: "Calendario semanal",
    description: "Entrenamientos y partidos de la semana, organizados por día.",
  },
  {
    id: "plantel",
    selector: '[data-tour="plantel"]',
    title: "Plantel",
    description: "Los jugadores de la categoría activa, con acceso directo al perfil de cada uno.",
  },
  {
    id: "sidebar-dashboard",
    selector: '[data-tour="sidebar-dashboard"]',
    title: "Dashboard",
    description: "Tu punto de partida cada vez que entras — el resumen general del día.",
  },
  {
    id: "sidebar-categorias",
    selector: '[data-tour="sidebar-categorias"]',
    title: "Categorías",
    description:
      "El plantel de cada categoría — hoy Sub-15 tiene jugadores reales; Sub-13 y Sub-17 llegarán próximamente.",
  },
  {
    id: "sidebar-entrenamientos",
    selector: '[data-tour="sidebar-entrenamientos"]',
    title: "Entrenamientos",
    description: "Crea sesiones, pasa asistencia y evalúa el desempeño de cada jugador.",
  },
  {
    id: "sidebar-partidos",
    selector: '[data-tour="sidebar-partidos"]',
    title: "Partidos",
    description: "Convocatorias, roster de partido y resultados.",
  },
  {
    id: "sidebar-evaluaciones",
    selector: '[data-tour="sidebar-evaluaciones"]',
    title: "Evaluaciones",
    description: "Evalúa el rendimiento de cada jugador por entrenamiento o partido.",
  },
  {
    id: "sidebar-asistencia",
    selector: '[data-tour="sidebar-asistencia"]',
    title: "Asistencia",
    description: "Registra quién asistió a cada entrenamiento o partido.",
  },
  {
    id: "sidebar-informes",
    selector: '[data-tour="sidebar-informes"]',
    title: "Informes",
    description: "Informes de evolución — individuales o grupales — listos para compartir con las familias.",
  },
  {
    id: "sidebar-finanzas",
    selector: '[data-tour="sidebar-finanzas"]',
    title: "Gestión Financiera",
    description: "Cobros, pagos y estado de cuenta de cada jugador.",
  },
  {
    id: "sidebar-configuracion",
    selector: '[data-tour="sidebar-configuracion"]',
    title: "Configuración",
    description: "Administra categorías, temporadas, staff y usuarios de la academia.",
  },
];
