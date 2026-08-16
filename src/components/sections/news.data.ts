export type NewsCategory = "Noticias" | "Entrenamiento" | "Resultados";

export interface NewsScorer {
  name: string;
  goals: number;
}

/** Datos de crónica de partido — opcional, solo para noticias de categoría "Resultados". */
export interface NewsMatchReport {
  score: string;
  opponent: string;
  scorers: NewsScorer[];
  nextMatch: string;
}

export interface NewsItem {
  id: string;
  category: NewsCategory;
  title: string;
  date: string;
  image: { src: string; alt: string };
  href: string;
  /** Bajada corta para la tarjeta/listado — si no hay, se usa el título. */
  excerpt?: string;
  /** Cuerpo del artículo en párrafos — si existe, la tarjeta enlaza a /noticias/[id]. */
  body?: string[];
  matchReport?: NewsMatchReport;
}

const categoryClass: Record<NewsCategory, string> = {
  Noticias: "bg-jaguar-green-600",
  Entrenamiento: "bg-jaguar-turquoise-500",
  Resultados: "bg-jaguar-maroon-500",
};

export function newsCategoryClass(category: NewsCategory) {
  return categoryClass[category];
}

export function getNewsItem(id: string): NewsItem | undefined {
  return newsItems.find((item) => item.id === id);
}

/**
 * Noticias de la academia. Las 3 originales ("convocatoria-pruebas",
 * "trabajo-resistencia", "triunfo-en-casa") son contenido de ejemplo para
 * poblar el diseño — reemplazar por contenido real (o conectar a un CMS)
 * cuando esté disponible. Las que tienen `body` enlazan a su propia página
 * de detalle en /noticias/[id]; las que no, siguen apuntando al ancla
 * #noticias como antes.
 */
export const newsItems: NewsItem[] = [
  {
    id: "goleada-sub17a-alianza-fc",
    category: "Resultados",
    title: "Goleada 6-0 y liderato: la Sub-17A manda en su grupo",
    date: "16 agosto, 2026",
    image: {
      src: "/noticias/goleada-sub17a-alianza-fc.jpg",
      alt: "Plantel de la Sub-17A de Fuerzas Básicas Jaguares de Córdoba antes del partido ante Alianza FC de Valledupar",
    },
    href: "/noticias/goleada-sub17a-alianza-fc",
    excerpt: "Los canteranos felinos vencieron 6-0 a Alianza FC de Valledupar y ya son líderes de su grupo.",
    body: [
      "La Sub-17A de las Fuerzas Básicas Jaguares de Córdoba dejó claro por qué pelea arriba: goleada 6-0 sobre Alianza FC de Valledupar y liderato en solitario del grupo. Un resultado contundente que confirma el nivel colectivo que el equipo viene mostrando partido a partido.",
      "Los canteranos felinos impusieron un juego colectivo superior al de su rival durante los noventa minutos: presión organizada, circulación rápida de balón y una definición letal que se tradujo en seis goles ante el arco de Alianza FC.",
      "El cuerpo técnico liderado por Alex Rivera y Julio Méndez celebra así el liderato de su grupo, resultado del trabajo sostenido en la formación de esta generación Sub-17.",
    ],
    matchReport: {
      score: "6 - 0",
      opponent: "Alianza FC de Valledupar",
      scorers: [
        { name: "Yorman Mestra", goals: 3 },
        { name: "Harry Mosquera", goals: 1 },
        { name: "Nicolás Mendoza", goals: 1 },
        { name: "Moisés Ortega", goals: 1 },
      ],
      nextMatch: "Próxima fecha: Jaguares visita a San Martín de Valledupar.",
    },
  },
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
