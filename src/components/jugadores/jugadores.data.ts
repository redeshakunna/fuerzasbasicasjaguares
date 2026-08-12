import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  GraduationCap,
  LineChart,
  Shield,
  ShieldCheck,
  Star,
  Swords,
  Target,
  Trophy,
  Users,
} from "lucide-react";

export interface PositionLine {
  id: string;
  icon: LucideIcon;
  name: string;
  focus: string;
}

/**
 * Líneas de formación — no exponemos identidades ni fotos de jugadores
 * (son menores de edad); describimos qué desarrollamos en cada línea,
 * en el mismo espíritu editorial que una página de academia profesional.
 */
export const positionLines: PositionLine[] = [
  {
    id: "arqueros",
    icon: ShieldCheck,
    name: "Arqueros",
    focus: "Reflejos, salida de balón y liderazgo en la última línea.",
  },
  {
    id: "defensas",
    icon: Shield,
    name: "Defensas",
    focus: "Lectura de juego, marcaje y salida limpia desde el fondo.",
  },
  {
    id: "volantes",
    icon: Users,
    name: "Volantes",
    focus: "Control, visión de juego y conexión entre líneas.",
  },
  {
    id: "delanteros",
    icon: Swords,
    name: "Delanteros",
    focus: "Definición, movilidad y hambre de gol.",
  },
];

export interface PlayerJourneyStep {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

/** El camino del jugador dentro del club — de la formación al alto rendimiento. */
export const playerJourney: PlayerJourneyStep[] = [
  {
    id: "formacion",
    icon: GraduationCap,
    title: "Formación",
    description: "Fundamentos técnicos, valores y disciplina desde el primer día.",
  },
  {
    id: "entrenamiento",
    icon: CalendarDays,
    title: "Entrenamiento",
    description: "Sesiones planificadas por línea de posición, varias veces por semana.",
  },
  {
    id: "evaluacion",
    icon: Target,
    title: "Evaluación",
    description: "Seguimiento técnico, físico y actitudinal de forma continua.",
  },
  {
    id: "competencia",
    icon: Trophy,
    title: "Competencia",
    description: "Partidos donde cada jugador pone en práctica lo entrenado.",
  },
  {
    id: "evolucion",
    icon: LineChart,
    title: "Evolución",
    description: "Comparamos el progreso de cada jugador período a período.",
  },
  {
    id: "alto-rendimiento",
    icon: Star,
    title: "Alto rendimiento",
    description: "El objetivo final: jugadores listos para el siguiente nivel.",
  },
];
