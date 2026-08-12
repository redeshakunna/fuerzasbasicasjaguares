"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { createTraining, type TrainingFormState } from "@/app/plataforma/(dashboard)/entrenamientos/actions";
import { Field, inputClass, labelClass } from "../jugadores/FormField";

const initialState: TrainingFormState = {};

/** Botón "Nueva sesión" + modal para programar un entrenamiento (categoría Sub-15). */
export function CreateTrainingDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createTraining, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      setOpen(false);
    }
  }, [state.success]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-jaguar-green-600 px-4 py-2.5 text-[13.5px] lg:text-[15px] font-semibold text-white shadow-[0_1px_2px_rgba(13,18,16,0.08)] transition-colors hover:bg-jaguar-green-700"
      >
        <Plus className="h-4 w-4" strokeWidth={2.25} aria-hidden />
        Nueva sesión
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-jaguar-ink/40 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-[480px] flex-col rounded-[18px] bg-white shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-6">
              <div>
                <h2 className="text-[17px] lg:text-[18.5px] font-extrabold text-jaguar-ink">Nueva sesión de entrenamiento</h2>
                <p className="mt-0.5 text-[13px] lg:text-[14px] text-jaguar-ink/50">Categoría Sub-15</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-jaguar-ink/40 hover:bg-jaguar-ink/[0.05]"
              >
                <X className="h-4 w-4" strokeWidth={2} aria-hidden />
              </button>
            </div>

            <form ref={formRef} action={formAction} className="mt-5 flex-1 overflow-y-auto px-6 pb-2">
              <div className="space-y-4">
                <Field label="Título de la sesión *">
                  <input name="title" placeholder="Ej. Trabajo técnico-táctico" className={inputClass} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Fecha *">
                    <input name="session_date" type="date" className={inputClass} />
                  </Field>
                  <Field label="Hora de inicio *">
                    <input name="start_time" type="time" className={inputClass} />
                  </Field>
                </div>
                <Field label="Hora de finalización">
                  <input name="end_time" type="time" className={inputClass} />
                </Field>
                <Field label="Lugar">
                  <input name="location" placeholder="Ej. Cancha principal" className={inputClass} />
                </Field>
                <Field label="Notas">
                  <textarea name="notes" rows={3} placeholder="Objetivo de la sesión, observaciones…" className={inputClass} />
                </Field>
              </div>

              {state.error ? (
                <p className="mt-4 rounded-xl bg-jaguar-maroon-500/8 px-3.5 py-2.5 text-[13px] lg:text-[14px] font-medium text-jaguar-maroon-600">
                  {state.error}
                </p>
              ) : null}

              <div className="sticky bottom-0 -mx-6 mt-6 flex items-center justify-between border-t border-jaguar-ink/6 bg-white px-6 py-4">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className={`${labelClass} rounded-xl px-4 py-2.5 transition-colors hover:bg-jaguar-ink/[0.04]`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex items-center gap-2 rounded-xl bg-jaguar-green-600 px-4 py-2.5 text-[13.5px] lg:text-[15px] font-semibold text-white transition-colors hover:bg-jaguar-green-700 disabled:opacity-60"
                >
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} aria-hidden /> : null}
                  {isPending ? "Guardando…" : "Crear sesión"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
