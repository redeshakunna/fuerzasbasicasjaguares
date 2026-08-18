/**
 * Tipos y helpers puros de Mensajería — sin dependencia de Supabase ni
 * `next/headers`, así que son seguros de importar desde componentes de
 * cliente (MensajesShell). Las consultas reales viven en `messaging.ts`
 * (solo servidor).
 */

export interface MessageRecipient {
  playerId: string;
  playerName: string;
  guardianName: string;
  /** null = sin teléfono válido registrado — el botón de envío se deshabilita. */
  waPhone: string | null;
  message: string;
  /** Dato de referencia mostrado junto al nombre (monto, nº de faltas, etc.). */
  meta: string;
  /** Solo para deudores — permite marcar "recordatorio enviado" reusando enviarRecordatorios(). */
  obligationId?: string;
}

export interface CallupIssuePlayer {
  playerId: string;
  playerName: string;
  callStatus: string;
}

export interface MatchReplacementGroup {
  matchId: string;
  category: string;
  opponent: string;
  matchDateLabel: string;
  matchTimeLabel: string;
  location: string | null;
  withdrawn: CallupIssuePlayer[];
  candidates: MessageRecipient[];
}

const dayNames = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const monthShort = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

export function formatDateLong(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
  const dayName = dayNames[date.getDay()];
  const cap = dayName ? dayName[0]?.toUpperCase() + dayName.slice(1) : "";
  return `${cap} ${d} de ${monthShort[(m ?? 1) - 1]} de ${y}`;
}

export function formatTime12h(value: string | null): string {
  if (!value) return "Hora por definir";
  const [hStr, mStr] = value.split(":");
  const h = Number(hStr);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${mStr ?? "00"} ${period}`;
}

export function daysBetween(from: string, to: string): number {
  const a = new Date(from).getTime();
  const b = new Date(to).getTime();
  return Math.max(0, Math.round((b - a) / (1000 * 60 * 60 * 24)));
}

/** Normaliza un teléfono colombiano a formato internacional para wa.me (57XXXXXXXXXX). `null` si no es reconocible. */
export function toWhatsAppPhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10 && digits.startsWith("3")) return `57${digits}`;
  if (digits.length === 12 && digits.startsWith("57")) return digits;
  if (digits.length === 13 && digits.startsWith("057")) return `57${digits.slice(3)}`;
  return null;
}

export function firstNameOf(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}

export function waHref(phone: string, message: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
