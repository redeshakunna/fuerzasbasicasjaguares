/**
 * Catálogo de habilidades evaluables — vive en código, no en la base de
 * datos, para poder ajustarlo sin migraciones. Cada evaluación guarda un
 * puntaje (0-10, admite un decimal) por habilidad en `evaluation_items`;
 * el promedio por categoría (Técnica/Táctica/Física/Mental) se calcula acá
 * y se guarda también en `evaluations` para que el resto de la app (tarjeta
 * "Última evaluación", gráfico de evolución) no tenga que recalcular nada.
 *
 * Mental/Actitud está armado directamente sobre los valores del club
 * (Disciplina, Respeto, Humildad, Compromiso, Trabajo en equipo, Liderazgo,
 * Mentalidad ganadora) — la evaluación deportiva y la formación en valores
 * son la misma conversación, no dos cosas separadas.
 */

export type EvaluationCategory = "Técnica" | "Táctica" | "Física" | "Mental";

export interface EvaluationSkill {
  id: string;
  label: string;
  category: EvaluationCategory;
}

export const evaluationCategories: EvaluationCategory[] = ["Técnica", "Táctica", "Física", "Mental"];

export const evaluationCategoryLabel: Record<EvaluationCategory, string> = {
  Técnica: "Técnica",
  Táctica: "Táctica",
  Física: "Física",
  Mental: "Mental / Actitud",
};

export const evaluationSkills: EvaluationSkill[] = [
  // Técnica
  { id: "control_balon", label: "Control de balón", category: "Técnica" },
  { id: "pase_corto", label: "Pase corto", category: "Técnica" },
  { id: "pase_largo", label: "Pase largo", category: "Técnica" },
  { id: "conduccion", label: "Conducción", category: "Técnica" },
  { id: "regate", label: "Regate", category: "Técnica" },
  { id: "definicion", label: "Definición", category: "Técnica" },
  { id: "primer_toque", label: "Primer toque", category: "Técnica" },
  { id: "juego_aereo", label: "Juego aéreo", category: "Técnica" },
  { id: "vision_de_juego", label: "Visión de juego", category: "Técnica" },
  { id: "desmarque", label: "Desmarque", category: "Técnica" },

  // Táctica
  { id: "posicionamiento", label: "Posicionamiento", category: "Táctica" },
  { id: "marcaje", label: "Marcaje", category: "Táctica" },
  { id: "lectura_de_juego", label: "Lectura de juego", category: "Táctica" },
  { id: "toma_de_decisiones", label: "Toma de decisiones", category: "Táctica" },
  { id: "cobertura_defensiva", label: "Cobertura defensiva", category: "Táctica" },
  { id: "transicion_ataque_defensa", label: "Transición ataque-defensa", category: "Táctica" },
  { id: "juego_sin_balon", label: "Juego sin balón", category: "Táctica" },
  { id: "presion_tras_perdida", label: "Presión tras pérdida", category: "Táctica" },
  { id: "amplitud_profundidad", label: "Amplitud y profundidad", category: "Táctica" },
  { id: "disciplina_tactica", label: "Disciplina táctica", category: "Táctica" },

  // Física
  { id: "velocidad", label: "Velocidad", category: "Física" },
  { id: "resistencia", label: "Resistencia", category: "Física" },
  { id: "fuerza", label: "Fuerza", category: "Física" },
  { id: "agilidad", label: "Agilidad", category: "Física" },
  { id: "salto", label: "Salto", category: "Física" },
  { id: "coordinacion", label: "Coordinación", category: "Física" },
  { id: "flexibilidad", label: "Flexibilidad", category: "Física" },
  { id: "equilibrio", label: "Equilibrio", category: "Física" },
  { id: "potencia_remate", label: "Potencia de remate", category: "Física" },
  { id: "recuperacion_fisica", label: "Recuperación física", category: "Física" },

  // Mental / Actitud — valores del club
  { id: "disciplina", label: "Disciplina", category: "Mental" },
  { id: "respeto", label: "Respeto", category: "Mental" },
  { id: "humildad", label: "Humildad", category: "Mental" },
  { id: "compromiso", label: "Compromiso", category: "Mental" },
  { id: "trabajo_en_equipo", label: "Trabajo en equipo", category: "Mental" },
  { id: "liderazgo", label: "Liderazgo", category: "Mental" },
  { id: "mentalidad_ganadora", label: "Mentalidad ganadora", category: "Mental" },
  { id: "concentracion", label: "Concentración", category: "Mental" },
  { id: "manejo_de_presion", label: "Manejo de la presión", category: "Mental" },
  { id: "actitud_ante_error", label: "Actitud ante el error", category: "Mental" },
];

export function skillsByCategory(category: EvaluationCategory): EvaluationSkill[] {
  return evaluationSkills.filter((s) => s.category === category);
}

export function skillLabel(skillId: string): string {
  return evaluationSkills.find((s) => s.id === skillId)?.label ?? skillId;
}

/** Promedio (0-10, un decimal) de los puntajes de una categoría. `null` si no hay ninguno cargado. */
export function averageForCategory(scores: Record<string, number>, category: EvaluationCategory): number | null {
  const ids = skillsByCategory(category).map((s) => s.id);
  const values = ids.map((id) => scores[id]).filter((v): v is number => typeof v === "number");
  if (values.length === 0) return null;
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.round(avg * 10) / 10;
}

/** Promedio general (0-10) de las 4 categorías. `null` si ninguna tiene datos. */
export function overallAverage(categoryAverages: Array<number | null>): number | null {
  const values = categoryAverages.filter((v): v is number => v !== null);
  if (values.length === 0) return null;
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.round(avg * 10) / 10;
}
