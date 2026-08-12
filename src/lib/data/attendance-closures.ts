import { createClient } from "@/lib/supabase/server";
import { getStaffNameById } from "./staff";
import type { ActivityKind } from "./activities";

const GRACE_HOURS = 24;

export interface AttendanceClosureInfo {
  closedAt: string;
  closedByName: string | null;
  reason: "manual" | "automatico";
  note: string | null;
}

/**
 * Fecha límite hasta la que se puede editar la asistencia — fecha+hora de la actividad + 24 horas.
 * Se arma por componentes (no con template string) porque Postgres puede devolver la hora como
 * "HH:MM" o "HH:MM:SS" según la columna — concatenar a ciegas produce una fecha inválida.
 */
export function attendanceDeadline(activityDate: string, activityTime: string | null): Date {
  const [y, m, d] = activityDate.split("-").map(Number);
  const [hh, mm] = (activityTime ?? "23:59").split(":").map(Number);
  const start = new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1, Number.isFinite(hh) ? hh : 23, Number.isFinite(mm) ? mm : 59, 0);
  return new Date(start.getTime() + GRACE_HOURS * 60 * 60 * 1000);
}

async function fetchClosure(column: "training_id" | "match_id", id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("attendance_closures").select("*").eq(column, id).maybeSingle();
  if (error) {
    console.error("fetchClosure() falló:", error);
    return null;
  }
  return data;
}

/**
 * Resuelve el estado de cierre de una actividad: si ya fue cerrada (manual o
 * automática) lo devuelve; si no, y ya pasó el plazo de 24h, la cierra
 * automáticamente en este momento (perezoso, idempotente) y devuelve ese cierre.
 * `null` significa que la asistencia todavía se puede editar.
 */
export async function resolveAttendanceClosure(
  kind: ActivityKind,
  id: string,
  activityDate: string,
  activityTime: string | null,
): Promise<AttendanceClosureInfo | null> {
  const column = kind === "entrenamiento" ? "training_id" : "match_id";
  const existing = await fetchClosure(column, id);

  if (existing) {
    const closedByName = await getStaffNameById(existing.closed_by);
    return {
      closedAt: existing.closed_at,
      closedByName,
      reason: existing.reason === "automatico" ? "automatico" : "manual",
      note: existing.note,
    };
  }

  const deadline = attendanceDeadline(activityDate, activityTime);
  // Fecha/hora de actividad inválida o incompleta — no se puede calcular el plazo, se deja editable.
  if (Number.isNaN(deadline.getTime())) return null;
  if (new Date() <= deadline) return null;

  // Se venció el plazo sin cierre manual — se cierra automáticamente ahora mismo (idempotente).
  const supabase = await createClient();
  const { error } = await supabase.from("attendance_closures").upsert(
    {
      training_id: kind === "entrenamiento" ? id : null,
      match_id: kind === "partido" ? id : null,
      reason: "automatico",
      closed_at: deadline.toISOString(),
    },
    { onConflict: column, ignoreDuplicates: true },
  );

  if (error) {
    console.error("resolveAttendanceClosure() auto-cierre falló:", error);
  }

  return { closedAt: deadline.toISOString(), closedByName: null, reason: "automatico", note: null };
}
