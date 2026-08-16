import type { HeroSlide, NavLink } from "./hero.types";

/**
 * Slides del Hero. Hoy son 2 (las composiciones ya suministradas);
 * la estructura admite agregar una tercera sin tocar componentes.
 */
export const heroSlides: HeroSlide[] = [
  {
    id: "origen",
    accent: "green",
    image: {
      src: "/hero/slide-01-origen.jpg",
      alt: "Jugadores de las Fuerzas Básicas Jaguares de Córdoba en plena acción",
    },
    title: {
      lead: "Aquí nace",
      accent: "el futuro",
    },
    description:
      "En las Fuerzas Básicas de Jaguares de Córdoba formamos personas íntegras y futbolistas con disciplina, pasión y propósito.",
    ctas: [
      { label: "Conoce la Sub-15", href: "#sub-15", variant: "primary", icon: "arrow" },
      { label: "Ver video", href: "#video", variant: "secondary", icon: "play" },
    ],
  },
  {
    id: "proposito",
    accent: "maroon",
    image: {
      src: "/hero/slide-02-proposito.jpg",
      alt: "Arquero de las Fuerzas Básicas Jaguares de Córdoba durante un entrenamiento",
    },
    title: {
      lead: "Aquí se forma",
      accent: "el carácter",
    },
    description:
      "Cada entrenamiento exige disciplina, coraje y entrega absoluta — la base de todo gran equipo.",
    ctas: [
      { label: "Conoce la metodología", href: "#metodologia", variant: "primary", icon: "arrow" },
      { label: "Ver video", href: "#video", variant: "secondary", icon: "play" },
    ],
  },
];

/**
 * Navegación principal. "Categorías" y "Jugadores" antes eran dos ítems
 * separados que hablaban de lo mismo — se fusionaron en un solo punto de
 * entrada desplegable (mismo criterio que el menú "Categorías" de la
 * plataforma interna): el padre lleva a la página editorial /categorias,
 * y el desplegable ofrece Sub-13/Sub-15/Sub-17 — Sub-15 va directo al
 * plantel real en /jugadores, Sub-13 y Sub-17 quedan con "Próximamente"
 * dentro de la misma página /categorias.
 */
export const navLinks: NavLink[] = [
  { label: "Inicio", href: "#inicio" },
  { label: "Nosotros", href: "/nosotros" },
  {
    label: "Categorías",
    href: "/categorias",
    children: [
      { label: "Sub-13", href: "/categorias#sub-13", badge: "Próximamente" },
      { label: "Sub-15", href: "/jugadores?categoria=Sub-15" },
      { label: "Sub-17", href: "/categorias#sub-17", badge: "Próximamente" },
    ],
  },
  { label: "Entrenadores", href: "/entrenadores" },
  { label: "Noticias", href: "/noticias" },
  { label: "Galería", href: "/galeria" },
  { label: "Inscripciones", href: "/inscripciones" },
  { label: "Contacto", href: "/contacto" },
];
