import type { LucideIcon } from "lucide-react";
import {
  Award,
  Eye,
  HeartHandshake,
  Home as HomeIcon,
  MapPinned,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";

export interface NosotrosPillar {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

/** Misión / Visión / Valores / Enfoque / Propósito — el "quiénes somos" en una lectura de 10 segundos. */
export const nosotrosPillars: NosotrosPillar[] = [
  {
    id: "mision",
    icon: Target,
    title: "Nuestra misión",
    description:
      "Formar futbolistas con excelencia deportiva y humana, inspirados en valores que los preparen para competir y transformar su entorno.",
  },
  {
    id: "vision",
    icon: Eye,
    title: "Nuestra visión",
    description:
      "Ser la academia de referencia en formación deportiva de Córdoba, reconocida por desarrollar talento y formar mejores personas.",
  },
  {
    id: "valores",
    icon: Award,
    title: "Nuestros valores",
    description: "Disciplina, respeto, humildad, compromiso, trabajo en equipo y mentalidad ganadora.",
  },
  {
    id: "enfoque",
    icon: Users,
    title: "Nuestro enfoque",
    description:
      "Desarrollo integral: técnico, táctico, físico y emocional — acompañamiento constante a cada jugador y su familia.",
  },
  {
    id: "proposito",
    icon: ShieldCheck,
    title: "Nuestro propósito",
    description: "Dejar huella dentro y fuera de la cancha, formando líderes que representen a Jaguares con carácter.",
  },
];

export interface WhyChooseUsItem {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

/** "¿Por qué elegirnos?" — mismo patrón visual que Metodología en el home. */
export const whyChooseUsItems: WhyChooseUsItem[] = [
  {
    id: "formacion-integral",
    icon: Sparkles,
    title: "Formación integral",
    description: "Trabajamos el desarrollo deportivo, académico, emocional y social de cada jugador.",
  },
  {
    id: "entrenadores",
    icon: HeartHandshake,
    title: "Entrenadores calificados",
    description: "Cuerpo técnico apasionado, en formación continua y cercano a cada familia.",
  },
  {
    id: "metodologia",
    icon: TrendingUp,
    title: "Metodología moderna",
    description: "Entrenamientos estructurados por sesión, con seguimiento individual de cada jugador.",
  },
  {
    id: "acompanamiento",
    icon: Users,
    title: "Acompañamiento familiar",
    description: "Creemos en el trabajo conjunto con las familias para el óptimo desarrollo del jugador.",
  },
  {
    id: "instalaciones",
    icon: HomeIcon,
    title: "Instalaciones adecuadas",
    description: "Espacios seguros y equipados para entrenar y crecer con tranquilidad.",
  },
  {
    id: "proyeccion",
    icon: Trophy,
    title: "Proyección deportiva",
    description: "Preparamos a nuestros jugadores para competir en torneos locales y regionales.",
  },
];

export interface NosotrosStat {
  id: string;
  icon: LucideIcon;
  value: string;
  label: string;
}

/**
 * Cifras reales del punto de partida (Sub-15, única categoría activa del
 * MVP) — mismos números que ya usa SubQuinceSection. Deliberadamente NO se
 * inventan cifras grandes de una academia consolidada: el club está
 * arrancando y la comunicación debe ser honesta sobre eso.
 */
export const nosotrosStats: NosotrosStat[] = [
  { id: "jugadores", icon: Users, value: "28", label: "Jugadores en formación" },
  { id: "categoria", icon: Trophy, value: "Sub-15", label: "Categoría activa" },
  { id: "entrenamientos", icon: TrendingUp, value: "5", label: "Entrenamientos por semana" },
  { id: "torneos", icon: Award, value: "3", label: "Torneos activos" },
  { id: "sede", icon: MapPinned, value: "Córdoba", label: "Sede del proyecto" },
];
