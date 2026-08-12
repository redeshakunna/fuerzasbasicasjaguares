"use client";

import { useActionState, useEffect } from "react";
import { Loader2, X } from "lucide-react";
import { Field, inputClass } from "../jugadores/FormField";
import { updateMatch, type MatchFormState } from "@/app/plataforma/(dashboard)/partidos/actions";
import { categories } from "@/lib/data/categories";
import type { MatchRow } from "@/lib/data/matches";

const initialState: MatchFormState = {};

/** Edición de partido en ventana central grande — sin salir de la convocatoria para editar los datos. */
export function EditMatchDialog({ match, onClose }: { match: MatchRow; onClose: () => void }) {
  const updateMatchWithId = updateMatch.bind(null, match.id);
  const [state, formAction, isPending] = useActionState(updateMatchWithId, initialState);

  useEffect(() => {
    if (state.success) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-jaguar-ink/40 p-4 backdrop-blur-sm">
      <form action={formAction} className="flex max-h-[90vh] w-full max-w-[720px] flex-col rounded-[18px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-jaguar-ink/6 px-6 py-5">
          <div>
            <h2 className="text-[17px] lg:text-[18.5px] font-extrabold text-jaguar-ink">Editar partido</h2>
            <p className="mt-0.5 text-[13px] lg:text-[14px] text-jaguar-ink/50">
              {match.is_home ? "Jaguares vs. " : "vs. "}
              {match.opponent} · {match.category}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-jaguar-ink/40 hover:bg-jaguar-ink/[0.05]"
          >
            <X className="h-4 w-4" strokeWidth={2} aria-hidden />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Categoría *">
                <select name="category" defaultValue={match.category} className={inputClass}>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Rival *">
                <input name="opponent" defaultValue={match.opponent} className={inputClass} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Fecha *">
                <input name="match_date" type="date" defaultValue={match.match_date} className={inputClass} />
              </Field>
              <Field label="Hora">
                <input name="match_time" type="time" defaultValue={match.match_time ?? ""} className={inputClass} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Lugar">
                <input name="location" defaultValue={match.location ?? ""} className={inputClass} />
              </Field>
              <Field label="Competencia">
                <input
                  name="competition"
                  defaultValue={match.competition ?? ""}
                  placeholder="Ej. Liga Infantil de Córdoba"
                  className={inputClass}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Condición">
                <select name="is_home" defaultValue={match.is_home ? "true" : "false"} className={inputClass}>
                  <option value="true">Local</option>
                  <option value="false">Visitante</option>
                </select>
              </Field>
              <Field label="Estado">
                <select name="status" defaultValue={match.status} className={inputClass}>
                  <option value="Confirmado">Confirmado</option>
                  <option value="Por confirmar">Por confirmar</option>
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Goles Jaguares">
                <input name="our_score" type="number" min={0} defaultValue={match.our_score ?? ""} className={inputClass} />
              </Field>
              <Field label="Goles rival">
                <input name="opponent_score" type="number" min={0} defaultValue={match.opponent_score ?? ""} className={inputClass} />
              </Field>
              <Field label="Nota del resultado">
                <input name="result" defaultValue={match.result ?? ""} placeholder="Ej. 3-1 (penales)" className={inputClass} />
              </Field>
            </div>

            {state.error ? (
              <p className="rounded-xl bg-jaguar-maroon-500/8 px-3.5 py-2.5 text-[13px] lg:text-[14px] font-medium text-jaguar-maroon-600">{state.error}</p>
            ) : null}
          </div>
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
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 rounded-xl bg-jaguar-green-600 px-5 py-2.5 text-[13.5px] lg:text-[15px] font-semibold text-white transition-colors hover:bg-jaguar-green-700 disabled:opacity-60"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} aria-hidden /> : null}
            {isPending ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
