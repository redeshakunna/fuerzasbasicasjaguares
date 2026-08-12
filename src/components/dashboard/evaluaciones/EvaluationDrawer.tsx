"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Compass,
  Dumbbell,
  Flame,
  HandMetal,
  Minus,
  ShieldCheck,
  Sparkles,
  Square,
  Star,
  ThumbsDown,
  ThumbsUp,
  Timer,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import { Badge } from "../ui/Badge";
import { StarRatingInput } from "../ui/StarRatingInput";
import { saveQuickEvaluation } from "@/app/plataforma/(dashboard)/evaluaciones/actions";
import { generateEvaluationSummary } from "@/lib/evaluations/summary-generator";
import { getFullName } from "@/lib/data/players-stats";
import type { AttendanceActivity } from "@/app/plataforma/(dashboard)/entrenamientos/actions";
import type { PlayerRow } from "@/lib/data/players";
import type { Tables } from "@/lib/supabase/database.types";

type EvaluationRow = Tables<"evaluations">;
type CallupRow = Tables<"match_callups">;

const indicators = [
  { key: "technical", label: "Técnica", icon: Zap },
  { key: "tactical", label: "Táctica", icon: Compass },
  { key: "physical", label: "Física", icon: Dumbbell },
  { key: "discipline", label: "Disciplina", icon: ShieldCheck },
  { key: "attitude", label: "Actitud", icon: HandMetal },
] as const;

type IndicatorKey = (typeof indicators)[number]["key"];

const presets = [
  { label: "Flojo", value: 2, icon: ThumbsDown, activeClass: "border-jaguar-maroon-500 bg-jaguar-maroon-500 text-white" },
  { label: "Regular", value: 3, icon: Minus, activeClass: "border-jaguar-gold-500 bg-jaguar-gold-500 text-white" },
  { label: "Bien", value: 4, icon: ThumbsUp, activeClass: "border-jaguar-green-500 bg-jaguar-green-500 text-white" },
  { label: "Excelente", value: 5, icon: Flame, activeClass: "border-jaguar-green-600 bg-jaguar-green-600 text-white" },
] as const;

function fromTen(v: number | null): number {
  return v ? Math.round(v / 2) : 0;
}

function scoreTone(v: number) {
  if (v <= 0) return { text: "text-jaguar-ink/30", bg: "bg-jaguar-mist", ring: "ring-jaguar-ink/10" };
  if (v >= 4) return { text: "text-jaguar-green-600", bg: "bg-jaguar-green-50", ring: "ring-jaguar-green-500/25" };
  if (v >= 2.5) return { text: "text-jaguar-gold-600", bg: "bg-jaguar-gold-500/10", ring: "ring-jaguar-gold-500/25" };
  return { text: "text-jaguar-maroon-600", bg: "bg-jaguar-maroon-500/10", ring: "ring-jaguar-maroon-500/25" };
}

/**
 * Ventana emergente de evaluación rápida — modal centrado (no cajón lateral), pensado
 * para que el profesor la use parado en la cancha: presets de un toque para calificar
 * rápido, puntaje que reacciona en vivo con color, y un toggle aparte para marcar
 * jugadores destacados de la práctica (puede haber varios, no depende del puntaje).
 */
