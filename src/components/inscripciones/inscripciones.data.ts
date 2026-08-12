import type { LucideIcon } from "lucide-react";
import { CalendarCheck, FileCheck2, MessagesSquare, Trophy } from "lucide-react";

export interface InscriptionStep {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

/** Proceso de inscripción — 4 pasos, del primer contacto a la bienvenida. */
export const inscriptionSteps: InscriptionStep[] = [
  {
    id: "contacto",
    icon: MessagesSquare,
    title: "Contacto inicial",
    description: "Escríbenos por WhatsApp o correo contándonos la edad y experiencia del jugador.",
  },
  {
    id: "evaluacion",
    icon: CalendarCheck,
    title: "Evaluación deportiva",
    description: "Agendamos una prueba con el cuerpo técnico para conocer su nivel actual.",
  },
  {
    id: "documentacion",
    icon: FileCheck2,
    title: "Documentación",
    description: "Completas el registro con los documentos requeridos y datos del acudiente.",
  },
  {
    id: "bienvenida",
    icon: Trophy,
    title: "Bienvenida al plantel",
    description: "El jugador queda inscrito e inicia entrenamientos con su categoría.",
  },
];

export interface RequirementItem {
  id: string;
  text: string;
}

/** Requisitos de inscripción — categoría activa: Sub-15. */
export const requirementItems: RequirementItem[] = [
  { id: "edad", text: "Edad hasta 15 años (categoría Sub-15, activa hoy)" },
  { id: "registro", text: "Registro civil o tarjeta de identidad" },
  { id: "eps", text: "Afiliación vigente a EPS" },
  { id: "foto", text: "Fotografía reciente tipo documento" },
  { id: "acudiente", text: "Datos de contacto del padre, madre o acudiente" },
];
