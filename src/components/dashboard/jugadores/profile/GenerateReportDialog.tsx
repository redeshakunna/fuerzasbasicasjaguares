"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, X } from "lucide-react";
import { generateReport } from "@/app/plataforma/(dashboard)/jugadores/report-actions";

/**
 * Modal previo a "Generar con IA" / "Regenerar" — pide las observaciones del
 * técnico y las envía junto con las estadísticas reales del jugador a la IA
 * (ver lib/informes/ai-report.ts). Si el técnico deja el campo vacío, el
 * informe se genera igual con el motor por reglas (sin llamar IA).
 */
export function GenerateReportDialog({
  playerId,
  playerFirstName,
  period,
  isRegenerate,
  onClose,
}: {
  playerId: string;
  playerFirstName: string;
  period: string;
  isRegenerate: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [observations, setObservations] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await generateReport(playerId, playerFirstName, period, observations);
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
            <h2 className="flex items-center gap-2 text-[17px] lg:text-[18.5px] font-extrabold text-jaguar-ink">
              <Sparkles className="h-4.5 w-4.5 text-violet-600" strokeWidth={2} aria-hidden />
              {isRegenerate ? "Regenerar informe" : "Generar informe con IA"}
            </h2>
            <p className="mt-0.5 text-[13px] lg:text-[14px] text-jaguar-ink/50">{playerFirstName}</p>
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

        <div className="space-y-3 overflow-y-auto px-6 py-5">
          <p className="text-[12.5px] lg:text-[13.5px] text-jaguar-ink/55">
            Cuenta lo que quieras que el informe refleje — la IA lo combina con las estadísticas reales del mes
            (promedio, asistencia, evaluaciones) para redactar el resumen. Puedes dejarlo vacío y se genera solo con
            las estadísticas.
          </p>
          <textarea
            rows={5}
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="Ej. Mejoró mucho el remate de cabeza este mes, pero le sigue costando la marca en defensa. Buena actitud con el grupo…"
            className="w-full resize-none rounded-xl border border-jaguar-ink/10 bg-jaguar-mist/40 px-3.5 py-2.5 text-[13.5px] lg:text-[14.5px] text-jaguar-ink placeholder:text-jaguar-ink/35 focus:border-jaguar-green-500/40 focus:outline-none focus:ring-2 focus:ring-jaguar-green-500/10"
          />
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
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-[13px] lg:text-[14px] font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} aria-hidden /> : <Sparkles className="h-4 w-4" strokeWidth={2} aria-hidden />}
            {isPending ? "Generando…" : "Generar informe"}
          </button>
        </div>
      </div>
    </div>
  );
}
