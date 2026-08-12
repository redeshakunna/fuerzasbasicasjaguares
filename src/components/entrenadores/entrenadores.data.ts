import type { LucideIcon } from "lucide-react";
import { ClipboardList, Compass, Dumbbell, HandMetal, Megaphone, Rocket, ShieldCheck, Users } from "lucide-react";

export interface StaffCard {
  id: string;
  role: string;
  icon: LucideIcon;
}

/**
 * Tarjetas de ejemplo para "Nuestros entrenadores" — el club hoy solo
 * tiene 2 roles reales confirmados (Entrenador Principal y Coordinador,
 * ver StaffRolesSection más abajo). Estas 4 muestran cómo se vería la
 * sección completa una vez el club defina y autorice publicar la
 * información de cada persona — por eso van marcadas "Perfil de
 * ejemplo" y sin nombre, foto ni credenciales inventadas.
 */
export const staffCards: StaffCard[] = [
  { id: "director-tecnico", role: "Director Técnico", icon: Megaphone },
  { id: "asistente-tecnico", role: "Asistente Técnico", icon: ClipboardList },
  { id: "preparador-fisico", role: "Preparador Físico", icon: Dumbbell },
  { id: "entrenador-arqueros", role: "Entrenador de Arqueros", icon: HandMetal },
];

export interface StaffRole {
  id: string;
  role: string;
  summary: string;
  responsibilities: string[];
}

/** Roles reales confirmados del cuerpo técnico Sub-15 (alcance MVP). */
export const staffRoles: StaffRole[] = [
  {
    id: "entrenador-principal",
    role: "Entrenador Principal",
    summary: "Lidera la planificación deportiva y el desarrollo técnico-táctico de cada jugador de la Sub-15.",
    responsibilities: [
      "Diseña y dirige los entrenamientos semanales",
      "Evalúa el desempeño técnico, físico y actitudinal",
      "Define la convocatoria y estrategia de cada partido",
    ],
  },
  {
    id: "coordinador",
    role: "Coordinador",
    summary: "Articula la operación diaria del club: logística, comunicación con familias y seguimiento integral.",
    responsibilities: [
      "Coordina calendario de entrenamientos y torneos",
      "Es el puente entre cuerpo técnico y padres de familia",
      "Supervisa asistencia, disciplina y bienestar del plantel",
    ],
  },
];

export interface PhilosophyPillar {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

/** "Nuestra filosofía" — 4 pilares del enfoque técnico del club. */
export const philosophyPillars: PhilosophyPillar[] = [
  {
    id: "formar-personas",
    icon: Users,
    title: "Formar personas",
    description: "Desarrollamos valores, disciplina y respeto como base para la vida.",
  },
  {
    id: "desarrollar-talento",
    icon: ShieldCheck,
    title: "Desarrollar talento",
    description: "Potenciamos las habilidades de cada jugador al máximo nivel.",
  },
  {
    id: "jugar-identidad",
    icon: Compass,
    title: "Jugar con identidad",
    description: "Promovemos un estilo de juego basado en la inteligencia y el trabajo.",
  },
  {
    id: "proyectar-futuro",
    icon: Rocket,
    title: "Proyectar al futuro",
    description: "Preparamos a nuestros jugadores para nuevos desafíos.",
  },
];
