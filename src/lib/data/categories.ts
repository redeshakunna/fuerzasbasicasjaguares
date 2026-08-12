/**
 * Categorías del club. El diseño ya contempla Sub-13/Sub-15/Sub-17, pero
 * por ahora solo Sub-15 tiene plantel activo (jugadores, entrenamientos,
 * partidos) — las otras aparecen en el selector para que directivos/técnicos
 * vean hacia dónde va la plataforma, con un aviso de "próximamente" en vez
 * de datos inventados.
 */
export const categories = ["Sub-13", "Sub-15", "Sub-17"] as const;

export type Category = (typeof categories)[number];

export const defaultCategory: Category = "Sub-15";

export const activeCategories: Category[] = ["Sub-15"];

export function isCategory(value: string | undefined | null): value is Category {
  return !!value && (categories as readonly string[]).includes(value);
}

export function parseCategory(value: string | undefined | null): Category {
  return isCategory(value) ? value : defaultCategory;
}

/** Edad máxima permitida por categoría (Sub-13 → hasta 13 años, etc.). */
export const categoryAgeLimit: Record<Category, number> = {
  "Sub-13": 13,
  "Sub-15": 15,
  "Sub-17": 17,
};

function ageFromBirthDate(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
  if (!hasHadBirthdayThisYear) age -= 1;
  return age;
}

/**
 * Advertencia (no bloqueante) cuando la edad del jugador supera el máximo
 * de la categoría seleccionada — ej. 14 años en Sub-13, 16 años en Sub-15.
 * Devuelve `null` si no hay fecha/categoría válida o si la edad cumple.
 */
export function getCategoryAgeWarning(birthDate: string, category: string): string | null {
  if (!birthDate || !isCategory(category)) return null;
  const age = ageFromBirthDate(birthDate);
  const limit = categoryAgeLimit[category];
  if (age <= limit) return null;
  return `Este jugador tiene ${age} años — supera la edad máxima de ${category} (hasta ${limit} años).`;
}

/** Siguiente categoría formativa (Sub-13 → Sub-15 → Sub-17). `null` si ya está en la última. */
export function nextCategory(category: string): Category | null {
  if (!isCategory(category)) return null;
  const index = categories.indexOf(category);
  return categories[index + 1] ?? null;
}

/** Categoría formativa anterior (Sub-17 → Sub-15 → Sub-13). `null` si ya está en la primera. */
export function previousCategory(category: string): Category | null {
  if (!isCategory(category)) return null;
  const index = categories.indexOf(category);
  return categories[index - 1] ?? null;
}
