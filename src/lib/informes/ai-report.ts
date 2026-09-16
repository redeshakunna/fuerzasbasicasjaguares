import Anthropic from "@anthropic-ai/sdk";
import { periodLabel, type ReportArea } from "./report-generator";

export interface AiReportInput {
  playerFirstName: string;
  period: string;
  averageScore: number | null;
  previousAverageScore: number | null;
  attendancePct: number | null;
  evaluationsCount: number;
  areaScores: Record<ReportArea, number | null>;
  coachNotes: string[];
  coachObservations: string;
}

export interface AiReportResult {
  summary: string;
  technicalNotes: string | null;
  tacticalNotes: string | null;
  physicalNotes: string | null;
  attitudeNotes: string | null;
  tasks: string;
}

const areaKeyToField: Record<ReportArea, keyof AiReportResult> = {
  technical: "technicalNotes",
  tactical: "tacticalNotes",
  physical: "physicalNotes",
  attitude: "attitudeNotes",
};

/**
 * Genera el Informe de Evolución con un modelo real (mismo Claude ya conectado
 * en el chat de la plataforma) a partir de las estadísticas reales del jugador
 * y las observaciones que escribe el técnico. Devuelve `null` si la IA no está
 * disponible o falla — el llamador debe usar el generador por reglas como respaldo,
 * para que un informe nunca se quede sin generar por un problema de red/API.
 */
export async function generateReportWithAI(input: AiReportInput): Promise<AiReportResult | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("generateReportWithAI() — falta ANTHROPIC_API_KEY, se usará el generador por reglas.");
    return null;
  }

  const label = periodLabel(input.period);
  const areaLines = (Object.keys(input.areaScores) as ReportArea[])
    .map((area) => `- ${area}: ${input.areaScores[area] !== null ? `${input.areaScores[area]!.toFixed(1)}/10` : "sin datos"}`)
    .join("\n");
  const notesLines = input.coachNotes.length > 0 ? input.coachNotes.map((n) => `- ${n}`).join("\n") : "(ninguna)";

  const prompt = `Eres un asistente que redacta el Informe de Evolución mensual de un jugador de fútbol formativo (categoría Sub-15) para su familia. Escribe en español, tono cercano y profesional, sin inventar datos que no te den.

Jugador: ${input.playerFirstName}
Período: ${label}
Promedio de evaluación del mes: ${input.averageScore !== null ? `${input.averageScore.toFixed(1)}/10` : "sin evaluaciones este mes"}
Promedio del mes anterior: ${input.previousAverageScore !== null ? `${input.previousAverageScore.toFixed(1)}/10` : "sin datos"}
Asistencia del mes: ${input.attendancePct !== null ? `${input.attendancePct}%` : "sin datos"}
Cantidad de evaluaciones registradas: ${input.evaluationsCount}
Puntajes por área:
${areaLines}
Notas puntuales ya registradas por el cuerpo técnico durante el mes:
${notesLines}

Observaciones del técnico para este informe (úsalas como base principal del contenido, son la fuente más importante):
"""
${input.coachObservations.trim() || "(el técnico no escribió observaciones adicionales — apóyate solo en las estadísticas)"}
"""

Responde ÚNICAMENTE con un objeto JSON (sin markdown, sin texto antes o después) con esta forma exacta:
{
  "summary": "resumen general del mes, 3-5 oraciones",
  "technicalNotes": "1-2 oraciones sobre técnica, o null si no hay evaluaciones",
  "tacticalNotes": "1-2 oraciones sobre táctica, o null si no hay evaluaciones",
  "physicalNotes": "1-2 oraciones sobre físico, o null si no hay evaluaciones",
  "attitudeNotes": "1-2 oraciones sobre actitud/disciplina, o null si no hay evaluaciones",
  "tasks": "1-2 tareas o compromisos concretos para el próximo mes"
}`;

  try {
    const anthropic = new Anthropic({ apiKey });
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === "text");
    if (!textBlock) return null;

    const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
    if (typeof parsed.summary !== "string" || typeof parsed.tasks !== "string") return null;

    const notesFor = (area: ReportArea): string | null => {
      const value = parsed[areaKeyToField[area]];
      return typeof value === "string" && value.trim() ? value.trim() : null;
    };

    return {
      summary: parsed.summary.trim(),
      technicalNotes: notesFor("technical"),
      tacticalNotes: notesFor("tactical"),
      physicalNotes: notesFor("physical"),
      attitudeNotes: notesFor("attitude"),
      tasks: parsed.tasks.trim(),
    };
  } catch (err) {
    console.error("generateReportWithAI() falló, se usará el generador por reglas:", err);
    return null;
  }
}
