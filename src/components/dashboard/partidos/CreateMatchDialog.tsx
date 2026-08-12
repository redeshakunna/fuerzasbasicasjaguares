"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { createMatch, type MatchFormState } from "@/app/plataforma/(dashboard)/partidos/actions";
import { categories, defaultCategory, type Category } from "@/lib/data/categories";
import { Field, inputClass, labelClass } from "../jugadores/FormField";

const initialState: MatchFormState = {};

/** Botón "Nuevo partido" + modal para programar un partido. */
export function CreateMatchDialog({ initialCategory }: { initialCategory?: Category } = {}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createMatch, initialState);
  const [isHome, setIsHome] = useState(true);
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
        Nuevo partido
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-jaguar-ink/40 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-[480px] flex-col rounded-[18px] bg-white shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-6">
              <h2 className="text-[17px] lg:text-[18.5px] font-extrabold text-jaguar-ink">Nuevo partido</h2>
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
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Categoría *">
                    <select name="category" defaultValue={initialCategory ?? defaultCategory} className={inputClass}>
                      {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Rival *">
                    <input name="opponent" placeholder="Ej. Once Caldas" className={inputClass} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Fecha *">
                    <input name="match_date" type="date" className={inputClass} />
                  </Field>
                  <Field label="Hora">
                    <input name="match_time" type="time" className={inputClass} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Lugar">
                    <input name="location" placeholder="Ej. Estadio Jaraguay" className={inputClass} />
                  </Field>
                  <Field label="Competencia">
                    <input name="competition" placeholder="Ej. Liga Infantil de Córdoba" className={inputClass} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Condición">
                    <select
                      value={isHome ? "true" : "false"}
                      onChange={(e) => setIsHome(e.target.value === "true")}
                      className={inputClass}
                    >
                      <option value="true">Local</option>
                      <option value="false">Visitante</option>
                    </select>
                    <input type="hidden" name="is_home" value={isHome ? "true" : "false"} />
                  </Field>
                  <Field label="Estado">
                    <select name="status" defaultValue="Por confirmar" className={inputClass}>
                      <option value="Confirmado">Confirmado</option>
                      <option value="Por confirmar">Por confirmar</option>
                    </select>
                  </Field>
                </div>
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
                  {isPending ? "Guardando…" : "Crear partido"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
