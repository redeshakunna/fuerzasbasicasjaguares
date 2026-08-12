/**
 * Generador del Informe de Evolución mensual — igual criterio que
 * evaluations/summary-generator.ts: sistema experto por reglas, no un modelo
 * de lenguaje real (no hay llave de IA conectada en este proyecto todavía).
 * Combina el promedio de evaluaciones del mes, la asistencia y las
 * observaciones del entrenador en un párrafo editable. El día que haya una
 * API key de un modelo real, esta función se reemplaza sin tocar el resto
 * del módulo (misma firma de entrada/salida).
 */

const monthNames = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

export function periodLabel(period: string): string {
  const [y, m] = period.split("-").map(Number);
  return `${monthNames[(m ?? 1) - 1]} de ${y}`;
}

export interface ReportGeneratorInput {
  playerFirstName: string;
  period: string; // YYYY-MM
  averageScore: number | null; // 0-10, promedio de evaluaciones del mes
  previousAverageScore: number | null; // promedio del mes anterior con evaluaciones, para tendencia
  attendancePct: number | null; // 0-100
  evaluationsCount: number;
  coachNotes: string[];
}

function scoreBand(score: number): "excelente" | "bueno" | "regular" | "bajo" {
  if (score >= 8.5) return "excelente";
  if (score >= 6.5) return "bueno";
  if (score >= 4.5) return "regular";
  return "bajo";
}

const openers: Record<ReturnType<typeof scoreBand>, string[]> = {
  excelente: ["tuvo un mes sobresaliente", "cerró el mes con un nivel muy alto", "mantuvo un desempeño excelente durante el mes"],
  bueno: ["tuvo un buen mes de formación", "mostró un desempeño sólido durante el mes", "cumplió bien las exigencias del mes"],
  regular: ["tuvo un mes irregular", "mostró altibajos durante el mes"],
  bajo: ["tuvo un mes por debajo de lo esperado", "enfrentó dificultades para rendir a su nivel habitual"],
};

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length] as T;
}

export function generateMonthlyReport(input: ReportGeneratorInput): string {
  const { playerFirstName, period, averageScore, previousAverageScore, attendancePct, evaluationsCount, coachNotes } = input;
  const label = periodLabel(period);

  if (evaluationsCount === 0) {
    return `${playerFirstName} no registra evaluaciones durante ${label}. Cuando se registren evaluaciones de este mes, este informe se podrá generar con el detalle de su evolución.`;
  }

  const score = averageScore ?? 0;
  const band = scoreBand(score);
  const seed = Math.round(score * 10) + evaluationsCount;
  const opener = pick(openers[band], seed);

  const sentences: string[] = [`Durante ${label}, ${playerFirstName} ${opener}, con un promedio de evaluación de ${score.toFixed(1)}/10.`];

  if (previousAverageScore !== null) {
    const delta = score - previousAverageScore;
    if (delta >= 0.5) {
      sentences.push(`Esto representa una mejora frente al mes anterior (${previousAverageScore.toFixed(1)}/10).`);
    } else if (delta <= -0.5) {
      sentences.push(`Esto representa un descenso frente al mes anterior (${previousAverageScore.toFixed(1)}/10) — vale la pena reforzar el seguimiento.`);
    } else {
      sentences.push("Se mantuvo en un nivel similar al del mes anterior.");
    }
  }

  if (attendancePct !== null) {
    if (attendancePct >= 90) {
      sentences.push(`Su asistencia fue excelente: ${attendancePct}% de los entrenamientos del mes.`);
    } else if (attendancePct >= 70) {
      sentences.push(`Su asistencia fue buena: ${attendancePct}% de los entrenamientos del mes.`);
    } else {
      sentences.push(`Su asistencia estuvo baja este mes: ${attendancePct}% de los entrenamientos — es importante conversar con la familia al respecto.`);
    }
  }

  // Nota destacada del cuerpo técnico — como máximo una, para no repetir frases entre varias
  // evaluaciones del mismo mes (esa era la causa de resúmenes con oraciones duplicadas).
  const distinctNotes = Array.from(new Set(coachNotes.map((n) => n.trim()).filter(Boolean)));
  if (distinctNotes.length > 0) {
    sentences.push(distinctNotes[0] as string);
  }

  return sentences.join(" ");
}

