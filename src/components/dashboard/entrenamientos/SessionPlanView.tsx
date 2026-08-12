import { Dumbbell, Flag, ListChecks, MessageSquare, ShieldCheck, Timer, Wind } from "lucide-react";
import { Card, CardHeader } from "../ui/Card";
import { Badge } from "../ui/Badge";
import type { SessionExercise, SessionPlan } from "@/lib/training/session-types";

function MinutesPill({ minutes }: { minutes: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-jaguar-ink/6 px-2.5 py-1 text-[11.5px] lg:text-[12.5px] font-bold text-jaguar-ink/60">
      <Timer className="h-3 w-3" strokeWidth={2.5} aria-hidden />
      {minutes} min
    </span>
  );
}

function MaterialChips({ material }: { material: string[] }) {
  if (material.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {material.map((m) => (
        <span key={m} className="rounded-full bg-jaguar-turquoise-500/10 px-2 py-0.5 text-[11px] lg:text-[12px] font-semibold text-jaguar-turquoise-600">
          {m}
        </span>
      ))}
    </div>
  );
}

function ExerciseCard({ index, exercise }: { index: number; exercise: SessionExercise }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-5 p-6 sm:flex-row">
        <div className="flex h-24 w-full shrink-0 items-center justify-center rounded-xl border border-dashed border-jaguar-ink/15 bg-jaguar-mist/60 sm:w-32">
          <Dumbbell className="h-8 w-8 text-jaguar-ink/20" strokeWidth={1.5} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-jaguar-green-600 text-[11px] lg:text-[12px] font-extrabold text-white">
              {index}
            </span>
            <h4 className="text-[14.5px] lg:text-[16px] font-extrabold text-jaguar-ink">{exercise.name}</h4>
            <MinutesPill minutes={exercise.durationMin} />
          </div>
          <p className="mt-2.5 text-[13px] lg:text-[14px] leading-relaxed text-jaguar-ink/65">{exercise.description}</p>
          <p className="mt-2 text-[12.5px] lg:text-[13.5px] text-jaguar-ink/50">
            <span className="font-semibold text-jaguar-ink/70">Organización: </span>
            {exercise.organization}
          </p>
          <p className="mt-1 text-[12.5px] lg:text-[13.5px] text-jaguar-ink/50">
            <span className="font-semibold text-jaguar-ink/70">Objetivo: </span>
            {exercise.objective}
          </p>
          <MaterialChips material={exercise.material} />

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <p className="text-[11px] lg:text-[12px] font-bold uppercase tracking-[0.03em] text-jaguar-green-600">Correcciones</p>
              <ul className="mt-1 space-y-0.5 text-[12px] lg:text-[13px] text-jaguar-ink/60">
                {exercise.coachCorrections.map((c, i) => <li key={i}>• {c}</li>)}
              </ul>
            </div>
            <div>
              <p className="text-[11px] lg:text-[12px] font-bold uppercase tracking-[0.03em] text-jaguar-maroon-600">Errores comunes</p>
              <ul className="mt-1 space-y-0.5 text-[12px] lg:text-[13px] text-jaguar-ink/60">
                {exercise.commonMistakes.map((c, i) => <li key={i}>• {c}</li>)}
              </ul>
            </div>
            <div>
              <p className="text-[11px] lg:text-[12px] font-bold uppercase tracking-[0.03em] text-jaguar-turquoise-600">Variantes</p>
              <ul className="mt-1 space-y-0.5 text-[12px] lg:text-[13px] text-jaguar-ink/60">
                {exercise.variants.map((c, i) => <li key={i}>• {c}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

/** Sesión completa generada por el Wizard — vista de lectura para la pantalla de resumen. */
export function SessionPlanView({ session }: { session: SessionPlan }) {
  return (
    <div id="sesion" className="space-y-5">
      <Card className="p-6">
        <div className="flex items-center gap-2.5">
          <Flag className="h-4 w-4 text-jaguar-green-600" strokeWidth={2.25} aria-hidden />
          <p className="text-[12px] lg:text-[13px] font-bold uppercase tracking-[0.03em] text-jaguar-ink/45">Objetivo general</p>
        </div>
        <p className="mt-2 text-[14px] lg:text-[15.5px] leading-relaxed text-jaguar-ink/75">{session.generalObjective}</p>

        {session.specificObjectives.length > 0 ? (
          <div className="mt-4 border-t border-jaguar-ink/6 pt-4">
            <p className="text-[11.5px] lg:text-[12.5px] font-bold uppercase tracking-[0.03em] text-jaguar-ink/40">Objetivos específicos</p>
            <ul className="mt-2 space-y-1 text-[13px] lg:text-[14px] text-jaguar-ink/65">
              {session.specificObjectives.map((o, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-jaguar-green-600">•</span>
                  {o}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Card>

      <Card>
        <CardHeader title="Calentamiento" subtitle={`${session.warmup.durationMin} minutos`} />
        <div className="px-6 pb-6 pt-3">
          <p className="text-[13px] lg:text-[14px] leading-relaxed text-jaguar-ink/65">{session.warmup.description || "Pendiente por definir."}</p>
          {session.warmup.organization ? (
            <p className="mt-2 text-[12.5px] lg:text-[13.5px] text-jaguar-ink/50">
              <span className="font-semibold text-jaguar-ink/70">Organización: </span>
              {session.warmup.organization}
            </p>
          ) : null}
          <MaterialChips material={session.warmup.material} />
        </div>
      </Card>

      <div>
        <p className="mb-3 flex items-center gap-2 text-[12px] lg:text-[13px] font-bold uppercase tracking-[0.03em] text-jaguar-ink/45">
          <ListChecks className="h-4 w-4" strokeWidth={2.25} aria-hidden />
          Parte principal
        </p>
        <div className="space-y-4">
          {session.exercises.map((ex, i) => (
            <ExerciseCard key={i} index={i + 1} exercise={ex} />
          ))}
        </div>
      </div>

      <Card>
        <CardHeader title="Partido aplicado" subtitle={`${session.appliedMatch.durationMin} minutos`} />
        <div className="px-6 pb-6 pt-3 space-y-1.5">
          <p className="text-[13px] lg:text-[14px] text-jaguar-ink/65">
            <span className="font-semibold text-jaguar-ink/75">Organización: </span>
            {session.appliedMatch.organization || "Pendiente por definir."}
          </p>
          <p className="text-[13px] lg:text-[14px] text-jaguar-ink/65">
            <span className="font-semibold text-jaguar-ink/75">Reglas: </span>
            {session.appliedMatch.rules || "—"}
          </p>
          <p className="text-[13px] lg:text-[14px] text-jaguar-ink/65">
            <span className="font-semibold text-jaguar-ink/75">Objetivo: </span>
            {session.appliedMatch.objective || "—"}
          </p>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2.5 px-6 pt-6">
          <Wind className="h-4 w-4 text-jaguar-turquoise-600" strokeWidth={2.25} aria-hidden />
          <p className="text-[12px] lg:text-[13px] font-bold uppercase tracking-[0.03em] text-jaguar-ink/45">
            Vuelta a la calma · {session.cooldown.durationMin} min
          </p>
        </div>
        <p className="px-6 pb-6 pt-2 text-[13px] lg:text-[14px] leading-relaxed text-jaguar-ink/65">
          {session.cooldown.description || "Pendiente por definir."}
        </p>
      </Card>

      {session.indicators.length > 0 ? (
        <Card className="p-6">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-4 w-4 text-jaguar-green-600" strokeWidth={2.25} aria-hidden />
            <p className="text-[12px] lg:text-[13px] font-bold uppercase tracking-[0.03em] text-jaguar-ink/45">Indicadores a evaluar</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {session.indicators.map((ind) => (
              <Badge key={ind} tone="green">✔ {ind}</Badge>
            ))}
          </div>
        </Card>
      ) : null}

      {session.observations ? (
        <Card className="p-6">
          <div className="flex items-center gap-2.5">
            <MessageSquare className="h-4 w-4 text-jaguar-ink/40" strokeWidth={2.25} aria-hidden />
            <p className="text-[12px] lg:text-[13px] font-bold uppercase tracking-[0.03em] text-jaguar-ink/45">Observaciones</p>
          </div>
          <p className="mt-2 text-[13px] lg:text-[14px] leading-relaxed text-jaguar-ink/60">{session.observations}</p>
        </Card>
      ) : null}
    </div>
  );
}
