"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  Bolt,
  Briefcase,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CloudRain,
  Loader2,
  Package,
  PenLine,
  Sparkles,
  Users,
} from "lucide-react";
import { Card } from "../ui/Card";
import { Field, inputClass } from "../jugadores/FormField";
import { generateTraining } from "@/app/plataforma/(dashboard)/entrenamientos/actions";
import { categories, defaultCategory, type Category } from "@/lib/data/categories";
import { trainingVenues } from "@/lib/data/venues";
import {
  intensityOptions,
  materialOptions,
  professionalRoleOptions,
  specialConditionOptions,
  trainingObjectives,
  type ProfessionalRole,
  type SessionGenerationInput,
  type TrainingIntensityValue,
  type TrainingObjective,
} from "@/lib/training/session-types";
import type { TrainingTemplateRow } from "@/lib/data/training-templates";
import type { CreationMode } from "@/lib/training/session-types";

type Screen = "intro" | "template" | 1 | 2 | 3 | 4 | 5 | 6 | "review";

interface WizardAnswers {
  mode: CreationMode | null;
  category: Category;
  sessionDate: string;
  startTime: string;
  durationMin: number;
  location: string;
  responsibleRole: ProfessionalRole;
  objectives: TrainingObjective[];
  intensity: TrainingIntensityValue | "";
  playersCount: number;
  materials: string[];
  specialConditions: string[];
  injuryNote: string;
}

const initialAnswers: WizardAnswers = {
  mode: null,
  category: defaultCategory,
  sessionDate: "",
  startTime: "",
  durationMin: 90,
  location: "",
  responsibleRole: "Director técnico",
  objectives: [],
  intensity: "",
  playersCount: 24,
  materials: ["Balones", "Conos", "Petos"],
  specialConditions: [],
  injuryNote: "",
};

/** Horas puntuales cada 30 min — más fácil de escoger que un input de hora libre. */
function buildTimeOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  for (let totalMin = 5 * 60; totalMin <= 22 * 60; totalMin += 30) {
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    const value = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    options.push({ value, label: `${hour12}:${String(m).padStart(2, "0")} ${period}` });
  }
  return options;
}

const timeOptions = buildTimeOptions();

const objectiveIcons: Partial<Record<TrainingObjective, string>> = {
  Técnica: "⚽", Táctica: "🧠", Definición: "🎯", Posesión: "🔄",
  Transiciones: "⚡", Fuerza: "💪", Velocidad: "🏃", Recuperación: "🧘",
  "Partido reducido": "🥅", Porteros: "🧤", Resistencia: "🫁", Coordinación: "🪀",
};

const stepLabels = ["Info general", "Objetivo", "Intensidad", "Jugadores", "Material", "Condiciones"];

