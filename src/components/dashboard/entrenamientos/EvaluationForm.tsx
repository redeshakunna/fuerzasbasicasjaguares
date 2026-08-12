"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Loader2, User } from "lucide-react";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import {
  evaluationCategories,
  evaluationCategoryLabel,
  skillsByCategory,
  averageForCategory,
  overallAverage,
  type EvaluationCategory,
} from "@/lib/data/evaluation-skills";
import { saveEvaluationAndGoTo, type SaveEvaluationState } from "@/app/plataforma/(dashboard)/entrenamientos/actions";
import type { Tables } from "@/lib/supabase/database.types";

type PlayerRow = Tables<"players">;

const initialState: SaveEvaluationState = {};

const ringToneByScore = (score: number | null) => {
  if (score === null) return "stroke-jaguar-ink/15";
  if (score >= 7.5) return "stroke-jaguar-green-500";
  if (score >= 5) return "stroke-jaguar-gold-500";
  return "stroke-jaguar-maroon-500";
};

interface EvaluationFormProps {
  trainingId: string;
  trainingTitle: string;
  player: PlayerRow;
  age: number;
  imc: number | null;
  initialScores: Record<string, number>;
  initialNotes: string;
  prevPath: string | null;
  nextPath: string;
  isLastPlayer: boolean;
}

