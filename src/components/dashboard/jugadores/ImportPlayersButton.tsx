"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, Upload, X } from "lucide-react";
import { importPlayers, type ImportPlayersResult } from "@/app/plataforma/(dashboard)/jugadores/import-actions";
import { DashboardButton } from "../ui/Button";

const initialState: ImportPlayersResult = {};

/**
 * Botón "Importar jugadores" — sube el Excel exportado (y editado) y aplica
 * solo los cambios: nunca crea jugadores nuevos, nunca borra un campo que
 * quedó vacío en la hoja (eso se deja intacto).
 */
export function ImportPlayersButton() {
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [state, formAction, isPending] = useActionState(importPlayers, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!open) {
      setFileName(null);
      formRef.current?.reset();
    }
  }, [open]);

  return (
    <>
      <DashboardButton
        variant="secondary"
        icon={<Upload className="h-4 w-4" strokeWidth={2} />}
        onClick={() => setOpen(true)}
      >
        Importar jugadores
      </DashboardButton>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-jaguar-ink/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-[17px] font-bold text-jaguar-ink">Importar jugadores</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-jaguar-ink/50 hover:bg-jaguar-ink/5"
              >
                <X className="h-4.5 w-4.5" strokeWidth={2} />
              </button>
            </div>

            <p className="mt-2 text-[13.5px] leading-relaxed text-jaguar-ink/60">
              Sube el mismo archivo que descargaste con &quot;Exportar&quot;, ya editado. Solo se actualizan los
              campos que modificaste — las celdas vacías se dejan tal cual, y ningún jugador nuevo se crea desde
              aquí.
            </p>

            {!state.success ? (
              <form ref={formRef} action={formAction} className="mt-4 space-y-3">
                <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-jaguar-ink/15 px-4 py-6 text-center hover:bg-jaguar-ink/[0.02]">
                  <Upload className="h-5 w-5 text-jaguar-ink/40" strokeWidth={2} />
                  <span className="text-[13px] font-semibold text-jaguar-ink">
                    {fileName ?? "Selecciona el archivo .xlsx"}
                  </span>
                  <input
                    type="file"
                    name="file"
                    accept=".xlsx,.xls"
                    className="hidden"
                    onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
                    required
                  />
                </label>

                {state.error ? (
                  <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-[12.5px] font-medium text-red-700">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
                    {state.error}
                  </div>
                ) : null}

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-4 py-2.5 text-[13.5px] font-semibold text-jaguar-ink/60 hover:bg-jaguar-ink/5"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!fileName || isPending}
                    className="inline-flex items-center gap-2 rounded-xl bg-jaguar-green-600 px-4 py-2.5 text-[13.5px] font-semibold text-white hover:bg-jaguar-green-700 disabled:opacity-50"
                  >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} /> : null}
                    Importar
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-4 space-y-3">
                <div className="flex items-start gap-2 rounded-lg bg-jaguar-green-600/10 px-3 py-2.5 text-[13px] font-medium text-jaguar-green-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
                  <div>
                    {state.updated ?? 0} jugador{(state.updated ?? 0) === 1 ? "" : "es"} actualizado
                    {(state.updated ?? 0) === 1 ? "" : "s"}.
                    {state.unchanged ? ` ${state.unchanged} fila(s) sin cambios.` : ""}
                  </div>
                </div>

                {state.notFound && state.notFound.length > 0 ? (
                  <div className="rounded-lg bg-jaguar-gold-500/10 px-3 py-2.5 text-[12.5px] font-medium text-jaguar-gold-700">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 shrink-0" strokeWidth={2} />
                      {state.notFound.length} documento(s) no coinciden con ningún jugador — no se creó nada, revisa
                      esos datos:
                    </div>
                    <div className="mt-1.5 max-h-24 overflow-y-auto text-jaguar-ink/70">
                      {state.notFound.join(", ")}
                    </div>
                  </div>
                ) : null}

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-xl bg-jaguar-green-600 px-4 py-2.5 text-[13.5px] font-semibold text-white hover:bg-jaguar-green-700"
                  >
                    Listo
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
