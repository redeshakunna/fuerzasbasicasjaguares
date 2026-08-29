import { getPublicHomeStats } from "@/lib/data/public-stats";
import { getPublicJugadoresStats, getPublicNextMatch } from "@/lib/data/public-jugadores";

const monthNames = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

function formatFullDate(value: string) {
  const [y, m, d] = value.split("-");
  return `${Number(d)} de ${monthNames[Number(m) - 1]} de ${y}`;
}

/**
 * Contenido institucional fijo — mismo texto que ya está publicado en
 * Nosotros/Contacto. Se repite acá (en vez de leerlo del HTML) para que el
 * chat responda siempre con lo mismo que ve un visitante en el sitio.
 */
const STATIC_CONTENT = `
QUIÉNES SOMOS
Fuerzas Básicas de Jaguares de Córdoba FC — formamos futbolistas con excelencia deportiva y humana. No solo formamos jugadores, formamos personas.

Misión: Formar futbolistas con excelencia deportiva y humana, inspirados en valores que los preparen para competir y transformar su entorno.
Visión: Ser la academia de referencia en formación deportiva de Córdoba, reconocida por desarrollar talento y formar mejores personas.
Valores: Disciplina, respeto, humildad, compromiso, trabajo en equipo y mentalidad ganadora.
Enfoque: Desarrollo integral — técnico, táctico, físico y emocional — con acompañamiento constante a cada jugador y su familia.
Propósito: Dejar huella dentro y fuera de la cancha, formando líderes que representen a Jaguares con carácter.

POR QUÉ ELEGIRNOS
- Formación integral: desarrollo deportivo, académico, emocional y social.
- Entrenadores calificados, en formación continua y cercanos a cada familia.
- Metodología moderna: entrenamientos estructurados por sesión, con seguimiento individual.
- Acompañamiento familiar: trabajo conjunto con las familias.
- Instalaciones adecuadas y seguras.
- Proyección deportiva: preparación para torneos locales y regionales.

CATEGORÍAS
Actualmente la única categoría con plantel activo es Sub-15 (hasta 15 años). Sub-13 y Sub-17 están contempladas en el proyecto pero todavía no tienen plantel — próximamente.

CONTACTO
Ubicación: Córdoba, Colombia
Teléfono/WhatsApp: +57 300 123 4567
Correo: info@jaguarescordoba.com
Horario de atención: Lunes a Viernes, 7:00 AM - 6:00 PM

INSCRIPCIONES
Los interesados en inscribir a un jugador pueden hacerlo desde la sección "Inscripciones" del sitio o escribiendo por WhatsApp/correo con los datos de contacto de arriba.

PLATAFORMA
Existe un botón "Acceso Plataforma" para el cuerpo técnico, administrativo y familias — hoy es un acceso restringido en desarrollo (fase inicial del proyecto).
`.trim();

/** Arma el bloque de contexto dinámico + estático para el chat informativo del sitio público. */
export async function buildPublicChatContext(): Promise<string> {
  const [homeStats, jugadoresStats, nextMatch] = await Promise.all([
    getPublicHomeStats(),
    getPublicJugadoresStats(),
    getPublicNextMatch(),
  ]);

  const cifras = `
CIFRAS ACTUALES (reales, actualizadas)
Jugadores activos: ${homeStats.jugadoresActivos}
Cuerpo técnico: ${homeStats.cuerpoTecnico}
Entrenamientos recientes registrados: ${homeStats.entrenamientosRecientes}
Partidos programados: ${homeStats.partidosProgramados}
Asistencia promedio reciente: ${jugadoresStats.asistenciaPromedioPct}%
`.trim();

  const proximoPartido = nextMatch
    ? `PRÓXIMO PARTIDO CONFIRMADO
${nextMatch.isHome ? "Jaguares (local)" : "Jaguares (visitante)"} vs. ${nextMatch.opponent}
Fecha: ${formatFullDate(nextMatch.matchDate)}${nextMatch.matchTime ? ` a las ${nextMatch.matchTime}` : ""}
Lugar: ${nextMatch.location ?? "Por confirmar"}`
    : "PRÓXIMO PARTIDO: no hay ningún partido confirmado programado por ahora.";

  return `${STATIC_CONTENT}\n\n${cifras}\n\n${proximoPartido}`;
}
