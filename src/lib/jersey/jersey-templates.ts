import path from "node:path";
import type { PositionGroup } from "@/lib/data/positions";

export type JerseyTemplateKey = "campo" | "portero";

interface JerseyTemplateSpec {
  /** Ruta del archivo de camiseta (fondo + silueta + jersey), sin cabeza recortada. */
  imagePath: string;
  /** Máscara alpha del mismo tamaño: alpha=255 donde va la foto del jugador (cabeza/cuello), 0 donde queda la camiseta. */
  maskPath: string;
  /** Lado del lienzo cuadrado (px). Ambas plantillas comparten el mismo tamaño. */
  canvasSize: number;
  /** Recuadro donde debe encajar la foto recortada del jugador (cover-fit, centrado). */
  photoBox: { x: number; y: number; width: number; height: number };
}

const TEMPLATES_DIR = path.join(process.cwd(), "public", "jersey-templates");

/**
 * Coordenadas medidas directamente sobre las plantillas oficiales
 * (PlantillaJugador_Campo.png / PlantillaJugador_Portero.png, 1254x1254),
 * detectando por color la silueta de cabeza+cuello y su bounding box
 * (con un margen ya incluido para que la máscara con difuminado no deje
 * borde gris de la silueta original).
 */
export const JERSEY_TEMPLATES: Record<JerseyTemplateKey, JerseyTemplateSpec> = {
  campo: {
    imagePath: path.join(TEMPLATES_DIR, "campo.jpg"),
    maskPath: path.join(TEMPLATES_DIR, "campo-mask.png"),
    canvasSize: 1254,
    photoBox: { x: 441, y: 75, width: 407, height: 687 },
  },
  portero: {
    imagePath: path.join(TEMPLATES_DIR, "portero.jpg"),
    maskPath: path.join(TEMPLATES_DIR, "portero-mask.png"),
    canvasSize: 1254,
    photoBox: { x: 434, y: 63, width: 409, height: 658 },
  },
};

/** Arqueros usan la camiseta de portero; todo el resto, la de campo. */
export function templateKeyForPositionGroup(positionGroup: PositionGroup): JerseyTemplateKey {
  return positionGroup === "Arquero" ? "portero" : "campo";
}