/* ------------------------------------------------------------------------ */
/*  Conceptos por área — técnica, táctica, física, actitud                   */
/* ------------------------------------------------------------------------ */

export type ReportArea = "technical" | "tactical" | "physical" | "attitude";

export const areaLabel: Record<ReportArea, string> = {
  technical: "Técnica",
  tactical: "Táctica",
  physical: "Física",
  attitude: "Actitud / disciplina",
};

const areaConceptBank: Record<ReportArea, Record<ReturnType<typeof scoreBand>, string[]>> = {
  technical: {
    excelente: [
      "Su técnica individual fue el punto más fuerte del mes — mucho dominio del balón.",
      "Destaca por la calidad de su control y su definición.",
    ],
    bueno: [
      "Muestra una base técnica sólida y en crecimiento constante.",
      "Buena ejecución en los fundamentos técnicos básicos.",
    ],
    regular: [
      "Su ejecución técnica todavía es inconsistente entre sesiones.",
      "Necesita más repetición en los fundamentos técnicos.",
    ],
    bajo: [
      "La parte técnica requiere trabajo prioritario en las próximas semanas.",
      "Debe reforzar control y pase como base para el resto del juego.",
    ],
  },
  tactical: {
    excelente: [
      "Lee el juego con mucha claridad y se posiciona muy bien en cancha.",
      "Toma decisiones tácticas acertadas la mayor parte del tiempo.",
    ],
    bueno: [
      "Entiende bien su rol dentro del sistema de juego.",
      "Va mejorando su ubicación y sus tiempos de decisión.",
    ],
    regular: [
      "Su posicionamiento aún es irregular en ciertas fases del juego.",
      "Le cuesta anticipar algunas jugadas — trabajo de lectura pendiente.",
    ],
    bajo: [
      "Necesita trabajar la lectura de juego y el posicionamiento como prioridad.",
      "Todavía se desubica con frecuencia dentro de la cancha.",
    ],
  },
  physical: {
    excelente: [
      "Su condición física está en un nivel muy alto para su categoría.",
      "Sostiene un ritmo físico excelente durante toda la sesión.",
    ],
    bueno: [
      "Su nivel físico responde bien a la exigencia de los entrenamientos.",
      "Mantiene un buen ritmo físico en la mayoría de la sesión.",
    ],
    regular: [
      "Su rendimiento físico baja hacia el final de la sesión.",
      "Aún debe trabajar resistencia y explosividad.",
    ],
    bajo: [
      "El aspecto físico es un área a reforzar de forma prioritaria.",
      "Se fatiga antes de lo esperado para su categoría.",
    ],
  },
  attitude: {
    excelente: [
      "Su actitud es un ejemplo dentro del grupo.",
      "Muestra disciplina y compromiso excepcionales en cada sesión.",
    ],
    bueno: [
      "Mantiene una actitud positiva y comprometida en general.",
      "Responde bien a las correcciones del cuerpo técnico.",
    ],
    regular: [
      "Su actitud es variable — hay días de mucho compromiso y otros de bajo enfoque.",
      "Debe trabajar la constancia en su actitud dentro del grupo.",
    ],
    bajo: [
      "La actitud y disciplina son el principal punto a corregir este mes.",
      "Necesita mejorar su compromiso con el grupo y las indicaciones del técnico.",
    ],
  },
};

export type AreaConceptResult = Record<ReportArea, string | null>;

/** Un concepto corto por área, generado a partir del promedio del mes — `null` si no hay datos de esa área. */
export function generateAreaConcepts(areaScores: Record<ReportArea, number | null>, evaluationsCount: number): AreaConceptResult {
  const result = {} as AreaConceptResult;
  (Object.keys(areaConceptBank) as ReportArea[]).forEach((area) => {
    const score = areaScores[area];
    if (evaluationsCount === 0 || score === null) {
      result[area] = null;
      return;
    }
    const band = scoreBand(score);
    const seed = Math.round(score * 10) + evaluationsCount;
    result[area] = `${pick(areaConceptBank[area][band], seed)} (${score.toFixed(1)}/10)`;
  });
  return result;
}

