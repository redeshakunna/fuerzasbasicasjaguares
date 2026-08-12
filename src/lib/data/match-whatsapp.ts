import { formatMatchDateLong, formatMatchTime12h } from "./match-stats";
import { getFullName } from "./players-stats";
import type { MatchRow } from "./matches";
import type { PlayerRow } from "./players";

export interface MatchCallupWhatsAppInput {
  match: MatchRow;
  confirmedPlayers: PlayerRow[];
  /** Link único de confirmación para toda la convocatoria — cada jugador elige su nombre ahí. */
  rsvpLink?: string;
}

/** Arma el texto de convocatoria oficial de un partido — listo para WhatsApp click-to-chat. */
export function buildMatchCallupMessage({ match, confirmedPlayers, rsvpLink }: MatchCallupWhatsAppInput): string {
  return [
    "*ACADEMIA JAGUARES DE CÓRDOBA*",
    "*Convocatoria Oficial de Partido*",
    "",
    `Categoría: ${match.category}`,
    `Rival: ${match.opponent}`,
    `Fecha: ${formatMatchDateLong(match.match_date)}`,
    `Hora: ${formatMatchTime12h(match.match_time)}`,
    `Lugar: ${match.location || "Por definir"}`,
    match.competition ? `Competencia: ${match.competition}` : null,
    "",
    "*Convocados:*",
    ...(confirmedPlayers.length > 0 ? confirmedPlayers.map((p, i) => `${i + 1}. ${getFullName(p)}`) : ["Por definir"]),
    "",
    rsvpLink ? `👉 Confirma tu asistencia acá (elige tu nombre en la lista): ${rsvpLink}` : null,
    rsvpLink ? "" : null,
    "*No olvides traer:*",
    "- Uniforme oficial",
    "- Guayos",
    "- Canilleras",
    "- Hidratación",
    "",
    "¡Vamos Jaguares!",
  ]
    .filter((line) => line !== null)
    .join("\n");
}
