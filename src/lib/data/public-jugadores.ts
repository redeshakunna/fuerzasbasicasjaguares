import { createClient } from "@/lib/supabase/server";
import type { Enums } from "@/lib/supabase/database.types";

export interface PublicRosterEntry {
  jerseyNumber: number | null;
  position: string;
  positionGroup: Enums<"position_group">;
}

export interface PublicJugadoresStats {
  jugadoresActivos: number;
  asistenciaPromedioPct: number;
  entrenamientosRecientes: number;
  partidosProgramados: number;
}

export interface PublicNextMatch {
  opponent: string;
  matchDate: string;
  matchTime: string | null;
  location: string | null;
  isHome: boolean;
}

const EMPTY_STATS: PublicJugadoresStats = {
  jugadoresActivos: 0,
  asistenciaPromedioPct: 0,
  entrenamientosRecientes: 0,
  partidosProgramados: 0,
};

/**
 * Plantel público — solo dorsal + posición, sin nombre ni foto (los
 * jugadores son menores de edad). Viene de `get_public_roster()`, una
 * función SECURITY DEFINER que expone exclusivamente estas columnas.
 */
export async function getPublicRoster(): Promise<PublicRosterEntry[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_public_roster");
    if (error || !data) {
      console.error("getPublicRoster() falló:", error);
      return [];
    }
    return data.map((row) => ({
      jerseyNumber: row.jersey_number,
      position: row.position,
      positionGroup: row.position_group,
    }));
  } catch (err) {
    console.error("getPublicRoster() falló:", err);
    return [];
  }
}

/** Cifras reales de la Sub-15 para la página pública de Jugadores. */
export async function getPublicJugadoresStats(): Promise<PublicJugadoresStats> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_public_jugadores_stats").single();
    if (error || !data) {
      console.error("getPublicJugadoresStats() falló:", error);
      return EMPTY_STATS;
    }
    return {
      jugadoresActivos: data.jugadores_activos ?? 0,
      asistenciaPromedioPct: data.asistencia_promedio_pct ?? 0,
      entrenamientosRecientes: data.entrenamientos_recientes ?? 0,
      partidosProgramados: data.partidos_programados ?? 0,
    };
  } catch (err) {
    console.error("getPublicJugadoresStats() falló:", err);
    return EMPTY_STATS;
  }
}

/** Próximo partido confirmado — null si no hay ninguno programado a futuro. */
export async function getPublicNextMatch(): Promise<PublicNextMatch | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_public_next_match");
    const row = data?.[0];
    if (error || !row) return null;
    return {
      opponent: row.opponent,
      matchDate: row.match_date,
      matchTime: row.match_time,
      location: row.location,
      isHome: row.is_home,
    };
  } catch (err) {
    console.error("getPublicNextMatch() falló:", err);
    return null;
  }
}