/* ------------------------------------------------------------------------ */
/*  Tareas / compromisos — priorizan el área con el puntaje más bajo         */
/* ------------------------------------------------------------------------ */

const areaTaskBank: Record<ReportArea, string> = {
  technical: "Trabajar control orientado y definición con ambos perfiles.",
  tactical: "Reforzar posicionamiento y lectura de las transiciones defensa-ataque.",
  physical: "Sumar trabajo de resistencia y velocidad en los entrenamientos libres.",
  attitude: "Conversar sobre constancia y compromiso dentro y fuera de la cancha.",
};

/** Compromisos sugeridos para el próximo período — hasta 2, priorizando las áreas más débiles. */
export function generateTasks(areaScores: Record<ReportArea, number | null>, evaluationsCount: number): string {
  if (evaluationsCount === 0) return "";

  const weak = (Object.entries(areaScores) as [ReportArea, number | null][])
    .filter(([, score]) => score !== null && score < 7.5)
    .sort((a, b) => (a[1] as number) - (b[1] as number))
    .slice(0, 2)
    .map(([area]) => areaTaskBank[area]);

  if (weak.length > 0) return weak.join(" ");
  return "Mantener el nivel actual y seguir sumando minutos de competencia y entrenamiento.";
}

/* ------------------------------------------------------------------------ */
/*  Recomendación de categoría / grupo de desempeño                          */
/* ------------------------------------------------------------------------ */

export interface RecommendationInput {
  averageScore: number | null;
  previousAverageScore: number | null;
  attendancePct: number | null;
  evaluationsCount: number;
  category: string;
  performanceGroup: string | null;
  nextCategory: string | null;
}

export interface RecommendationResult {
  note: string;
  suggestedGroup: "A" | "B" | null;
  suggestedCategory: string | null;
}

/**
 * Recomendación de categoría/grupo de desempeño en base al desempeño del mes — siempre queda
 * como sugerencia para que el cuerpo técnico decida (nunca cambia nada automáticamente; el
 * cambio real se aplica a mano desde el perfil del jugador, igual que hoy).
 */
export function generateRecommendation(input: RecommendationInput): RecommendationResult | null {
  const { averageScore, previousAverageScore, attendancePct, evaluationsCount, performanceGroup, nextCategory: next } = input;
  if (evaluationsCount === 0 || averageScore === null) return null;

  const score = averageScore;
  const delta = previousAverageScore !== null ? score - previousAverageScore : 0;
  const goodAttendance = attendancePct === null || attendancePct >= 80;

  if (score >= 8.5) {
    if (performanceGroup === "B") {
      return {
        note: `Su nivel de desempeño este mes (${score.toFixed(1)}/10) sugiere que está listo para pasar al Grupo A.`,
        suggestedGroup: "A",
        suggestedCategory: null,
      };
    }
    if (goodAttendance && next) {
      return {
        note: `Desempeño sobresaliente y sostenido (${score.toFixed(1)}/10) — vale la pena que el cuerpo técnico evalúe su paso a ${next}.`,
        suggestedGroup: null,
        suggestedCategory: next,
      };
    }
    if (!goodAttendance) {
      return {
        note: `Su nivel de juego es sobresaliente (${score.toFixed(1)}/10), pero la asistencia irregular conviene resolverla antes de considerar un ascenso.`,
        suggestedGroup: null,
        suggestedCategory: null,
      };
    }
    return {
      note: `Mantiene un nivel sobresaliente (${score.toFixed(1)}/10) — ya está en la categoría más alta disponible por ahora.`,
      suggestedGroup: null,
      suggestedCategory: null,
    };
  }

  if (score < 4.5) {
    if (performanceGroup === "A") {
      return {
        note: `Su rendimiento reciente (${score.toFixed(1)}/10) sugiere pasar temporalmente al Grupo B para reforzar fundamentos.`,
        suggestedGroup: "B",
        suggestedCategory: null,
      };
    }
    return {
      note: `Se recomienda un plan de refuerzo individual (${score.toFixed(1)}/10) antes de pensar en cualquier ascenso de grupo o categoría.`,
      suggestedGroup: null,
      suggestedCategory: null,
    };
  }

  if (delta <= -1.5) {
    return {
      note: `Se mantiene dentro de su categoría y grupo actuales, pero el descenso frente al mes anterior amerita un seguimiento más cercano.`,
      suggestedGroup: null,
      suggestedCategory: null,
    };
  }

  return {
    note: "Su desempeño es estable — se recomienda mantener la categoría y el grupo actuales por ahora.",
    suggestedGroup: null,
    suggestedCategory: null,
  };
}