function toggleInArray(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function TrainingWizard({
  templates,
  coachName,
}: {
  templates: TrainingTemplateRow[];
  coachName: string;
}) {
  const router = useRouter();
  const [screen, setScreen] = useState<Screen>("intro");
  const [answers, setAnswers] = useState<WizardAnswers>(initialAnswers);
  const [stepError, setStepError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const currentStepNumber = typeof screen === "number" ? screen : null;

  function set<K extends keyof WizardAnswers>(key: K, value: WizardAnswers[K]) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function chooseMode(mode: CreationMode) {
    set("mode", mode);
    setScreen(mode === "plantilla" ? "template" : 1);
  }

  function applyTemplate(template: TrainingTemplateRow) {
    setAnswers((prev) => ({
      ...prev,
      objectives: [template.objective as TrainingObjective],
      intensity: template.intensity,
      playersCount: template.players_count ?? prev.playersCount,
      materials: template.materials.length > 0 ? template.materials : prev.materials,
      specialConditions: template.special_conditions,
    }));
    setScreen(1);
  }

  function goNext() {
    setStepError(null);
    if (screen === 1) {
      if (!answers.sessionDate || !answers.startTime || answers.durationMin <= 0 || !answers.location) {
        setStepError("Fecha, hora, duración y sede son obligatorias.");
        return;
      }
      setScreen(2);
    } else if (screen === 2) {
      if (answers.objectives.length === 0) {
        setStepError("Selecciona al menos un objetivo del entrenamiento.");
        return;
      }
      setScreen(3);
    } else if (screen === 3) {
      if (!answers.intensity) {
        setStepError("Selecciona el nivel de intensidad.");
        return;
      }
      setScreen(4);
    } else if (screen === 4) {
      if (answers.playersCount <= 0) {
        setStepError("Indica la cantidad de jugadores.");
        return;
      }
      setScreen(5);
    } else if (screen === 5) {
      setScreen(6);
    } else if (screen === 6) {
      setScreen("review");
    }
  }

  function goBack() {
    setStepError(null);
    if (screen === 1) setScreen(answers.mode === "plantilla" ? "template" : "intro");
    else if (screen === "template") setScreen("intro");
    else if (screen === "review") setScreen(6);
    else if (typeof screen === "number") setScreen((screen - 1) as Screen);
  }

  const canSubmit = answers.mode !== null && answers.objectives.length > 0 && !!answers.intensity;

  function handleSubmit() {
    if (!canSubmit) return;
    setSubmitError(null);
    const payload: SessionGenerationInput & { mode: CreationMode } = {
      mode: answers.mode!,
      category: answers.category,
      sessionDate: answers.sessionDate,
      startTime: answers.startTime,
      durationMin: answers.durationMin,
      location: answers.location,
      coachName,
      responsibleRole: answers.responsibleRole,
      objectives: answers.objectives,
      intensity: answers.intensity as TrainingIntensityValue,
      playersCount: answers.playersCount,
      materials: answers.materials,
      specialConditions: answers.specialConditions,
      injuryNote: answers.injuryNote.trim() || undefined,
    };
    startTransition(async () => {
      const result = await generateTraining(payload);
      if (result.error || !result.id) {
        setSubmitError(result.error ?? "No se pudo crear la sesión.");
        return;
      }
      router.push(`/plataforma/entrenamientos/${result.id}`);
    });
  }

  const progressPct = useMemo(() => {
    if (currentStepNumber) return (currentStepNumber / 6) * 100;
    if (screen === "review") return 100;
    return 0;
  }, [screen, currentStepNumber]);

  return (
    <div className="mx-auto max-w-[820px] space-y-6">
      {screen !== "intro" && screen !== "template" ? (
        <div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-jaguar-ink/8">
            <div
              className="h-full rounded-full bg-jaguar-green-600 transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          {currentStepNumber ? (
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] lg:text-[13px] font-semibold text-jaguar-ink/40">
              {stepLabels.map((label, i) => (
                <span key={label} className={i + 1 === currentStepNumber ? "text-jaguar-green-600" : ""}>
                  {i + 1}. {label}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {screen === "intro" ? <IntroScreen onChoose={chooseMode} /> : null}

      {screen === "template" ? (
        <TemplateScreen templates={templates} onPick={applyTemplate} onSkip={() => setScreen(1)} />
      ) : null}

      {screen === 1 ? (
        <StepCard title="Información general" subtitle="¿Cuándo, dónde y para qué categoría es esta sesión?">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Categoría *">
              <select value={answers.category} onChange={(e) => set("category", e.target.value as Category)} className={inputClass}>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Entrenador responsable">
              <input value={coachName} disabled className={`${inputClass} opacity-60`} />
            </Field>
            <Field label="Profesional a cargo de la sesión *">
              <select
                value={answers.responsibleRole}
                onChange={(e) => set("responsibleRole", e.target.value as ProfessionalRole)}
                className={inputClass}
              >
                {professionalRoleOptions.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </Field>
            <Field label="Fecha *">
              <input type="date" value={answers.sessionDate} onChange={(e) => set("sessionDate", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Hora de inicio *">
              <select value={answers.startTime} onChange={(e) => set("startTime", e.target.value)} className={inputClass}>
                <option value="">Selecciona la hora</option>
                {timeOptions.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Duración (minutos) *">
              <select
                value={answers.durationMin}
                onChange={(e) => set("durationMin", Number(e.target.value))}
                className={inputClass}
              >
                {[45, 60, 75, 90, 105, 120, 135, 150].map((min) => (
                  <option key={min} value={min}>{min} minutos</option>
                ))}
              </select>
            </Field>
            <Field label="Sede *">
              <select value={answers.location} onChange={(e) => set("location", e.target.value)} className={inputClass}>
                <option value="">Selecciona una sede</option>
                {trainingVenues.map((venue) => (
                  <option key={venue} value={venue}>{venue}</option>
                ))}
              </select>
            </Field>
          </div>
        </StepCard>
      ) : null}

      {screen === 2 ? (
        <StepCard title="Objetivo del entrenamiento" subtitle="¿Cuál es el foco de la sesión? Puedes elegir varios enfoques.">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {trainingObjectives.map((obj) => (
              <SelectableTile
                key={obj}
                selected={answers.objectives.includes(obj)}
                onClick={() =>
                  setAnswers((prev) => ({
                    ...prev,
                    objectives: prev.objectives.includes(obj)
                      ? prev.objectives.filter((o) => o !== obj)
                      : [...prev.objectives, obj],
                  }))
                }
                icon={objectiveIcons[obj]}
                label={obj}
              />
            ))}
          </div>
        </StepCard>
      ) : null}

      {screen === 3 ? (
        <StepCard title="Nivel de intensidad" subtitle="¿Qué tan exigente físicamente debe ser la sesión?">
          <div className="grid grid-cols-3 gap-3">
            {intensityOptions.map((level) => (
              <SelectableTile
                key={level}
                selected={answers.intensity === level}
                onClick={() => set("intensity", level)}
                icon={level === "Baja" ? "🟢" : level === "Media" ? "🟡" : "🔴"}
                label={level}
              />
            ))}
          </div>
        </StepCard>
      ) : null}

      {screen === 4 ? (
        <StepCard title="Cantidad de jugadores" subtitle="¿Cuántos jugadores participarán en la sesión?">
          <div className="mx-auto max-w-[240px]">
            <Field label="Jugadores">
              <input
                type="number"
                min={1}
                max={40}
                value={answers.playersCount}
                onChange={(e) => set("playersCount", Number(e.target.value))}
                className={`${inputClass} text-center text-[18px] lg:text-[20px] font-bold`}
              />
            </Field>
          </div>
        </StepCard>
      ) : null}

      {screen === 5 ? (
        <StepCard title="Material disponible" subtitle="Marca lo que tienes disponible hoy — la sesión se adapta a esto.">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {materialOptions.map((material) => (
              <CheckboxTile
                key={material}
                checked={answers.materials.includes(material)}
                onClick={() => set("materials", toggleInArray(answers.materials, material))}
                label={material}
              />
            ))}
          </div>
        </StepCard>
      ) : null}

      {screen === 6 ? (
        <StepCard title="¿Existe alguna condición especial?" subtitle="Opcional — ayuda a ajustar la sesión a la realidad de hoy.">
          <button
            type="button"
            onClick={() => set("specialConditions", toggleInArray(answers.specialConditions, "Llueve"))}
            className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-colors ${
              answers.specialConditions.includes("Llueve")
                ? "border-jaguar-turquoise-500 bg-jaguar-turquoise-500/10 text-jaguar-turquoise-700"
                : "border-jaguar-ink/10 bg-white text-jaguar-ink/70 hover:border-jaguar-ink/20"
            }`}
          >
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                answers.specialConditions.includes("Llueve") ? "bg-jaguar-turquoise-500 text-white" : "bg-jaguar-mist text-jaguar-ink/40"
              }`}
            >
              <CloudRain className="h-5 w-5" strokeWidth={1.9} aria-hidden />
            </span>
            <span className="flex-1">
              <span className="block text-[13.5px] lg:text-[15px] font-bold">¿Va a llover hoy?</span>
              <span className="block text-[12px] lg:text-[13px] opacity-70">Ajusta la sesión a cancha mojada — superficies seguras, menos sprints a máxima velocidad.</span>
            </span>
            {answers.specialConditions.includes("Llueve") ? (
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-jaguar-turquoise-500 text-white">
                <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
              </span>
            ) : null}
          </button>

          <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {specialConditionOptions
              .filter((condition) => condition !== "Llueve")
              .map((condition) => (
                <CheckboxTile
                  key={condition}
                  checked={answers.specialConditions.includes(condition)}
                  onClick={() => set("specialConditions", toggleInArray(answers.specialConditions, condition))}
                  label={condition}
                />
              ))}
          </div>

          {answers.specialConditions.includes("Jugadores lesionados") ? (
            <div className="mt-4">
              <Field label="¿Cuáles o cuántos jugadores? (uso interno del cuerpo técnico)">
                <textarea
                  rows={2}
                  value={answers.injuryNote}
                  onChange={(e) => set("injuryNote", e.target.value)}
                  placeholder="Ej: 2 jugadores con molestia muscular, trabajo diferenciado sin contacto…"
                  className={`${inputClass} resize-none`}
                />
              </Field>
            </div>
          ) : null}
        </StepCard>
      ) : null}

      {screen === "review" ? (
        <ReviewScreen answers={answers} isPending={isPending} error={submitError} onSubmit={handleSubmit} />
      ) : null}

      {stepError ? (
        <p className="rounded-xl bg-jaguar-maroon-500/8 px-4 py-3 text-[13px] lg:text-[14px] font-medium text-jaguar-maroon-600">{stepError}</p>
      ) : null}

      {screen !== "intro" ? (
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[13.5px] lg:text-[15px] font-semibold text-jaguar-ink/60 transition-colors hover:bg-jaguar-ink/[0.04]"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2.25} aria-hidden />
            Atrás
          </button>
          {screen !== "review" && screen !== "template" ? (
            <button
              type="button"
              onClick={goNext}
              className="inline-flex items-center gap-1.5 rounded-xl bg-jaguar-green-600 px-5 py-2.5 text-[13.5px] lg:text-[15px] font-semibold text-white transition-colors hover:bg-jaguar-green-700"
            >
              Siguiente
              <ChevronRight className="h-4 w-4" strokeWidth={2.25} aria-hidden />
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function StepCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <Card className="p-7">
      <h2 className="text-[19px] lg:text-[21px] font-extrabold text-jaguar-ink">{title}</h2>
      <p className="mt-1 text-[13.5px] lg:text-[15px] text-jaguar-ink/50">{subtitle}</p>
      <div className="mt-6">{children}</div>
    </Card>
  );
}

function SelectableTile({
  selected,
  onClick,
  icon,
  label,
}: {
  selected: boolean;
  onClick: () => void;
  icon?: string;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-colors ${
        selected
          ? "border-jaguar-green-500 bg-jaguar-green-50 text-jaguar-green-700"
          : "border-jaguar-ink/10 bg-white text-jaguar-ink/70 hover:border-jaguar-ink/20"
      }`}
    >
      {selected ? (
        <span className="absolute right-2 top-2 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-jaguar-green-600 text-white">
          <Check className="h-2.5 w-2.5" strokeWidth={3.5} aria-hidden />
        </span>
      ) : null}
      {icon ? <span className="text-[22px] lg:text-[24px]">{icon}</span> : null}
      <span className="text-[13px] lg:text-[14px] font-bold">{label}</span>
    </button>
  );
}

function CheckboxTile({ checked, onClick, label }: { checked: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-left text-[13px] lg:text-[14px] font-semibold transition-colors ${
        checked ? "border-jaguar-green-500 bg-jaguar-green-50 text-jaguar-green-700" : "border-jaguar-ink/10 bg-white text-jaguar-ink/65"
      }`}
    >
      <span
        className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md border ${
          checked ? "border-jaguar-green-600 bg-jaguar-green-600 text-white" : "border-jaguar-ink/20"
        }`}
      >
        {checked ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
      </span>
      {label}
    </button>
  );
}

function IntroScreen({ onChoose }: { onChoose: (mode: CreationMode) => void }) {
  const options: { mode: CreationMode; icon: React.ReactNode; title: string; description: string; badge?: string }[] = [
    {
      mode: "ia",
      icon: <Sparkles className="h-5 w-5" strokeWidth={2} aria-hidden />,
      title: "Generar con IA",
      description: "Responde 6 preguntas rápidas y el sistema arma toda la sesión — calentamiento, ejercicios, partido aplicado e indicadores.",
      badge: "Recomendado",
    },
    {
      mode: "plantilla",
      icon: <ClipboardList className="h-5 w-5" strokeWidth={2} aria-hidden />,
      title: "Usar una plantilla",
      description: "Parte de una sesión ya diseñada para un objetivo frecuente y ajústala a tu gusto.",
    },
    {
      mode: "manual",
      icon: <PenLine className="h-5 w-5" strokeWidth={2} aria-hidden />,
      title: "Crear desde cero",
      description: "Define la información general y arma cada bloque de la sesión tú mismo en el editor.",
    },
  ];

  return (
    <div>
      <h1 className="text-[22px] lg:text-[24px] font-extrabold text-jaguar-ink">Nueva sesión de entrenamiento</h1>
      <p className="mt-1.5 text-[14px] lg:text-[15.5px] text-jaguar-ink/55">¿Cómo deseas crear este entrenamiento?</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {options.map((opt) => (
          <button
            key={opt.mode}
            type="button"
            onClick={() => onChoose(opt.mode)}
            className="relative flex flex-col items-start gap-3 rounded-2xl border border-jaguar-ink/10 bg-white p-5 text-left transition-colors hover:border-jaguar-green-500/50 hover:shadow-[0_4px_16px_-8px_rgba(13,18,16,0.18)]"
          >
            {opt.badge ? (
              <span className="absolute -top-2.5 right-4 rounded-full bg-jaguar-green-600 px-2.5 py-0.5 text-[10px] lg:text-[11px] font-bold uppercase tracking-[0.03em] text-white">
                {opt.badge}
              </span>
            ) : null}
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-jaguar-green-50 text-jaguar-green-600">
              {opt.icon}
            </span>
            <span className="text-[15px] lg:text-[16.5px] font-extrabold text-jaguar-ink">{opt.title}</span>
            <span className="text-[12.5px] lg:text-[13.5px] leading-relaxed text-jaguar-ink/55">{opt.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function TemplateScreen({
  templates,
  onPick,
  onSkip,
}: {
  templates: TrainingTemplateRow[];
  onPick: (t: TrainingTemplateRow) => void;
  onSkip: () => void;
}) {
  return (
    <StepCard title="Elige una plantilla" subtitle="Precarga el objetivo, la intensidad y el material — podrás ajustar todo después.">
      {templates.length === 0 ? (
        <p className="text-[13px] lg:text-[14px] text-jaguar-ink/45">
          Aún no hay plantillas guardadas.{" "}
          <button type="button" onClick={onSkip} className="font-semibold text-jaguar-green-600 hover:underline">
            Continuar sin plantilla
          </button>
          .
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {templates.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onPick(t)}
              className="flex flex-col items-start gap-1.5 rounded-2xl border border-jaguar-ink/10 bg-white p-4 text-left transition-colors hover:border-jaguar-green-500/50"
            >
              <span className="text-[14px] lg:text-[15.5px] font-bold text-jaguar-ink">{t.title}</span>
              {t.description ? <span className="text-[12.5px] lg:text-[13.5px] text-jaguar-ink/55">{t.description}</span> : null}
              <span className="mt-1 text-[11.5px] lg:text-[12.5px] font-semibold uppercase tracking-[0.03em] text-jaguar-green-600">
                {t.objective} · Intensidad {t.intensity}
              </span>
            </button>
          ))}
        </div>
      )}
    </StepCard>
  );
}

function ReviewScreen({
  answers,
  isPending,
  error,
  onSubmit,
}: {
  answers: WizardAnswers;
  isPending: boolean;
  error: string | null;
  onSubmit: () => void;
}) {
  const modeLabel =
    answers.mode === "ia" ? "Generar con IA" : answers.mode === "plantilla" ? "Desde plantilla" : "Crear desde cero";
  const submitLabel =
    answers.mode === "manual" ? "Crear sesión en blanco" : answers.mode === "plantilla" ? "Generar desde plantilla" : "Generar sesión con IA";

  return (
    <StepCard title="Revisa antes de generar" subtitle={`Modo: ${modeLabel}`}>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-[13.5px] lg:text-[15px] sm:grid-cols-2">
        <ReviewRow icon={<Activity className="h-4 w-4" strokeWidth={2} aria-hidden />} label="Categoría" value={answers.category} />
        <ReviewRow
          icon={<Bolt className="h-4 w-4" strokeWidth={2} aria-hidden />}
          label="Fecha y hora"
          value={`${answers.sessionDate || "—"} · ${answers.startTime || "—"} (${answers.durationMin} min)`}
        />
        <ReviewRow label="Lugar" value={answers.location || "—"} />
        <ReviewRow
          icon={<Briefcase className="h-4 w-4" strokeWidth={2} aria-hidden />}
          label="Profesional a cargo"
          value={answers.responsibleRole}
        />
        <ReviewRow label="Objetivo" value={answers.objectives.join(", ") || "—"} />
        <ReviewRow label="Intensidad" value={answers.intensity || "—"} />
        <ReviewRow icon={<Users className="h-4 w-4" strokeWidth={2} aria-hidden />} label="Jugadores" value={String(answers.playersCount)} />
        <ReviewRow icon={<Package className="h-4 w-4" strokeWidth={2} aria-hidden />} label="Material" value={answers.materials.join(", ") || "Ninguno"} />
        <ReviewRow label="Condiciones especiales" value={answers.specialConditions.join(", ") || "Ninguna"} />
        {answers.injuryNote.trim() ? <ReviewRow label="Detalle de lesionados" value={answers.injuryNote.trim()} /> : null}
      </dl>

      {error ? (
        <p className="mt-5 rounded-xl bg-jaguar-maroon-500/8 px-4 py-3 text-[13px] lg:text-[14px] font-medium text-jaguar-maroon-600">{error}</p>
      ) : null}

      <button
        type="button"
        onClick={onSubmit}
        disabled={isPending}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-jaguar-green-600 px-5 py-3 text-[14px] lg:text-[15.5px] font-bold text-white transition-colors hover:bg-jaguar-green-700 disabled:opacity-60"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} aria-hidden />
            Generando sesión…
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" strokeWidth={2.25} aria-hidden />
            {submitLabel}
          </>
        )}
      </button>
    </StepCard>
  );
}

function ReviewRow({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl bg-jaguar-mist/50 px-3.5 py-2.5">
      {icon ? <span className="mt-0.5 text-jaguar-ink/35">{icon}</span> : null}
      <div>
        <dt className="text-[11px] lg:text-[12px] font-semibold uppercase tracking-[0.03em] text-jaguar-ink/40">{label}</dt>
        <dd className="mt-0.5 font-semibold text-jaguar-ink">{value}</dd>
      </div>
    </div>
  );
}
