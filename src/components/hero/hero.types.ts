/**
 * Modelo de datos del Hero.
 *
 * El Hero está preparado para evolucionar de una sola pantalla estática
 * a un slider cinematográfico de múltiples fondos (ver recomendación:
 * 3 slides — "Aquí nace el futuro", "Entrenamos con propósito", etc.).
 *
 * El contenido textual (title/description/cta) se deja opcional a
 * propósito: en esta entrega el panel izquierdo permanece vacío por
 * requerimiento de diseño. Cuando se apruebe el copy, basta con
 * completar estos campos en `hero.data.ts` — no se requieren cambios
 * de layout ni de componentes.
 */

export type HeroAccent = "green" | "maroon" | "turquoise";

export interface HeroCta {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
  icon?: "arrow" | "play";
}

export interface HeroTitle {
  /** Línea(s) en tono oscuro sólido, ej. "Aquí nace". */
  lead: string;
  /** Línea de énfasis con degradado de marca, ej. "el futuro". */
  accent: string;
}

export interface HeroSlide {
  /** Identificador único y estable, usado como key de animación. */
  id: string;
  /** Acento cromático del slide (colorea indicadores y detalles). */
  accent: HeroAccent;
  image: {
    src: string;
    alt: string;
  };
  /** Kicker corto sobre el título (opcional, pendiente de copy). */
  eyebrow?: string;
  /** Título principal en dos tratamientos tipográficos (opcional). */
  title?: HeroTitle;
  /** Descripción de apoyo (opcional, pendiente de copy). */
  description?: string;
  ctas?: HeroCta[];
}

export interface NavLink {
  label: string;
  href: string;
  /** Etiqueta corta opcional junto al link — ej. "Próximamente" para categorías sin plantel activo aún. */
  badge?: string;
  /** Submenú desplegable opcional (ej. Jugadores → Sub-13 / Sub-15 / Sub-17). */
  children?: NavLink[];
}
