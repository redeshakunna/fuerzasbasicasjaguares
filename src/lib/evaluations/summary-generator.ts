/**
 * Generador de resumen de evaluación — hoy es un sistema experto por reglas
 * (no un modelo de lenguaje real: en este proyecto no hay una llave de IA
 * conectada todavía, ver session-generator.ts para el mismo criterio en
 * Entrenamientos). Combina los 5 puntajes con la observación del entrenador
 * en un párrafo natural que el entrenador puede editar antes de guardar.
 * El día que haya una API key de un modelo de lenguaje, esta función se
 * puede reemplazar sin tocar el resto del módulo (misma firma de entrada/salida).
 */

export interface QuickEvaluationScores {
  technical: number; // 0-5
  tactical: number; // 0-5
  physical: number; // 0-5
  discipline: number; // 0-5
  attitude: number; // 0-5
}

export interface SummaryGeneratorInput {
  playerFirstName: string;
  scores: QuickEvaluationScores;
  coachNotes: string;
}

const indicatorLabel: Record<keyof QuickEvaluationScores, string> = {
  technical: "la técnica",
  tactical: "la táctica",
  physical: "la condición física",
  discipline: "la disciplina",
  attitude: "la actitud",
};

const indicatorLabelCapitalized: Record<keyof QuickEvaluationScores, string> = {
  technical: "Su técnica",
  tactical: "Su lectura táctica",
  physical: "Su condición física",
  discipline: "Su disciplina",
  attitude: "Su actitud",
};

function overallOf(scores: QuickEvaluationScores): number {
  const values = Object.values(scores);
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function bestAndWorst(scores: QuickEvaluationScores) {
  const entries = Object.entries(scores) as [keyof QuickEvaluationScores, number][];
  const sorted = [...entries].sort((a, b) => b[1] - a[1]);
  const best = sorted[0]!;
  const worst = sorted[sorted.length - 1]!;
  return { best, worst };
}

const openers = {
  excelente: [
    "mostró un desempeño sobresaliente durante la sesión",
    "tuvo una actuación destacada durante todo el entrenamiento",
    "mantuvo un nivel muy alto a lo largo de la sesión",
  ],
  bueno: [
    "mostró buena disposición y compromiso durante la sesión",
    "tuvo un buen desempeño general en el entrenamiento",
    "respondió bien a las exigencias de la sesión",
  ],
  regular: [
    "tuvo un desempeño irregular durante la sesión",
    "mostró altibajos a lo largo del entrenamiento",
  ],
  bajo: [
    "tuvo dificultades para rendir al nivel esperado en esta sesión",
    "no logró mantener su nivel habitual durante la sesión",
  ],
};

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length] as T;
}

/** Genera un párrafo profesional editable a partir de los 5 puntajes y la observación del técnico. */
export function generateEvaluationSummary({ playerFirstName, scores, coachNotes }: SummaryGeneratorInput): string {
  const overall = overallOf(scores);
  const { best, worst } = bestAndWorst(scores);
  const seed = Math.round(overall * 10) + best[1] + worst[1];

  const band = overall >= 4.3 ? "excelente" : overall >= 3.3 ? "bueno" : overall >= 2.3 ? "regular" : "bajo";
  const opener = pick(openers[band], seed);

  const sentences: string[] = [`${playerFirstName} ${opener}.`];

  if (best[1] - worst[1] >= 0.5) {
    sentences.push(`${indicatorLabelCapitalized[best[0]]} fue lo más destacado.`);
    if (worst[1] < 4) {
      sentences.push(`Debe seguir trabajando ${indicatorLabel[worst[0]]} para dar el siguiente paso.`);
    }
  } else if (overall >= 4) {
    sentences.push("Mantuvo un nivel parejo en todos los aspectos evaluados.");
  }

  if (coachNotes.trim()) {
    sentences.push(coachNotes.trim());
  }

  return sentences.join(" ");
}
