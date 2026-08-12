import type { Tables } from "@/lib/supabase/database.types";
import type { EvaluationRow } from "./player-profile";

type PlayerRow = Tables<"players">;

export interface EstadoGeneral {
  score: number; // 0-10
  label: string;
  tone: "green" | "gold" | "maroon";
}

const statusScore: Record<PlayerRow["status"], number> = {
  Disponible: 10,
  Suspendido: 5,
  Lesionado: 3,
};

/**
 * Puntaje general del jugador (0-10) — promedio ponderado de rendimiento
 * (rating), estado físico/disciplinario, documentación y, si existe, la
 * última evaluación registrada. No inventa datos: cada componente sale de
 * un campo real o se omite del promedio si aún no existe.
 */
export function getEstadoGeneral(player: PlayerRow, latestEvaluation: EvaluationRow | null): EstadoGeneral {
  const components: number[] = [];

  if (player.rating !== null) components.push(player.rating * 2);
  components.push(statusScore[player.status]);
  components.push(player.documents_status === "Completo" ? 10 : 4);
  if (latestEvaluation?.overall_score !== null && latestEvaluation?.overall_score !== undefined) {
    // Las evaluaciones ya están en escala 0-10 (con decimales), no hace falta convertir.
    components.push(latestEvaluation.overall_score);
  }

  const score = components.length > 0 ? components.reduce((a, b) => a + b, 0) / components.length : 0;
  const rounded = Math.round(score * 10) / 10;

  let label = "Sin datos suficientes";
  let tone: EstadoGeneral["tone"] = "gold";
  if (components.length > 0) {
    if (rounded >= 9) {
      label = "Excelente";
      tone = "green";
    } else if (rounded >= 7.5) {
      label = "Muy bueno";
      tone = "green";
    } else if (rounded >= 6) {
      label = "Bueno";
      tone = "gold";
    } else if (rounded >= 4) {
      label = "Regular";
      tone = "gold";
    } else {
      label = "Necesita atención";
      tone = "maroon";
    }
  }

  return { score: rounded, label, tone };
}

/** Coordenadas (0-100%) del marcador de posición sobre la mini cancha. */
export function getPositionCoordinates(position: string, group: PlayerRow["position_group"]) {
  const isLeft = position.toLowerCase().includes("izquierd");
  const isRight = position.toLowerCase().includes("derech");

  switch (group) {
    case "Arquero":
      return { x: 50, y: 90 };
    case "Defensa":
      return { x: isLeft ? 22 : isRight ? 78 : 50, y: 72 };
    case "Volante":
      return { x: 50, y: 50 };
    case "Extremo":
      return { x: isLeft ? 18 : 82, y: 30 };
    case "Delantero":
      return { x: 50, y: 14 };
    default:
      return { x: 50, y: 50 };
  }
}
