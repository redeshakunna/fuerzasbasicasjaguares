import type { LucideIcon } from "lucide-react";
import { Clock, Heart, Mail, MapPin, Phone, Target, Trophy, UserCheck } from "lucide-react";

export interface FooterValue {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

/** Los 4 valores institucionales, franja inferior del footer. */
export const footerValues: FooterValue[] = [
  {
    id: "disciplina",
    icon: Target,
    title: "Disciplina",
    description: "Entrenamos el cuerpo y la mente para alcanzar la excelencia.",
  },
  {
    id: "formacion",
    icon: UserCheck,
    title: "Formación",
    description: "Desarrollamos talento con valores sólidos y educación integral.",
  },
  {
    id: "competencia",
    icon: Trophy,
    title: "Competencia",
    description: "Competimos para crecer, aprender y dejar huella en cada partido.",
  },
  {
    id: "pasion",
    icon: Heart,
    title: "Pasión",
    description: "Amamos el fútbol y transmitimos esa pasión cada día.",
  },
];

export interface ContactLine {
  id: string;
  icon: LucideIcon;
  text: string;
}

/**
 * Datos de contacto de ejemplo — reemplazar por los reales cuando estén
 * definidos (teléfono, correo y horario son placeholder).
 */
export const contactLines: ContactLine[] = [
  { id: "ubicacion", icon: MapPin, text: "Córdoba, Colombia" },
  { id: "telefono", icon: Phone, text: "+57 300 123 4567" },
  { id: "correo", icon: Mail, text: "info@jaguarescordoba.com" },
  { id: "horario", icon: Clock, text: "Lunes a Viernes\n7:00 AM - 6:00 PM" },
];
