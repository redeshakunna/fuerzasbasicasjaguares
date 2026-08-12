import type { LucideIcon } from "lucide-react";
import { Dumbbell, Goal, HeartHandshake, Route, TrendingUp } from "lucide-react";
import type { HeroAccent } from "@/components/hero/hero.types";

export interface MethodologyPillar {
  id: string;
  icon: LucideIcon;
  accent: HeroAccent | "gold";
  title: string;
  description: string;
}

/**
 * Pilares de metodología — iconografía de lucide-react (misma librería
 * que el resto del sitio usará, set consistente y con licencia abierta)
 * en vez de SVGs dibujados a mano.
 */
export const methodologyPillars: MethodologyPillar[] = [
  {
    id: "formacion-deportiva",
    icon: Goal,
    accent: "maroon",
    title: "Formación deportiva",
    description:
      "Desarrollamos habilidades técnicas, tácticas y cognitivas para el alto rendimiento.",
  },
  {
    id: "formacion-humana",
    icon: HeartHandshake,
    accent: "maroon",
    title: "Formación humana",
    description:
      "Creamos valores, disciplina y respeto para formar grandes personas.",
  },
  {
    id: "desarrollo-fisico",
    icon: Dumbbell,
    accent: "gold",
    title: "Desarrollo físico",
    description:
      "Potenciamos capacidades físicas con métodos científicos y personalizados.",
  },
  {
    id: "desarrollo-tactico",
    icon: Route,
    accent: "turquoise",
    title: "Desarrollo táctico",
    description:
      "Entendemos el juego y tomamos mejores decisiones dentro del campo.",
  },
  {
    id: "seguimiento-individual",
    icon: TrendingUp,
    accent: "green",
    title: "Seguimiento individual",
    description:
      "Acompañamos la evolución de cada jugador con datos y análisis profesional.",
  },
];
