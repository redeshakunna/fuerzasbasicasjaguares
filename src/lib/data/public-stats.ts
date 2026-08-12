import { createClient } from "@/lib/supabase/server";

export interface PublicHomeStats {
  jugadoresActivos: number;
  cuerpoTecnico: number;
  entrenamientosRecientes: number;
  partidosProgramados: number;
}

/**
 * Cifras reales del home — vienen de `public.get_public_home_stats()`,
 * una función SECURITY DEFINER que solo expone conteos agregados (sin
 * PII) y está habilitada para el rol `anon`, así el sitio público puede
 * leerla sin necesitar sesión ni relajar las políticas RLS del resto
 * de las tablas.
 *
 * Si la consulta falla (ej. base de datos caída), devolvemos ceros en
 * vez de números inventados — más honesto que mostrar cifras falsas.
 */
export async function getPublicHomeStats(): Promise<PublicHomeStats> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_public_home_stats").single();

    if (error || !data) {
      console.error("getPublicHomeStats() falló:", error);
      return { jugadoresActivos: 0, cuerpoTecnico: 0, entrenamientosRecientes: 0, partidosProgramados: 0 };
    }

    return {
      jugadoresActivos: data.jugadores_activos ?? 0,
      cuerpoTecnico: data.cuerpo_tecnico ?? 0,
      entrenamientosRecientes: data.entrenamientos_recientes ?? 0,
      partidosProgramados: data.partidos_programados ?? 0,
    };
  } catch (err) {
    console.error("getPublicHomeStats() falló:", err);
    return { jugadoresActivos: 0, cuerpoTecnico: 0, entrenamientosRecientes: 0, partidosProgramados: 0 };
  }
}