/* ------------------------------------------------------------------------ */
/*  Informe grupal — resumen agregado de toda una categoría, sin exponer     */
/*  la nota individual de cada jugador.                                      */
/* ------------------------------------------------------------------------ */

const groupOpeners: Record<ReturnType<typeof scoreBand>, string[]> = {
  excelente: ["tuvo un mes sobresaliente como grupo", "mostró un nivel colectivo muy alto durante el mes"],
  bueno: ["tuvo un buen mes de formación como equipo", "mostró un desempeño colectivo sólido"],
  regular: ["tuvo un mes irregular como grupo", "mostró altibajos en el rendimiento colectivo"],
  bajo: ["tuvo un mes por debajo de lo esperado como equipo", "enfrentó dificultades colectivas para rendir a su nivel habitual"],
};

export interface GroupReportInput {
  category: string;
  period: string;
  averageScore: number | null;
  previousAverageScore: number | null;
  attendancePct: number | null;
  evaluationsCount: number;
  playerCount: number;
  standoutNames: string[];
}

/** Genera el resumen narrativo del informe grupal de una categoría — mismo motor de reglas que el informe individual. */
export function generateGroupReport(input: GroupReportInput): string {
  const { category, period, averageScore, previousAverageScore, attendancePct, evaluationsCount, playerCount, standoutNames } = input;
  const label = periodLabel(period);

  if (evaluationsCount === 0) {
    return `${category} no registra evaluaciones durante ${label}. Cuando el cuerpo técnico registre evaluaciones de este mes, el informe grupal se podrá generar con el detalle del plantel.`;
  }

  const score = averageScore ?? 0;
  const band = scoreBand(score);
  const seed = Math.round(score * 10) + evaluationsCount;
  const opener = pick(groupOpeners[band], seed);

  const sentences: string[] = [
    `Durante ${label}, el plantel de ${category} (${playerCount} jugadores) ${opener}, con un promedio grupal de ${score.toFixed(1)}/10.`,
  ];

  if (previousAverageScore !== null) {
    const delta = score - previousAverageScore;
    if (delta >= 0.5) {
      sentences.push(`El grupo mejoró frente al mes anterior (${previousAverageScore.toFixed(1)}/10).`);
    } else if (delta <= -0.5) {
      sentences.push(`El grupo descendió frente al mes anterior (${previousAverageScore.toFixed(1)}/10) — vale la pena reforzar el seguimiento colectivo.`);
    } else {
      sentences.push("El grupo se mantuvo en un nivel similar al del mes anterior.");
    }
  }

  if (attendancePct !== null) {
    if (attendancePct >= 90) {
      sentences.push(`La asistencia del plantel fue excelente: ${attendancePct}% en promedio durante el mes.`);
    } else if (attendancePct >= 70) {
      sentences.push(`La asistencia del plantel fue buena: ${attendancePct}% en promedio durante el mes.`);
    } else {
      sentences.push(`La asistencia del plantel estuvo baja este mes: ${attendancePct}% en promedio — conviene reforzar el compromiso de las familias.`);
    }
  }

  if (standoutNames.length > 0) {
    const names = standoutNames.slice(0, 5).join(", ");
    sentences.push(`Se destacaron especialmente: ${names}.`);
  }

  return sentences.join(" ");
}
