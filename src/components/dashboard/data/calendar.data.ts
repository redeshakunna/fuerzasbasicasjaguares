export type CalendarEventType = "entrenamiento" | "partido" | "evento";

export interface CalendarEvent {
  id: string;
  day: "Lun" | "Mar" | "Mié" | "Jue" | "Vie" | "Sáb" | "Dom";
  time: string;
  title: string;
  type: CalendarEventType;
}

export const weekDays: CalendarEvent["day"][] = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export const eventTypeClass: Record<CalendarEventType, string> = {
  entrenamiento: "bg-jaguar-green-50 text-jaguar-green-700 border-jaguar-green-500/20",
  partido: "bg-jaguar-maroon-500/10 text-jaguar-maroon-600 border-jaguar-maroon-500/20",
  evento: "bg-jaguar-turquoise-500/10 text-jaguar-turquoise-600 border-jaguar-turquoise-500/20",
};

/** Semana de ejemplo — reemplazar con datos reales del calendario. */
export const weeklyEvents: CalendarEvent[] = [
  { id: "e1", day: "Lun", time: "4:00 PM", title: "Entrenamiento técnico", type: "entrenamiento" },
  { id: "e2", day: "Mar", time: "4:00 PM", title: "Trabajo físico", type: "entrenamiento" },
  { id: "e3", day: "Mié", time: "5:00 PM", title: "Evaluaciones", type: "evento" },
  { id: "e4", day: "Jue", time: "4:00 PM", title: "Táctico", type: "entrenamiento" },
  { id: "e5", day: "Vie", time: "4:00 PM", title: "Pre-partido", type: "entrenamiento" },
  { id: "e6", day: "Sáb", time: "10:00 AM", title: "vs. Rival por confirmar", type: "partido" },
];
