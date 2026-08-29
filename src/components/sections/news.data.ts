export type NewsCategory = "Noticias" | "Entrenamiento" | "Resultados";

export interface NewsItem {
  id: string;
  category: NewsCategory;
  title: string;
  date: string;
  image: { src: string; alt: string };
  href: string;
}

const categoryClass: Record<NewsCategory, string> = {
  Noticias: "bg-jaguar-green-600",
  Entrenamiento: "bg-jaguar-turquoise-500",
  Resultados: "bg-jaguar-maroon-500",
};

export function newsCategoryClass(category: NewsCategory) {
  return categoryClass[category];
}

/**
 * 3 noticias de ejemplo para poblar el diseño — reemplazar por contenido
 * real (o conectar a un CMS) cuando esté disponible. Usan fotografía ya
 * existente en /public como placeholder visual.
 */
export const newsItems: NewsItem[] = [
  {
    id: "convocatoria-pruebas",
    category: "Noticias",
    title: "Convocatoria abierta para pruebas Sub-15",
    date: "28 julio, 2026",
    image: {
      src: "/hero/slide-01-origen.jpg",
      alt: "Jugadores de Jaguares de Córdoba en acción",
    },
    href: "#noticias",
  },
  {
    id: "trabajo-resistencia",
    category: "Entrenamiento",
    title: "Trabajo enfocado en resistencia y velocidad",
    date: "30 julio, 2026",
    image: {
      src: "/hero/slide-02-proposito.jpg",
      alt: "Entrenamiento físico de Jaguares de Córdoba",
    },
    href: "#noticias",
  },
  {
    id: "triunfo-en-casa",
    category: "Resultados",
    title: "Triunfo en casa: Jaguares Sub-15 2 - 1",
    date: "2 agosto, 2026",
    image: {
      src: "/brand/Slider Banner.png",
      alt: "Plantel de Jaguares de Córdoba tras el partido",
    },
    href: "#noticias",
  },
];
