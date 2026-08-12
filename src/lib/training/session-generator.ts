import { objectiveContent } from "./exercise-library";
import type { AppliedMatchTemplate, ExerciseTemplate } from "./exercise-library";
import type {
  SessionAppliedMatch,
  SessionBlock,
  SessionExercise,
  SessionGenerationInput,
  SessionPlan,
  TrainingObjective,
} from "./session-types";

function round5(value: number): number {
  return Math.max(5, Math.round(value / 5) * 5);
}

const ageRangeByCategory: Record<string, string> = {
  "Sub-13": "11-13 años",
  "Sub-15": "14-15 años",
  "Sub-17": "16-17 años",
};

/** Materiales que realmente se pueden usar en un ejercicio, dado lo disponible. */
function missingMaterials(required: string[], available: string[]): string[] {
  return required.filter((m) => !available.includes(m));
}

function adaptDescriptionToMaterials(description: string, required: string[], available: string[]): string {
  const missing = missingMaterials(required, available);
  if (missing.length === 0) return description;
  return `${description} Adaptación por material disponible: no hay ${missing.join(
    " ni "
  ).toLowerCase()}, sustituye por marcas improvisadas (petos, mochilas, líneas del campo) o indicaciones verbales sin perder el objetivo del ejercicio.`;
}

interface ConditionEffects {
  intensityDowngrade: boolean;
  totalCapMin: number | null;
  appliedMatchShareDelta: number;
  notes: string[];
}

function computeConditionEffects(conditions: string[]): ConditionEffects {
  const effects: ConditionEffects = { intensityDowngrade: false, totalCapMin: null, appliedMatchShareDelta: 0, notes: [] };

  if (conditions.includes("Recuperación post partido") || conditions.includes("Jugadores lesionados")) {
    effects.intensityDowngrade = true;
    effects.appliedMatchShareDelta -= 0.12;
    effects.notes.push(
      "Sesión adaptada por recuperación/lesiones: se prioriza el trabajo regenerativo y técnico de baja exigencia física, reduciendo el partido aplicado y evitando duelos de alto impacto."
    );
  }
  if (conditions.includes("Semana de competencia")) {
    effects.totalCapMin = 70;
    effects.notes.push(
      "Semana de competencia: volumen reducido y foco en calidad de ejecución, evitando fatiga acumulada antes del próximo partido."
    );
  }
  if (conditions.includes("Preparación para torneo")) {
    effects.appliedMatchShareDelta += 0.1;
    effects.notes.push(
      "Preparación para torneo: se amplía el tiempo de partido aplicado para ganar ritmo competitivo real."
    );
  }
  if (conditions.includes("Llueve")) {
    effects.notes.push(
      "Cancha en condiciones de lluvia: prioriza superficies de apoyo seguras, reduce los sprints a máxima velocidad sobre pasto húmedo y refuerza la vigilancia ante el riesgo de resbalones."
    );
  }
  if (conditions.includes("Cancha pequeña") || conditions.includes("Sólo media cancha")) {
    effects.notes.push(
      "Espacio reducido disponible: todos los ejercicios se ajustan proporcionalmente en dimensiones sin perder su objetivo — prioriza la calidad técnica sobre el espacio de juego."
    );
  }

  return effects;
}

function buildWarmup(input: SessionGenerationInput, durationMin: number, focus: string): SessionBlock {
  return {
    durationMin,
    description:
      `Activación progresiva tipo RAMP (elevar, activar, movilizar, potenciar): trote suave, movilidad articular dinámica y ` +
      `${focus} Cierra con 2-3 acciones a intensidad cercana a la del bloque principal para preparar al cuerpo sin generar fatiga.`,
    organization: "Grupo completo en espacio amplio, desplazamientos libres seguidos de trabajo en parejas o tríos.",
    material: input.materials.includes("Balones") ? ["Balones", "Conos"].filter((m) => input.materials.includes(m)) : [],
    objective: "Preparar física y mentalmente al jugador para la parte principal de la sesión, previniendo lesiones.",
  };
}

function buildExercise(template: ExerciseTemplate, durationMin: number, input: SessionGenerationInput): SessionExercise {
  const usedMaterial = template.requiredMaterials.filter((m) => input.materials.includes(m));
  return {
    name: template.name,
    durationMin,
    description: adaptDescriptionToMaterials(template.description, template.requiredMaterials, input.materials),
    organization: template.organization,
    material: usedMaterial.length > 0 ? usedMaterial : template.requiredMaterials,
    objective: template.objective,
    coachCorrections: template.coachCorrections,
    commonMistakes: template.commonMistakes,
    variants: template.variants,
  };
}

function buildAppliedMatch(template: AppliedMatchTemplate, durationMin: number): SessionAppliedMatch {
  return { durationMin, organization: template.organization, rules: template.rules, objective: template.objective };
}

