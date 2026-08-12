"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Lock, Loader2, Sparkles, Users } from "lucide-react";
import { AttendanceSummaryCards } from "./AttendanceSummaryCards";
import { AttendancePlayerList } from "./AttendancePlayerList";
import { closeAttendance, saveAttendance, type AttendanceActivity } from "@/app/plataforma/(dashboard)/entrenamientos/actions";
import type { AttendanceClosureInfo } from "@/lib/data/attendance-closures";
import type { RsvpStatus } from "@/lib/data/match-rsvp";
import type { PlayerRow } from "@/lib/data/players";
import type { Enums } from "@/lib/supabase/database.types";

type AttendanceStatus = Enums<"attendance_status">;

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("es-CO", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
}

/** Orquesta el registro de asistencia de una actividad (entrenamiento o partido) — un clic por jugador, guardar, listo. */
export function AsistenciaShell({
  activity,
  category,
  players,
  initialStatuses,
  closure,
  canClose,
  rsvpByPlayer,
}: {
  activity: AttendanceActivity;
  category: string;
  players: PlayerRow[];
  initialStatuses: Record<string, AttendanceStatus>;
  closure: AttendanceClosureInfo | null;
  canClose: boolean;
  rsvpByPlayer?: Record<string, RsvpStatus>;
}) {
  const router = useRouter();
  const isLocked = closure !== null;
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>(() => {
    const base: Record<string, AttendanceStatus> = {};
    players.forEach((p) => {
      base[p.id] = initialStatuses[p.id] ?? "Presente";
    });
    return base;
  });
  const [isPending, startTransition] = useTransition();
  const [isClosing, startClosingTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [closeNote, setCloseNote] = useState("");
  const [closeError, setCloseError] = useState<string | null>(null);

  const counts = useMemo(() => {
    const values = Object.values(statuses);
    return {
      presentes: values.filter((s) => s === "Presente").length,
      tarde: values.filter((s) => s === "Tarde").length,
      justificados: values.filter((s) => s === "Justificado").length,
      ausentes: values.filter((s) => s === "Ausente").length,
    };
  }, [statuses]);

  function handleChange(playerId: string, status: AttendanceStatus) {
    if (isLocked) return;
    setSaved(false);
    setStatuses((prev) => ({ ...prev, [playerId]: status }));
  }

  function handleMarkAllPresent() {
    setSaved(false);
    setStatuses(() => {
      const base: Record<string, AttendanceStatus> = {};
      players.forEach((p) => {
        base[p.id] = "Presente";
      });
      return base;
    });
  }

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const records = players.map((p) => ({ playerId: p.id, status: statuses[p.id] ?? "Presente" }));
      const result = await saveAttendance(activity, records);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSaved(true);
      setToastVisible(true);
      router.refresh();
    });
  }

  function handleClose() {
    setCloseError(null);
    startClosingTransition(async () => {
      const result = await closeAttendance(activity, closeNote);
      if (result.error) {
        setCloseError(result.error);
        return;
      }
      setShowCloseConfirm(false);
      router.refresh();
    });
  }

  // El toast de confirmación se retira solo — no depende de que el profesor siga mirando la pantalla.
  useEffect(() => {
    if (!toastVisible) return;
    const timer = setTimeout(() => setToastVisible(false), 3200);
    return () => clearTimeout(timer);
  }, [toastVisible]);

  return (
    <div className="space-y-6 pb-4">
      <AttendanceSummaryCards {...counts} total={players.length} />

      {isLocked ? (
        <div className="flex items-start gap-3 rounded-2xl border border-jaguar-ink/10 bg-jaguar-ink/[0.03] px-4 py-3.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-jaguar-ink/8 text-jaguar-ink/50">
            <Lock className="h-4 w-4" strokeWidth={2} aria-hidden />
          </span>
          <div>
            <p className="text-[12.5px] lg:text-[13.5px] font-bold text-jaguar-ink/75">
              Asistencia cerrada — ya no se puede modificar
            </p>
            <p className="mt-0.5 text-[12px] lg:text-[13px] text-jaguar-ink/50">
              {closure!.reason === "manual"
                ? `Cerrada${closure!.closedByName ? ` por ${closure!.closedByName}` : ""} el ${formatDateTime(closure!.closedAt)}.`
                : `Se cerró automáticamente el ${formatDateTime(closure!.closedAt)} — pasaron más de 24 horas desde la actividad sin que se cerrara manualmente.`}
              {closure!.note ? ` "${closure!.note}"` : ""}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-jaguar-green-50/70 px-4 py-3.5">
          <p className="flex items-center gap-2 text-[12.5px] lg:text-[13.5px] font-medium text-jaguar-ink/60">
            <Users className="h-4 w-4 shrink-0 text-jaguar-green-600" strokeWidth={1.9} aria-hidden />
            ¿Asistió todo el plantel? Marca a todos de una vez y ajusta solo las excepciones.
          </p>
          <button
            type="button"
            onClick={handleMarkAllPresent}
            className="shrink-0 rounded-xl bg-jaguar-green-600 px-3.5 py-2 text-[12.5px] lg:text-[13.5px] font-semibold text-white transition-colors hover:bg-jaguar-green-700"
          >
            Marcar todos presentes
          </button>
        </div>
      )}

      <AttendancePlayerList
        players={players}
        statuses={statuses}
        onChange={handleChange}
        readOnly={isLocked}
        rsvpByPlayer={rsvpByPlayer}
      />

      {error ? (
        <p className="rounded-xl bg-jaguar-maroon-500/8 px-3.5 py-2.5 text-[13px] lg:text-[14px] font-medium text-jaguar-maroon-600">{error}</p>
      ) : null}

      {saved && activity.kind === "entrenamiento" ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-jaguar-green-50 px-5 py-4">
          <p className="text-[13px] lg:text-[14px] font-semibold text-jaguar-green-700">¿Listo para evaluar la sesión?</p>
          <Link
            href={`/plataforma/evaluaciones?categoria=${category}&sesion=${activity.id}`}
            className="flex items-center gap-1.5 rounded-xl bg-jaguar-green-600 px-4 py-2 text-[12.5px] lg:text-[13.5px] font-semibold text-white transition-colors hover:bg-jaguar-green-700"
          >
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            Evaluar presentes
          </Link>
        </div>
      ) : null}

      {!isLocked ? (
        <div className="sticky bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-30 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-jaguar-ink/8 bg-white/95 px-4 py-3 shadow-[0_-10px_30px_-15px_rgba(13,18,16,0.25)] backdrop-blur-sm lg:bottom-4">
          <p className="hidden text-[12.5px] lg:text-[13.5px] text-jaguar-ink/45 sm:block">
            {counts.presentes + counts.tarde} de {players.length} registrados como presentes en la cancha
          </p>
          <div className="ml-auto flex items-center gap-2">
            {canClose ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCloseConfirm((v) => !v)}
                  className="flex items-center gap-1.5 rounded-xl border border-jaguar-ink/10 px-3.5 py-2.5 text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-ink/60 transition-colors hover:bg-jaguar-ink/[0.03]"
                >
                  <Lock className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                  Cerrar asistencia
                </button>
                {showCloseConfirm ? (
                  <div className="absolute bottom-full right-0 z-10 mb-2 w-[280px] rounded-2xl border border-jaguar-ink/10 bg-white p-4 shadow-xl">
                    <p className="text-[12.5px] lg:text-[13.5px] font-bold text-jaguar-ink">¿Cerrar esta asistencia?</p>
                    <p className="mt-1 text-[11.5px] lg:text-[12.5px] text-jaguar-ink/50">
                      Después de cerrarla nadie podrá modificarla (queda registrado quién y cuándo la cerró).
                    </p>
                    <textarea
                      rows={2}
                      value={closeNote}
                      onChange={(e) => setCloseNote(e.target.value)}
                      placeholder="Nota opcional…"
                      className="mt-2.5 w-full resize-none rounded-lg border border-jaguar-ink/10 bg-jaguar-mist/40 px-2.5 py-2 text-[12px] lg:text-[13px] text-jaguar-ink placeholder:text-jaguar-ink/35 focus:outline-none"
                    />
                    {closeError ? <p className="mt-2 text-[11px] lg:text-[12px] font-medium text-jaguar-maroon-600">{closeError}</p> : null}
                    <div className="mt-2.5 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowCloseConfirm(false)}
                        className="rounded-lg px-2.5 py-1.5 text-[11.5px] lg:text-[12.5px] font-semibold text-jaguar-ink/55 hover:bg-jaguar-ink/[0.04]"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleClose}
                        disabled={isClosing}
                        className="rounded-lg bg-jaguar-ink px-3 py-1.5 text-[11.5px] lg:text-[12.5px] font-semibold text-white hover:bg-jaguar-ink/85 disabled:opacity-60"
                      >
                        {isClosing ? "Cerrando…" : "Cerrar asistencia"}
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending}
              className="flex items-center gap-2 rounded-xl bg-jaguar-green-600 px-5 py-2.5 text-[13.5px] lg:text-[15px] font-semibold text-white transition-colors hover:bg-jaguar-green-700 disabled:opacity-60"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} aria-hidden /> : null}
              {isPending ? "Guardando…" : "Guardar asistencia"}
            </button>
          </div>
        </div>
      ) : null}

      {saved && toastVisible ? (
        <div className="pointer-events-none fixed inset-x-0 top-24 z-50 flex justify-center px-4 lg:top-6">
          <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-jaguar-ink px-4 py-2.5 text-[13px] lg:text-[14px] font-semibold text-white shadow-lg">
            <CheckCircle2 className="h-4 w-4 text-jaguar-green-400" strokeWidth={2} aria-hidden />
            Asistencia guardada
          </div>
        </div>
      ) : null}
    </div>
  );
}
