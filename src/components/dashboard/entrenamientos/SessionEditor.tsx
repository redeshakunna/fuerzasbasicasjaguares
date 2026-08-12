"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { Card, CardHeader } from "../ui/Card";
import { Field, inputClass, labelClass } from "../jugadores/FormField";
import { updateTrainingSession } from "@/app/plataforma/(dashboard)/entrenamientos/actions";
import { indicatorPool } from "@/lib/training/session-types";
import type { SessionExercise, SessionPlan } from "@/lib/training/session-types";

const textareaClass = inputClass;

function linesToList(value: string): string[] {
  return value
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function listToLines(value: string[]): string {
  return value.join("\n");
}

export function SessionEditor({ trainingId, initialSession }: { trainingId: string; initialSession: SessionPlan }) {
  const router = useRouter();
  const [session, setSession] = useState<SessionPlan>(initialSession);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function updateExercise(index: number, patch: Partial<SessionExercise>) {
    setSession((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex, i) => (i === index ? { ...ex, ...patch } : ex)),
    }));
  }

  function toggleIndicator(indicator: string) {
    setSession((prev) => ({
      ...prev,
      indicators: prev.indicators.includes(indicator)
        ? prev.indicators.filter((i) => i !== indicator)
        : [...prev.indicators, indicator],
    }));
  }

  function handleSave() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateTrainingSession(trainingId, session);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSaved(true);
    });
  }

  return (
    <div className="space-y-5">
      <Card className="p-6">
        <p className={labelClass}>Objetivo general</p>
        <textarea
          rows={2}
          value={session.generalObjective}
          onChange={(e) => setSession((p) => ({ ...p, generalObjective: e.target.value }))}
          className={`${textareaClass} mt-2`}
        />
        <p className={`${labelClass} mt-4`}>Objetivos específicos (uno por línea)</p>
        <textarea
          rows={3}
          value={listToLines(session.specificObjectives)}
          onChange={(e) => setSession((p) => ({ ...p, specificObjectives: linesToList(e.target.value) }))}
          className={`${textareaClass} mt-2`}
        />
      </Card>

      <Card>
        <CardHeader title="Calentamiento" />
        <div className="grid grid-cols-1 gap-3 px-6 pb-6 pt-3 sm:grid-cols-[100px_1fr]">
          <Field label="Minutos">
            <input
              type="number"
              min={0}
              value={session.warmup.durationMin}
              onChange={(e) => setSession((p) => ({ ...p, warmup: { ...p.warmup, durationMin: Number(e.target.value) } }))}
              className={inputClass}
            />
          </Field>
          <Field label="Descripción">
            <textarea
              rows={2}
              value={session.warmup.description}
              onChange={(e) => setSession((p) => ({ ...p, warmup: { ...p.warmup, description: e.target.value } }))}
              className={textareaClass}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Organización">
              <input
                value={session.warmup.organization}
                onChange={(e) => setSession((p) => ({ ...p, warmup: { ...p.warmup, organization: e.target.value } }))}
                className={inputClass}
              />
            </Field>
          </div>
        </div>
      </Card>

      {session.exercises.map((ex, i) => (
        <Card key={i}>
          <CardHeader title={`Ejercicio ${i + 1}`} />
          <div className="grid grid-cols-1 gap-3 px-6 pb-6 pt-3 sm:grid-cols-[1fr_100px]">
            <Field label="Nombre">
              <input value={ex.name} onChange={(e) => updateExercise(i, { name: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Minutos">
              <input
                type="number"
                min={0}
                value={ex.durationMin}
                onChange={(e) => updateExercise(i, { durationMin: Number(e.target.value) })}
                className={inputClass}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Descripción">
                <textarea rows={2} value={ex.description} onChange={(e) => updateExercise(i, { description: e.target.value })} className={textareaClass} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Organización">
                <input value={ex.organization} onChange={(e) => updateExercise(i, { organization: e.target.value })} className={inputClass} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Objetivo">
                <input value={ex.objective} onChange={(e) => updateExercise(i, { objective: e.target.value })} className={inputClass} />
              </Field>
            </div>
            <div className="sm:col-span-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field label="Correcciones (una por línea)">
                <textarea
                  rows={3}
                  value={listToLines(ex.coachCorrections)}
                  onChange={(e) => updateExercise(i, { coachCorrections: linesToList(e.target.value) })}
                  className={textareaClass}
                />
              </Field>
              <Field label="Errores comunes">
                <textarea
                  rows={3}
                  value={listToLines(ex.commonMistakes)}
                  onChange={(e) => updateExercise(i, { commonMistakes: linesToList(e.target.value) })}
                  className={textareaClass}
                />
              </Field>
              <Field label="Variantes">
                <textarea
                  rows={3}
                  value={listToLines(ex.variants)}
                  onChange={(e) => updateExercise(i, { variants: linesToList(e.target.value) })}
                  className={textareaClass}
                />
              </Field>
            </div>
          </div>
        </Card>
      ))}

      <Card>
        <CardHeader title="Partido aplicado" />
        <div className="grid grid-cols-1 gap-3 px-6 pb-6 pt-3 sm:grid-cols-[1fr_100px]">
          <Field label="Organización">
            <input
              value={session.appliedMatch.organization}
              onChange={(e) => setSession((p) => ({ ...p, appliedMatch: { ...p.appliedMatch, organization: e.target.value } }))}
              className={inputClass}
            />
          </Field>
          <Field label="Minutos">
            <input
              type="number"
              min={0}
              value={session.appliedMatch.durationMin}
              onChange={(e) => setSession((p) => ({ ...p, appliedMatch: { ...p.appliedMatch, durationMin: Number(e.target.value) } }))}
              className={inputClass}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Reglas">
              <input
                value={session.appliedMatch.rules}
                onChange={(e) => setSession((p) => ({ ...p, appliedMatch: { ...p.appliedMatch, rules: e.target.value } }))}
                className={inputClass}
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Objetivo">
              <input
                value={session.appliedMatch.objective}
                onChange={(e) => setSession((p) => ({ ...p, appliedMatch: { ...p.appliedMatch, objective: e.target.value } }))}
                className={inputClass}
              />
            </Field>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Vuelta a la calma" />
        <div className="grid grid-cols-1 gap-3 px-6 pb-6 pt-3 sm:grid-cols-[100px_1fr]">
          <Field label="Minutos">
            <input
              type="number"
              min={0}
              value={session.cooldown.durationMin}
              onChange={(e) => setSession((p) => ({ ...p, cooldown: { ...p.cooldown, durationMin: Number(e.target.value) } }))}
              className={inputClass}
            />
          </Field>
          <Field label="Descripción">
            <textarea
              rows={2}
              value={session.cooldown.description}
              onChange={(e) => setSession((p) => ({ ...p, cooldown: { ...p.cooldown, description: e.target.value } }))}
              className={textareaClass}
            />
          </Field>
        </div>
      </Card>

      <Card className="p-6">
        <p className={labelClass}>Indicadores a evaluar</p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {indicatorPool.map((ind) => {
            const checked = session.indicators.includes(ind);
            return (
              <button
                key={ind}
                type="button"
                onClick={() => toggleIndicator(ind)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] lg:text-[13px] font-semibold transition-colors ${
                  checked ? "border-jaguar-green-500 bg-jaguar-green-50 text-jaguar-green-700" : "border-jaguar-ink/10 text-jaguar-ink/55"
                }`}
              >
                {checked ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
                {ind}
              </button>
            );
          })}
        </div>

        <p className={`${labelClass} mt-5`}>Observaciones</p>
        <textarea
          rows={3}
          value={session.observations}
          onChange={(e) => setSession((p) => ({ ...p, observations: e.target.value }))}
          className={`${textareaClass} mt-2`}
        />
      </Card>

      {error ? (
        <p className="rounded-xl bg-jaguar-maroon-500/8 px-4 py-3 text-[13px] lg:text-[14px] font-medium text-jaguar-maroon-600">{error}</p>
      ) : null}

      <div className="sticky bottom-4 flex items-center justify-end gap-3 rounded-2xl border border-jaguar-ink/10 bg-white p-3 shadow-lg">
        {saved ? <span className="text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-green-600">Guardado ✓</span> : null}
        <button
          type="button"
          onClick={() => router.push(`/plataforma/entrenamientos/${trainingId}`)}
          className="rounded-xl px-4 py-2.5 text-[13.5px] lg:text-[15px] font-semibold text-jaguar-ink/60 hover:bg-jaguar-ink/[0.04]"
        >
          Volver
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="flex items-center gap-2 rounded-xl bg-jaguar-green-600 px-5 py-2.5 text-[13.5px] lg:text-[15px] font-semibold text-white hover:bg-jaguar-green-700 disabled:opacity-60"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} aria-hidden /> : null}
          {isPending ? "Guardando…" : "Guardar sesión"}
        </button>
      </div>
    </div>
  );
}
