"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardHeader } from "../ui/Card";
import { Field, inputClass } from "../jugadores/FormField";
import { updateMatch, type MatchFormState } from "@/app/plataforma/(dashboard)/partidos/actions";
import { categories } from "@/lib/data/categories";
import type { MatchRow } from "@/lib/data/matches";

const initialState: MatchFormState = {};

export function MatchDetailForm({ match }: { match: MatchRow }) {
  const updateMatchWithId = updateMatch.bind(null, match.id);
  const [state, formAction, isPending] = useActionState(updateMatchWithId, initialState);

  return (
    <Card>
      <CardHeader title="Detalle del partido" subtitle="Edita los datos y registra el resultado al terminar." />
      <form action={formAction} className="space-y-4 px-6 pb-6 pt-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Categoría *">
            <select name="category" defaultValue={match.category} className={inputClass}>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
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
            <input name="competition" defaultValue={match.competition ?? ""} placeholder="Ej. Liga Infantil de Córdoba" className={inputClass} />
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
        {state.success ? <p className="text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-green-600">Guardado ✓</p> : null}

        <div className="flex justify-end">
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
    </Card>
  );
}
