const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const monthNames = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

function formatLongDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
  return `${dayNames[date.getDay()]} ${date.getDate()} de ${monthNames[date.getMonth()]}`;
}

function formatTime12h(time: string | null): string {
  if (!time) return "Por definir";
  const [hStr, mStr] = time.split(":");
  const h = Number(hStr);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${mStr ?? "00"} ${period}`;
}

/** Suma minutos a una hora "HH:MM" — usado para mostrar la hora de fin en la citación. */
function addMinutes(time: string, minutes: number): string {
  const [hStr, mStr] = time.split(":");
  const total = (Number(hStr) * 60 + Number(mStr ?? "0") + minutes + 24 * 60) % (24 * 60);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export interface WhatsAppCitationInput {
  category: string;
  sessionDate: string;
  startTime: string;
  durationMin: number | null;
  location: string | null;
  objectiveSummary: string;
}

/** Arma el texto de citación oficial — el mismo formato para todas las categorías. */
export function buildWhatsAppCitation(input: WhatsAppCitationInput): string {
  const endTime = input.durationMin ? addMinutes(input.startTime, input.durationMin) : null;
  const timeRange = endTime ? `${formatTime12h(input.startTime)} - ${formatTime12h(endTime)}` : formatTime12h(input.startTime);

  return [
    "*ACADEMIA JAGUARES DE CÓRDOBA*",
    "*Citación Oficial de Entrenamiento*",
    "",
    `Categoría: ${input.category}`,
    `Fecha: ${formatLongDate(input.sessionDate)}`,
    `Hora: ${timeRange}${input.durationMin ? ` (${input.durationMin} min)` : ""}`,
    `Lugar: ${input.location || "Por definir"}`,
    "",
    "*Objetivo:*",
    input.objectiveSummary,
    "",
    "*No olvides traer:*",
    "- Uniforme de entrenamiento",
    "- Guayos",
    "- Canilleras",
    "- Hidratación",
    "- Excelente actitud",
    "",
    "Los esperamos.",
    "¡Aquí nace el futuro!",
  ]
    .filter((line) => line !== null)
    .join("\n");
}

/** Enlace de WhatsApp click-to-chat con el mensaje precargado — un clic, sin API de negocio. */
export function whatsAppShareUrl(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