/** Esqueleto vacío para el modo "Crear desde cero" o para sesiones sin plan aún. */
export function blankSessionPlan(input: { objectives: string[]; category: string }): SessionPlan {
  return {
    generalObjective: `Sesión de ${input.objectives.join(", ")} para ${input.category} — completa el objetivo general.`,
    specificObjectives: [],
    warmup: { durationMin: 15, description: "", organization: "", material: [], objective: "" },
    exercises: [1, 2, 3].map((n) => ({
      name: `Ejercicio ${n}`,
      durationMin: 15,
      description: "",
      organization: "",
      material: [],
      objective: "",
      coachCorrections: [],
      commonMistakes: [],
      variants: [],
    })),
    appliedMatch: { durationMin: 15, organization: "", rules: "", objective: "" },
    cooldown: { durationMin: 10, description: "" },
    indicators: [],
    observations: "",
  };
}

/**
 * Motor de generación de sesiones — no es un LLM: es un sistema experto
 * basado en un catálogo curado de ejercicios (progresión analítico →
 * combinado → situacional) más reglas de adaptación por edad, intensidad,
 * duración, material disponible y condiciones especiales. Diseñado para
 * poder sustituirse más adelante por una llamada a un modelo de lenguaje
 * (usando este mismo catálogo como contexto/RAG) sin cambiar el contrato
 * de datos (`SessionPlan`).
 */
export function generateTrainingSession(input: SessionGenerationInput): SessionPlan {
  const primaryObjective: TrainingObjective = input.objectives[0] ?? "Técnica";
  const objectivesLabel = input.objectives.join(", ") || primaryObjective;
  const content = objectiveContent[primaryObjective];
  const conditionEffects = computeConditionEffects(input.specialConditions);
  const effectiveIntensity = conditionEffects.intensityDowngrade ? "Baja" : input.intensity;
  const totalMin = conditionEffects.totalCapMin
    ? Math.min(input.durationMin, conditionEffects.totalCapMin)
    : input.durationMin;

  const warmupMin = round5(totalMin * 0.16);
  const cooldownMin = round5(totalMin * 0.07);

  let appliedMatchShare = 0.28 + conditionEffects.appliedMatchShareDelta;
  appliedMatchShare = Math.max(0.12, Math.min(0.4, appliedMatchShare));

  const remaining = Math.max(20, totalMin - warmupMin - cooldownMin);
  const appliedMatchMin = round5(remaining * appliedMatchShare);
  const exercisesTotalMin = Math.max(15, remaining - appliedMatchMin);

  const shareSum = content.exercises.reduce((sum, e) => sum + e.baseDurationShare, 0);
  const exercises = content.exercises.map((template) =>
    buildExercise(template, round5((template.baseDurationShare / shareSum) * exercisesTotalMin), input)
  );

  const ageRange = ageRangeByCategory[input.category] ?? input.category;

  const objectivePhrase = input.objectives.length > 1 ? `los objetivos de "${objectivesLabel}"` : `el objetivo de "${objectivesLabel}"`;
  const generalObjective =
    `Desarrollar ${objectivePhrase} en jugadores de ${input.category} (${ageRange}), ` +
    `con una intensidad ${effectiveIntensity.toLowerCase()} adecuada al momento de la temporada, en ${totalMin} minutos de trabajo en ${input.location || "el lugar habitual de entrenamiento"}.`;

  const specificObjectives = [
    exercises[0]?.objective,
    exercises[1]?.objective,
    content.appliedMatch.objective,
    "Fomentar disciplina, respeto y trabajo en equipo durante toda la sesión — formamos personas, no solo futbolistas.",
  ].filter((s): s is string => !!s);

  const indicators = Array.from(new Set([...content.indicators, "Disciplina"])).slice(0, 6);

  const observationsParts = [
    `Sesión generada para ${input.playersCount} jugadores de ${input.category}, enfoque ${objectivesLabel.toLowerCase()} con intensidad ${effectiveIntensity.toLowerCase()}.`,
    ...conditionEffects.notes,
  ];
  if (input.injuryNote?.trim()) {
    observationsParts.push(`Jugadores lesionados — detalle del cuerpo técnico: ${input.injuryNote.trim()}.`);
  }
  if (conditionEffects.intensityDowngrade && input.intensity !== "Baja") {
    observationsParts.push(
      `La intensidad solicitada (${input.intensity}) se ajustó a Baja por la condición especial indicada — prioriza la salud del jugador sobre la carga planificada.`
    );
  }

  return {
    generalObjective,
    specificObjectives,
    warmup: buildWarmup(input, warmupMin, content.warmupFocus),
    exercises,
    appliedMatch: buildAppliedMatch(content.appliedMatch, appliedMatchMin),
    cooldown: {
      durationMin: cooldownMin,
      description:
        "Trote suave regenerativo, estiramiento activo de los grupos musculares principales (cuádriceps, isquiotibiales, gemelos, aductores) y cierre grupal breve con mensaje del entrenador sobre lo trabajado en el día.",
    },
    indicators,
    observations: observationsParts.join(" "),
  };
}
