"use client";

import { useEffect } from "react";
import type { SessionPlan } from "@/lib/training/session-types";
import type { TrainingRow } from "@/lib/data/trainings";

const monthShort = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function formatDate(value: string) {
  const parts = value.split("-");
  return `${Number(parts[2])} de ${monthShort[Number(parts[1]) - 1]} de ${parts[0]}`;
}

export function PrintSession({ training, session }: { training: TrainingRow; session: SessionPlan }) {
  useEffect(() => {
    const timer = setTimeout(() => window.print(), 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="mx-auto max-w-[820px] text-jaguar-ink print:max-w-none">
      <div className="flex items-center gap-5 rounded-b-2xl bg-jaguar-green-600 px-8 py-7 text-white print:rounded-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/logo-fuerzas-basicas.png"
          alt="Fuerzas Básicas Jaguares de Córdoba"
          className="h-16 w-16 shrink-0 object-contain drop-shadow-sm"
        />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] lg:text-[12px] font-bold uppercase tracking-[0.12em] text-white/75">
            Fuerzas Básicas Jaguares de Córdoba
          </p>
          <h1 className="mt-0.5 truncate text-[24px] font-extrabold leading-tight">{training.title}</h1>
          <p className="mt-0.5 text-[12.5px] lg:text-[13.5px] font-medium text-white/80">Plan de sesión de entrenamiento</p>
        </div>
        <div className="shrink-0 rounded-xl bg-white/12 px-4 py-2.5 text-right text-[12px] lg:text-[13px] leading-relaxed">
          <p className="text-[13px] lg:text-[14px] font-extrabold">{training.category}</p>
          <p className="text-white/85">{formatDate(training.session_date)}</p>
          <p className="text-white/85">
            {training.start_time.slice(0, 5)} {training.end_time ? `– ${training.end_time.slice(0, 5)}` : ""}
          </p>
        </div>
      </div>

      {training.location ? (
        <p className="border-b border-jaguar-ink/8 bg-jaguar-mist/60 px-8 py-2.5 text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-ink/70 print:bg-transparent">
          📍 {training.location}
        </p>
      ) : null}

      <div className="px-8 py-8 print:px-0">

      <section className="mt-5">
        <h2 className="text-[13px] lg:text-[14px] font-bold uppercase tracking-[0.03em] text-jaguar-ink/50">Objetivo general</h2>
        <p className="mt-1 text-[13.5px] lg:text-[15px] leading-relaxed">{session.generalObjective}</p>
        {session.specificObjectives.length > 0 ? (
          <ul className="mt-2 list-disc pl-5 text-[12.5px] lg:text-[13.5px] leading-relaxed text-jaguar-ink/75">
            {session.specificObjectives.map((o, i) => <li key={i}>{o}</li>)}
          </ul>
        ) : null}
      </section>

      <section className="mt-5 break-inside-avoid">
        <h2 className="text-[13px] lg:text-[14px] font-bold uppercase tracking-[0.03em] text-jaguar-ink/50">
          Calentamiento · {session.warmup.durationMin} min
        </h2>
        <p className="mt-1 text-[12.5px] lg:text-[13.5px] leading-relaxed">{session.warmup.description}</p>
        {session.warmup.organization ? (
          <p className="mt-1 text-[12px] lg:text-[13px] text-jaguar-ink/60"><strong>Organización:</strong> {session.warmup.organization}</p>
        ) : null}
      </section>

      {session.exercises.map((ex, i) => (
        <section key={i} className="mt-5 break-inside-avoid">
          <h2 className="text-[13px] lg:text-[14px] font-bold uppercase tracking-[0.03em] text-jaguar-ink/50">
            Ejercicio {i + 1}: {ex.name} · {ex.durationMin} min
          </h2>
          <p className="mt-1 text-[12.5px] lg:text-[13.5px] leading-relaxed">{ex.description}</p>
          <p className="mt-1 text-[12px] lg:text-[13px] text-jaguar-ink/60"><strong>Organización:</strong> {ex.organization}</p>
          <p className="text-[12px] lg:text-[13px] text-jaguar-ink/60"><strong>Objetivo:</strong> {ex.objective}</p>
          <div className="mt-1.5 grid grid-cols-3 gap-3 text-[11.5px] lg:text-[12.5px] text-jaguar-ink/65">
            <div><strong>Correcciones:</strong> {ex.coachCorrections.join("; ") || "—"}</div>
            <div><strong>Errores comunes:</strong> {ex.commonMistakes.join("; ") || "—"}</div>
            <div><strong>Variantes:</strong> {ex.variants.join("; ") || "—"}</div>
          </div>
        </section>
      ))}

      <section className="mt-5 break-inside-avoid">
        <h2 className="text-[13px] lg:text-[14px] font-bold uppercase tracking-[0.03em] text-jaguar-ink/50">
          Partido aplicado · {session.appliedMatch.durationMin} min
        </h2>
        <p className="mt-1 text-[12.5px] lg:text-[13.5px] leading-relaxed">
          <strong>Organización:</strong> {session.appliedMatch.organization} — <strong>Reglas:</strong> {session.appliedMatch.rules}
        </p>
      </section>

      <section className="mt-5 break-inside-avoid">
        <h2 className="text-[13px] lg:text-[14px] font-bold uppercase tracking-[0.03em] text-jaguar-ink/50">
          Vuelta a la calma · {session.cooldown.durationMin} min
        </h2>
        <p className="mt-1 text-[12.5px] lg:text-[13.5px] leading-relaxed">{session.cooldown.description}</p>
      </section>

      {session.indicators.length > 0 ? (
        <section className="mt-5 break-inside-avoid">
          <h2 className="text-[13px] lg:text-[14px] font-bold uppercase tracking-[0.03em] text-jaguar-ink/50">Indicadores a evaluar</h2>
          <p className="mt-1 text-[12.5px] lg:text-[13.5px]">{session.indicators.map((i) => `✔ ${i}`).join("   ")}</p>
        </section>
      ) : null}

      {session.observations ? (
        <section className="mt-5 break-inside-avoid">
          <h2 className="text-[13px] lg:text-[14px] font-bold uppercase tracking-[0.03em] text-jaguar-ink/50">Observaciones</h2>
          <p className="mt-1 text-[12.5px] lg:text-[13.5px] leading-relaxed">{session.observations}</p>
        </section>
      ) : null}

      <p className="mt-8 text-center text-[11px] lg:text-[12px] text-jaguar-ink/35">
        Fuerzas Básicas Jaguares de Córdoba — Formamos talento, construimos sueños.
      </p>
      </div>
    </div>
  );
}