export function EvaluationDrawer({
  activity,
  activityTitle,
  player,
  category,
  existingEvaluation,
  callup,
  onClose,
  onSaved,
}: {
  activity: AttendanceActivity;
  activityTitle: string;
  player: PlayerRow;
  category: string;
  existingEvaluation: EvaluationRow | null;
  callup?: CallupRow | null;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const [open, setOpen] = useState(true);
  const [scores, setScores] = useState<Record<IndicatorKey, number>>({
    technical: fromTen(existingEvaluation?.technical_score ?? null),
    tactical: fromTen(existingEvaluation?.tactical_score ?? null),
    physical: fromTen(existingEvaluation?.physical_score ?? null),
    discipline: fromTen(existingEvaluation?.discipline_score ?? null),
    attitude: fromTen(existingEvaluation?.attitude_score ?? null),
  });
  const [standout, setStandout] = useState(existingEvaluation?.is_standout ?? false);
  const [notes, setNotes] = useState("");
  const [summary, setSummary] = useState(existingEvaluation?.notes ?? "");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const fullName = getFullName(player);
  const overall = Object.values(scores).reduce((a, b) => a + b, 0) / 5;
  const tone = scoreTone(overall);
  const isMatch = activity.kind === "partido";
  const hasCallupStats =
    isMatch && callup && (callup.goals > 0 || callup.yellow_cards > 0 || callup.red_card || callup.minutes_played !== null);

  function requestClose() {
    setOpen(false);
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") requestClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function applyPreset(value: number) {
    setSaved(false);
    setScores({ technical: value, tactical: value, physical: value, discipline: value, attitude: value });
  }

  function handleGenerate() {
    setSummary(generateEvaluationSummary({ playerFirstName: player.first_name, scores, coachNotes: notes }));
  }

  function handleSave() {
    setError(null);
    const finalNotes = summary.trim() || notes.trim();
    startTransition(async () => {
      const result = await saveQuickEvaluation(activity, player.id, { ...scores, notes: finalNotes, standout });
      if (result.error) {
        setError(result.error);
        return;
      }
      setSaved(true);
      onSaved?.();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <AnimatePresence onExitComplete={onClose}>
        {open ? (
          <>
            <motion.button
              key="backdrop"
              type="button"
              aria-label="Cerrar"
              onClick={requestClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-jaguar-ink/55 backdrop-blur-sm"
            />
            <motion.div
              key="panel"
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex max-h-[88vh] w-full max-w-[480px] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 border-b border-jaguar-ink/6 px-5 py-4">
                <div className="flex items-center gap-3">
                  <Link href={`/plataforma/jugadores/${player.id}`} className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-jaguar-mist ring-1 ring-jaguar-ink/8">
                    <Image src={player.photo_url || "/brand/default-avatar.png"} alt={fullName} fill sizes="56px" className="object-cover" />
                  </Link>
                  <div className="min-w-0">
                    <Link href={`/plataforma/jugadores/${player.id}`} className="truncate text-[15px] lg:text-[16.5px] font-extrabold text-jaguar-ink hover:underline">
                      {fullName}
                    </Link>
                    <p className="text-[12px] lg:text-[13px] text-jaguar-ink/50">
                      {player.jersey_number ? `#${player.jersey_number} · ` : ""}
                      {player.position}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <Badge tone="turquoise">{category}</Badge>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={requestClose}
                  aria-label="Cerrar"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-jaguar-ink/40 hover:bg-jaguar-mist/60"
                >
                  <X className="h-4 w-4" strokeWidth={2} aria-hidden />
                </button>
              </div>

              {/* Body (scrollable) */}
              <div className="flex-1 overflow-y-auto px-5 py-5">
                <p className="text-[11.5px] lg:text-[12.5px] text-jaguar-ink/40">
                  {isMatch ? "Partido: " : "Sesión: "}
                  {activityTitle}
                </p>

                {hasCallupStats ? (
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    {callup!.minutes_played !== null ? (
                      <span className="flex items-center gap-1 rounded-full bg-jaguar-mist/70 px-2.5 py-1 text-[11px] lg:text-[12px] font-semibold text-jaguar-ink/60">
                        <Timer className="h-3 w-3" strokeWidth={2} aria-hidden />
                        {callup!.minutes_played}&apos;
                      </span>
                    ) : null}
                    {callup!.goals > 0 ? (
                      <span className="flex items-center gap-1 rounded-full bg-jaguar-green-500/10 px-2.5 py-1 text-[11px] lg:text-[12px] font-semibold text-jaguar-green-700">
                        <Trophy className="h-3 w-3" strokeWidth={2} aria-hidden />
                        {callup!.goals} gol{callup!.goals > 1 ? "es" : ""}
                      </span>
                    ) : null}
                    {callup!.yellow_cards > 0 ? (
                      <span className="flex items-center gap-1 rounded-full bg-jaguar-gold-500/15 px-2.5 py-1 text-[11px] lg:text-[12px] font-semibold text-jaguar-gold-700">
                        <Square className="h-3 w-3" strokeWidth={2} fill="currentColor" aria-hidden />
                        {callup!.yellow_cards} amarilla{callup!.yellow_cards > 1 ? "s" : ""}
                      </span>
                    ) : null}
                    {callup!.red_card ? (
                      <span className="flex items-center gap-1 rounded-full bg-jaguar-maroon-500/10 px-2.5 py-1 text-[11px] lg:text-[12px] font-semibold text-jaguar-maroon-600">
                        <Square className="h-3 w-3" strokeWidth={2} fill="currentColor" aria-hidden />
                        Roja
                      </span>
                    ) : null}
                  </div>
                ) : null}

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <motion.div
                    key={overall.toFixed(1)}
                    initial={{ scale: 0.85 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 420, damping: 16 }}
                    className={`flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl ring-2 ${tone.bg} ${tone.ring}`}
                  >
                    <span className={`text-[19px] lg:text-[21px] font-extrabold leading-none ${tone.text}`}>
                      {overall > 0 ? overall.toFixed(1) : "—"}
                    </span>
                    <span className="mt-0.5 text-[8.5px] lg:text-[9.5px] font-bold uppercase tracking-wide text-jaguar-ink/35">/ 5</span>
                  </motion.div>

                  <button
                    type="button"
                    onClick={() => setStandout((v) => !v)}
                    className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[12px] lg:text-[13px] font-bold transition-colors ${
                      standout
                        ? "border-jaguar-gold-500 bg-jaguar-gold-500/15 text-jaguar-gold-700"
                        : "border-jaguar-ink/10 text-jaguar-ink/40 hover:border-jaguar-ink/20 hover:text-jaguar-ink/60"
                    }`}
                  >
                    <motion.span
                      key={String(standout)}
                      initial={{ scale: 0.5, rotate: -25 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 14 }}
                      className="flex"
                    >
                      <Star className="h-3.5 w-3.5" strokeWidth={2} fill={standout ? "currentColor" : "none"} aria-hidden />
                    </motion.span>
                    {standout ? "Destacado de la práctica" : "Marcar como destacado"}
                  </button>
                </div>

                <p className="mt-5 text-[11.5px] lg:text-[12.5px] font-bold uppercase tracking-[0.06em] text-jaguar-ink/35">
                  Calificación rápida
                </p>
                <div className="mt-2 grid grid-cols-4 gap-1.5">
                  {presets.map((preset) => {
                    const Icon = preset.icon;
                    const isActive = indicators.every((ind) => scores[ind.key] === preset.value);
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => applyPreset(preset.value)}
                        className={`flex flex-col items-center gap-1 rounded-xl border px-1 py-2.5 text-[11px] lg:text-[12px] font-semibold transition-colors ${
                          isActive ? preset.activeClass : "border-jaguar-ink/10 text-jaguar-ink/50 hover:border-jaguar-ink/20"
                        }`}
                      >
                        <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
                        {preset.label}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-5 space-y-3.5">
                  {indicators.map((ind) => {
                    const Icon = ind.icon;
                    return (
                      <div key={ind.key} className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2 text-[13.5px] lg:text-[15px] font-semibold text-jaguar-ink/75">
                          <Icon className="h-4 w-4 shrink-0 text-jaguar-ink/35" strokeWidth={1.9} aria-hidden />
                          {ind.label}
                        </span>
                        <StarRatingInput value={scores[ind.key]} onChange={(v) => setScores((prev) => ({ ...prev, [ind.key]: v }))} />
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 border-t border-jaguar-ink/6 pt-5">
                  <label className="text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-ink/70">Observaciones del entrenador</label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Lo que quieras resaltar de la sesión…"
                    className="mt-2 w-full rounded-xl border border-jaguar-ink/10 bg-jaguar-mist/40 px-3.5 py-2.5 text-[13px] lg:text-[14px] text-jaguar-ink placeholder:text-jaguar-ink/35 focus:border-jaguar-green-500/40 focus:outline-none focus:ring-2 focus:ring-jaguar-green-500/10"
                  />

                  <button
                    type="button"
                    onClick={handleGenerate}
                    className="mt-3 flex items-center gap-1.5 rounded-xl bg-violet-500/10 px-3.5 py-2 text-[12.5px] lg:text-[13.5px] font-semibold text-violet-600 transition-colors hover:bg-violet-500/15"
                  >
                    <Sparkles className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                    {summary ? "Regenerar resumen" : "Generar resumen"}
                  </button>

                  {summary ? (
                    <div className="mt-3 rounded-xl bg-violet-500/5 p-3.5">
                      <p className="flex items-center gap-1.5 text-[11.5px] lg:text-[12.5px] font-bold text-violet-600">
                        <Sparkles className="h-3 w-3" strokeWidth={2} aria-hidden />
                        Resumen generado por IA
                      </p>
                      <textarea
                        rows={4}
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        maxLength={300}
                        className="mt-2 w-full resize-none rounded-lg bg-transparent text-[13px] lg:text-[14px] leading-relaxed text-jaguar-ink focus:outline-none"
                      />
                      <p className="text-right text-[10.5px] lg:text-[11.5px] text-jaguar-ink/35">{summary.length} / 300</p>
                    </div>
                  ) : null}
                </div>

                {error ? (
                  <p className="mt-4 rounded-xl bg-jaguar-maroon-500/8 px-3.5 py-2.5 text-[13px] lg:text-[14px] font-medium text-jaguar-maroon-600">
                    {error}
                  </p>
                ) : null}
                {saved ? <p className="mt-4 text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-green-600">Evaluación guardada ✓</p> : null}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 border-t border-jaguar-ink/6 px-5 py-4">
                <button
                  type="button"
                  onClick={requestClose}
                  className="rounded-xl px-4 py-2.5 text-[13.5px] lg:text-[15px] font-semibold text-jaguar-ink/60 hover:bg-jaguar-ink/[0.04]"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isPending}
                  className="rounded-xl bg-jaguar-green-600 px-5 py-2.5 text-[13.5px] lg:text-[15px] font-semibold text-white transition-colors hover:bg-jaguar-green-700 disabled:opacity-60"
                >
                  {isPending ? "Guardando…" : "Guardar evaluación"}
                </button>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
