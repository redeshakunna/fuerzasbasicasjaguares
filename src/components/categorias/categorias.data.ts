import type { LucideIcon } from "lucide-react";
import { CalendarDays, Trophy, Users } from "lucide-react";
import { categoryAgeLimit, type Category } from "@/lib/data/categories";

export interface CategoryStat {
  id: string;
  icon: LucideIcon;
  value: string;
  label: string;
}

export interface CategoryContent {
  id: Category;
  ageRange: string;
  active: boolean;
  description: string;
  stats?: CategoryStat[];
  ctaHref?: string;
  ctaLabel?: string;
  photoSrc?: string;
}

/**
 * Contenido público de cada categoría.
 *
 * `active` refleja `activeCategories` en lib/data/categories.ts — hoy solo
 * Sub-15 tiene plantel real. Este archivo es el único lugar que hay que
 * tocar para activar una categoría nueva en la página pública:
 *   1. Agrega la categoría a `activeCategories` en lib/data/categories.ts.
 *   2. Aquí: pon `active: true` y completa `stats`, `ctaHref`, `ctaLabel`
 *      y `photoSrc`.
 * CategoryRow.tsx no necesita cambios — ya sabe renderizar ambos estados.
 */
export const categoriesContent: CategoryContent[] = [
  {
    id: "Sub-13",
    ageRange: `Hasta ${categoryAgeLimit["Sub-13"]} años`,
    active: false,
    description:
      "Primeros pasos en la formación competitiva: fundamentos técnicos, juego en equipo y amor por el fútbol.",
  },
  {
    id: "Sub-15",
    ageRange: `Hasta ${categoryAgeLimit["Sub-15"]} años`,
    active: true,
    description:
      "Nuestra categoría activa hoy: entrenamiento estructurado, seguimiento individual y competencia real.",
    stats: [
      { id: "jugadores", icon: Users, value: "28", label: "Jugadores" },
      { id: "entrenamientos", icon: CalendarDays, value: "5", label: "Entrenamientos por semana" },
      { id: "torneos", icon: Trophy, value: "3", label: "Torneos activos" },
    ],
    ctaHref: "/#sub-15",
    ctaLabel: "Conoce el plantel",
    photoSrc: "/brand/Slider Banner.png",
  },
  {
    id: "Sub-17",
    ageRange: `Hasta ${categoryAgeLimit["Sub-17"]} años`,
    active: false,
    description:
      "El último escalón formativo antes del salto a mayores: intensidad, liderazgo y proyección deportiva.",
  },
];
