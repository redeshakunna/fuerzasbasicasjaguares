"use client";

import { useActionState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { registerMatchResult, type MatchFormState } from "@/app/plataforma/(dashboard)/partidos/actions";
import type { MatchRow } from "@/lib/data/matches";

const initialState: MatchFormState = {};

/** Registro de resultado — opcional, breve, nunca bloquea al entrenador. */
export function RegisterResultForm({ match, onDone }: { match: MatchRow; onDone?: () => void }) {
  const action = registerMatchResult.bind(null, match.id);
  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) onDone?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  return (
    <form action={formAction} className="space-y-3">
      <p className="text-[12.5px] lg:text-[13.5px] font-bold text-jaguar-ink/70">Registrar resultado</p>
      <div className="grid grid-cols-2 gap-3">
        <label className="text-[11.5px] lg:text-[12.5px] font-semibold text-jaguar-ink/60">
          Goles Jaguares
          <input
            type="number"
            name="our_score"
            min={0}
            defaultValue={match.our_score ?? ""}
            className="mt-1 w-full rounded-lg border border-jaguar-ink/10 bg-jaguar-mist/40 px-2.5 py-2 text-[13px] lg:text-[14px] text-jaguar-ink focus:outline-none"
          />
        </label>
        <label className="text-[11.5px] lg:text-[12.5px] font-semibold text-jaguar-ink/60">
          Goles rival
          <input
            type="number"
            name="opponent_score"
            min={0}
            defaultValue={match.opponent_score ?? ""}
            className="mt-1 w-full rounded-lg border border-jaguar-ink/10 bg-jaguar-mist/40 px-2.5 py-2 text-[13px] lg:text-[14px] text-jaguar-ink focus:outline-none"
          />
        </label>
      </div>
      <label className="block text-[11.5px] lg:text-[12.5px] font-semibold text-jaguar-ink/60">
        Competencia
        <input
          type="text"
          name="competition"
          defaultValue={match.competition ?? ""}
          placeholder="Ej. Liga Infantil de Córdoba"
          className="mt-1 w-full rounded-lg border border-jaguar-ink/10 bg-jaguar-mist/40 px-2.5 py-2 text-[13px] lg:text-[14px] text-jaguar-ink focus:outline-none"
        />
      </label>
      {state.error ? <p className="text-[12px] lg:text-[13px] font-medium text-jaguar-maroon-600">{state.error}</p> : null}
      <button
        type="submit"
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-jaguar-ink px-4 py-2.5 text-[12.5px] lg:text-[13.5px] font-semibold text-white transition-colors hover:bg-jaguar-ink/85 disabled:opacity-60"
      >
        {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2.5} aria-hidden /> : null}
        {isPending ? "Guardando…" : "Guardar resultado"}
      </button>
    </form>
  );
}
