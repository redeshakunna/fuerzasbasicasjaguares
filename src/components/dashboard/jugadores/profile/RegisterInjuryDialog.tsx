"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, X } from "lucide-react";
import { registrarLesion } from "@/app/plataforma/(dashboard)/jugadores/injury-actions";
import type { InjurySeverity } from "@/lib/data/injuries";
import { Field, inputClass } from "../FormField";

const severities: InjurySeverity[] = ["Leve", "Moderada", "Severa"];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/** Modal para registrar una lesión nueva — pone al jugador en estado "Lesionado" y queda en su historial. */
export function RegisterInjuryDialog({
  playerId,
  playerName,
  onClose,
}: {
  playerId: string;
  playerName: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [injuryType, setInjuryType] = useState("");
  const [severity, setSeverity] = useState<InjurySeverity>("Leve");
  const [startDate, setStartDate] = useState(todayISO());
  const [expectedRecoveryDate, setExpectedRecoveryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await registrarLesion(playerId, {
        injuryType,
        severity,
        startDate,
        expectedRecoveryDate: expectedRecoveryDate || null,
        notes: notes || null,
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-jaguar-ink/40 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-[480px] flex-col rounded-[18px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-jaguar-ink/6 px-6 py-5">
          <div>
            <h2 className="text-[17px] lg:text-[18.5px] font-extrabold text-jaguar-ink">Registrar lesión</h2>
            <p className="mt-0.5 text-[13px] lg:text-[14px] text-jaguar-ink/50">{playerName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-jaguar-ink/40 hover:bg-jaguar-ink/[0.04]"
            aria-label="Cerrar"
          >
            <X className="h-4.5 w-4.5" strokeWidth={2} aria-hidden />
          </button>
        </div>

        <div className="space-y-3.5 overflow-y-auto px-6 py-5">
          <Field label="Tipo de lesión *">
            <input
              value={injuryType}
              onChange={(e) => setInjuryType(e.target.value)}
              placeholder="Ej. Esguince de tobillo"
              className={inputClass}
            />
          </Field>
          <Field label="Gravedad *">
            <select value={severity} onChange={(e) => setSeverity(e.target.value as InjurySeverity)} className={inputClass}>
              {severities.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Fecha de inicio *">
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Recuperación estimada">
              <input
                type="date"
                value={expectedRecoveryDate}
                onChange={(e) => setExpectedRecoveryDate(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
          <Field label="Notas">
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Diagnóstico, tratamiento, restricciones…"
              className={`${inputClass} resize-none`}
            />
          </Field>
          {error ? (
            <p className="rounded-xl bg-jaguar-maroon-500/8 px-3.5 py-2.5 text-[13px] font-medium text-jaguar-maroon-600">{error}</p>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-jaguar-ink/6 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-[13px] lg:text-[14px] font-semibold text-jaguar-ink/55 hover:bg-jaguar-ink/[0.04]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={isPending}
            className="flex items-center gap-2 rounded-xl bg-jaguar-maroon-600 px-4 py-2.5 text-[13px] lg:text-[14px] font-semibold text-white hover:bg-jaguar-maroon-700 disabled:opacity-60"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} aria-hidden /> : null}
            {isPending ? "Guardando…" : "Registrar lesión"}
          </button>
        </div>
      </div>
    </div>
  );
}
