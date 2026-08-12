/** Tipos de la sesión de entrenamiento generada por el Wizard. */

export const trainingObjectives = [
  "Técnica",
  "Táctica",
  "Definición",
  "Posesión",
  "Transiciones",
  "Fuerza",
  "Velocidad",
  "Recuperación",
  "Partido reducido",
  "Porteros",
  "Resistencia",
  "Coordinación",
] as const;

export type TrainingObjective = (typeof trainingObjectives)[number];

export const materialOptions = [
  "Balones",
  "Conos",
  "Escaleras de agilidad",
  "Aros",
  "Petos",
  "Porterías",
  "Estacas",
  "Bandas elásticas",
  "Pesas",
  "Cronómetro",
] as const;

export type MaterialOption = (typeof materialOptions)[number];

export const specialConditionOptions = [
  "Llueve",
  "Cancha pequeña",
  "Sólo media cancha",
  "Recuperación post partido",
  "Jugadores lesionados",
  "Preparación para torneo",
  "Semana de competencia",
] as const;

export type SpecialCondition = (typeof specialConditionOptions)[number];

export const intensityOptions = ["Baja", "Media", "Alta"] as const;
export type TrainingIntensityValue = (typeof intensityOptions)[number];

export const professionalRoleOptions = [
  "Director técnico",
  "Preparador físico",
  "Preparador de arqueros",
  "Fisioterapeuta",
] as const;
export type ProfessionalRole = (typeof professionalRoleOptions)[number];

export const creationModes = ["ia", "plantilla", "manual"] as const;
export type CreationMode = (typeof creationModes)[number];

export const indicatorPool = [
  "Pase",
  "Control",
  "Definición",
  "Velocidad",
  "Comunicación",
  "Intensidad",
  "Disciplina",
  "Liderazgo",
  "Posesión del balón",
  "Marcaje",
  "Resistencia",
  "Coordinación",
  "Toma de decisiones",
  "Trabajo en equipo",
  "Actitud ante el error",
] as const;

/** Entradas que responde el entrenador en los 6 pasos del Wizard. */
export interface SessionGenerationInput {
  category: string;
  sessionDate: string;
  startTime: string;
  durationMin: number;
  location: string;
  coachName: string;
  responsibleRole: ProfessionalRole;
  /** Uno o varios enfoques — el motor usa el primero como eje principal del catálogo de ejercicios. */
  objectives: TrainingObjective[];
  intensity: TrainingIntensityValue;
  playersCount: number;
  materials: string[];
  specialConditions: string[];
  /** Detalle opcional cuando "Jugadores lesionados" está marcado — solo uso interno del cuerpo técnico. */
  injuryNote?: string;
}

export interface SessionBlock {
  durationMin: number;
  description: string;
  organization: string;
  material: string[];
  objective: string;
}

export interface SessionExercise extends SessionBlock {
  name: string;
  coachCorrections: string[];
  commonMistakes: string[];
  variants: string[];
}

export interface SessionAppliedMatch {
  durationMin: number;
  organization: string;
  rules: string;
  objective: string;
}

/** La sesión completa generada — se guarda tal cual en `trainings.session` (jsonb). */
export interface SessionPlan {
  generalObjective: string;
  specificObjectives: string[];
  warmup: SessionBlock;
  exercises: SessionExercise[];
  appliedMatch: SessionAppliedMatch;
  cooldown: { durationMin: number; description: string };
  indicators: string[];
  observations: string;
}