export function EvaluationForm({
  trainingId,
  trainingTitle,
  player,
  age,
  imc,
  initialScores,
  initialNotes,
  prevPath,
  nextPath,
  isLastPlayer,
}: EvaluationFormProps) {
  const [scores, setScores] = useState<Record<string, number>>(initialScores);
  const [notes, setNotes] = useState(initialNotes);
  const [activeTab, setActiveTab] = useState<EvaluationCategory | "Observaciones">("Técnica");

  const boundAction = useMemo(
    () => saveEvaluationAndGoTo.bind(null, trainingId, player.id, nextPath),
    [trainingId, player.id, nextPath]
  );
  const [state, formAction, isPending] = useActionState(boundAction, initialState);

  const categoryAverages = useMemo(() => {
    const entries = evaluationCategories.map((cat) => [cat, averageForCategory(scores, cat)] as const);
    return Object.fromEntries(entries) as Record<EvaluationCategory, number | null>;
  }, [scores]);

  const overall = overallAverage(evaluationCategories.map((cat) => categoryAverages[cat]));
  const circumference = 2 * Math.PI * 42;
  const progress = overall !== null ? (overall / 10) * circumference : 0;

  function setScore(skillId: string, value: number) {
    setScores((prev) => ({ ...prev, [skillId]: value }));
  }

  const fullName = `${player.first_name} ${player.last_name}`.trim();

  return (
    <form action={formAction} className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
      <div className="space-y-6">
        {/* Encabezado del jugador */}
        <Card className="p-6">
          <div className="flex flex-wrap items-center gap-5">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-jaguar-mist ring-1 ring-jaguar-ink/8">
              {player.photo_url ? (
                <Image src={player.photo_url} alt={fullName} fill sizes="64px" className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <User className="h-7 w-7 text-jaguar-ink/20" strokeWidth={1.5} aria-hidden />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-[17px] lg:text-[18.5px] font-extrabold text-jaguar-ink">{fullName}</h2>
                {player.nickname ? (
                  <span className="text-[13px] lg:text-[14px] font-semibold italic text-jaguar-green-600/80">
                    &ldquo;{player.nickname}&rdquo;
                  </span>
                ) : null}
              </div>
              <p className="mt-0.5 text-[12.5px] lg:text-[13.5px] text-jaguar-ink/50">
                {player.jersey_number ? `#${player.jersey_number} · ` : ""}
                {player.position} · {age} años
              </p>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-[12px] lg:text-[13px] text-jaguar-ink/55">
              <span>
                <span className="text-jaguar-ink/40">Pie: </span>
                <span className="font-semibold text-jaguar-ink">{player.dominant_foot ?? "—"}</span>
              </span>
              <span>
                <span className="text-jaguar-ink/40">Altura: </span>
                <span className="font-semibold text-jaguar-ink">
                  {player.height_cm ? `${(player.height_cm / 100).toFixed(2)} m` : "—"}
                </span>
              </span>
              <span>
                <span className="text-jaguar-ink/40">Peso: </span>
                <span className="font-semibold text-jaguar-ink">
                  {player.weight_kg ? `${player.weight_kg} kg` : "—"}
                </span>
              </span>
              <span>
                <span className="text-jaguar-ink/40">IMC: </span>
                <span className="font-semibold text-jaguar-ink">{imc !== null ? imc.toFixed(1) : "—"}</span>
              </span>
            </div>
          </div>
          <p className="mt-3 text-[12px] lg:text-[13px] text-jaguar-ink/40">Sesión: {trainingTitle}</p>
        </Card>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 rounded-2xl border border-jaguar-ink/8 bg-white p-1.5">
          {[...evaluationCategories, "Observaciones" as const].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex-1 rounded-xl px-3 py-2 text-[12.5px] lg:text-[13.5px] font-semibold transition-colors ${
                activeTab === tab
                  ? "bg-jaguar-green-600 text-white"
                  : "text-jaguar-ink/55 hover:bg-jaguar-mist/60"
              }`}
            >
              {tab === "Observaciones" ? "Observaciones" : evaluationCategoryLabel[tab]}
              {tab !== "Observaciones" && categoryAverages[tab] !== null ? (
                <span className="ml-1.5 opacity-70">{categoryAverages[tab]!.toFixed(1)}</span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Contenido de la pestaña */}
        <Card className="p-6">
          {activeTab === "Observaciones" ? (
            <div>
              <label className="text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-ink/70">Observaciones del técnico</label>
              <textarea
                rows={6}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Fortalezas, aspectos a mejorar, recomendaciones para el jugador…"
                className="mt-2 w-full rounded-xl border border-jaguar-ink/10 bg-jaguar-mist/40 px-3.5 py-2.5 text-[13.5px] lg:text-[15px] text-jaguar-ink placeholder:text-jaguar-ink/35 focus:border-jaguar-green-500/40 focus:outline-none focus:ring-2 focus:ring-jaguar-green-500/10"
              />
            </div>
          ) : (
            <div className="space-y-5">
              {skillsByCategory(activeTab).map((skill) => {
                const value = scores[skill.id] ?? 0;
                return (
                  <div key={skill.id}>
                    <div className="flex items-center justify-between">
                      <label htmlFor={skill.id} className="text-[13px] lg:text-[14px] font-medium text-jaguar-ink/75">
                        {skill.label}
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={10}
                        step={0.1}
                        value={value}
                        onChange={(e) => setScore(skill.id, Math.max(0, Math.min(10, Number(e.target.value))))}
                        className="w-16 rounded-lg border border-jaguar-ink/10 bg-jaguar-mist/40 px-2 py-1 text-center text-[13px] lg:text-[14px] font-bold text-jaguar-ink focus:border-jaguar-green-500/40 focus:outline-none focus:ring-2 focus:ring-jaguar-green-500/10"
                      />
                    </div>
                    <input
                      id={skill.id}
                      type="range"
                      min={0}
                      max={10}
                      step={0.1}
                      value={value}
                      onChange={(e) => setScore(skill.id, Number(e.target.value))}
                      className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-jaguar-ink/8 accent-jaguar-green-600"
                    />
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/*
          Inputs ocultos con el puntaje de TODAS las habilidades (no solo las
          de la pestaña activa) — así cambiar de pestaña nunca pierde lo ya
          calificado en las demás categorías al enviar el formulario.
        */}
        {evaluationCategories.flatMap((cat) =>
          skillsByCategory(cat).map((skill) => (
            <input key={skill.id} type="hidden" name={skill.id} value={scores[skill.id] ?? 0} />
          ))
        )}
        <input type="hidden" name="notes" value={notes} />

        {state.error ? (
          <p className="rounded-xl bg-jaguar-maroon-500/8 px-4 py-3 text-[13px] lg:text-[14px] font-medium text-jaguar-maroon-600">
            {state.error}
          </p>
        ) : null}

        {/* Navegación entre jugadores */}
        <div className="flex items-center justify-between">
          {prevPath ? (
            <Link
              href={prevPath}
              className="inline-flex items-center gap-1.5 rounded-xl border border-jaguar-ink/12 bg-white px-4 py-2.5 text-[13.5px] lg:text-[15px] font-semibold text-jaguar-ink/70 transition-colors hover:bg-jaguar-ink/[0.03]"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={2.25} aria-hidden />
              Anterior
            </Link>
          ) : (
            <span />
          )}
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 rounded-xl bg-jaguar-green-600 px-5 py-2.5 text-[13.5px] lg:text-[15px] font-semibold text-white transition-colors hover:bg-jaguar-green-700 disabled:opacity-60"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} aria-hidden /> : null}
            {isPending
              ? "Guardando…"
              : isLastPlayer
                ? "Guardar evaluación"
                : "Guardar y continuar"}
            {!isPending && !isLastPlayer ? <ChevronRight className="h-4 w-4" strokeWidth={2.25} aria-hidden /> : null}
          </button>
        </div>
      </div>

      {/* Panel resumen */}
      <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
        <Card className="p-6">
          <p className="text-[12.5px] lg:text-[13.5px] font-bold uppercase tracking-[0.03em] text-jaguar-ink/45">Puntaje general</p>
          <div className="mt-3 flex items-center gap-4">
            <div className="relative flex h-[84px] w-[84px] shrink-0 items-center justify-center">
              <svg viewBox="0 0 96 96" className="h-full w-full -rotate-90">
                <circle cx="48" cy="48" r="42" fill="none" strokeWidth="7" className="stroke-jaguar-ink/8" />
                <circle
                  cx="48"
                  cy="48"
                  r="42"
                  fill="none"
                  strokeWidth="7"
                  strokeLinecap="round"
                  className={ringToneByScore(overall)}
                  strokeDasharray={`${progress} ${circumference}`}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-[18px] lg:text-[20px] font-extrabold text-jaguar-ink">
                  {overall !== null ? overall.toFixed(1) : "—"}
                </span>
                <span className="text-[9px] lg:text-[10px] font-semibold text-jaguar-ink/40">/ 10</span>
              </div>
            </div>
            <Badge tone={overall !== null && overall >= 7.5 ? "green" : overall !== null && overall >= 5 ? "gold" : "maroon"}>
              {overall !== null ? "En progreso" : "Sin datos"}
            </Badge>
          </div>

          <div className="mt-5 space-y-3 border-t border-jaguar-ink/6 pt-4">
            {evaluationCategories.map((cat) => {
              const avg = categoryAverages[cat];
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between text-[12.5px] lg:text-[13.5px]">
                    <span className="text-jaguar-ink/60">{evaluationCategoryLabel[cat]}</span>
                    <span className="font-bold text-jaguar-ink">{avg !== null ? avg.toFixed(1) : "—"}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-jaguar-ink/8">
                    <div
                      className="h-full rounded-full bg-jaguar-green-600"
                      style={{ width: `${((avg ?? 0) / 10) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </form>
  );
}
