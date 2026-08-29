import type Anthropic from "@anthropic-ai/sdk";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getPlayers } from "@/lib/data/players";
import { getPlayerById, getPlayerEvaluations } from "@/lib/data/player-profile";
import { getPlayerAttendanceHistory } from "@/lib/data/attendance";
import { getPlayerCallupHistory } from "@/lib/data/match-callups";
import { getObligations } from "@/lib/data/finance";
import { getEstadoGeneral } from "@/lib/data/player-profile-view";
import { getFullName, calculateAge } from "@/lib/data/players-stats";
import { matchOutcome } from "@/lib/data/match-stats";
import { getActivitiesForCategory, groupActivities } from "@/lib/data/activities";
import { defaultCategory } from "@/lib/data/categories";
import type { Enums } from "@/lib/supabase/database.types";

type StaffRole = Enums<"user_role">;

/**
 * Roles que pueden ver datos financieros del jugador desde el chat — mismo
 * criterio que "Gestión Financiera" en el menú: nunca el entrenador.
 */
const FINANCE_ROLES: StaffRole[] = ["admin", "coordinador", "directivo"];

/** Quién puede agendar partidos/entrenamientos desde el chat — mismo criterio que la UI de Partidos/Entrenamientos: nunca un padre. */
const SCHEDULE_ROLES: StaffRole[] = ["admin", "coordinador", "directivo", "entrenador"];

const documentsStatusLabel: Record<string, string> = {
  Completo: "Completo",
  Pendiente: "Pendiente",
};

/** Definiciones de herramientas — el set se arma según el rol de quien pregunta. */
export function getToolsForRole(role: StaffRole): Anthropic.Tool[] {
  const tools: Anthropic.Tool[] = [
    {
      name: "agenda_equipo",
      description:
        "Agenda general del equipo Sub-15: entrenamientos y partidos de hoy, próximos y el último realizado. Úsala para preguntas generales que NO son sobre un jugador puntual — 'cuándo entrenan', 'cuándo es el próximo partido', 'qué hay hoy', 'cuál fue el último entrenamiento'.",
      input_schema: {
        type: "object",
        properties: {},
      },
    },
    {
      name: "buscar_jugador",
      description:
        "Busca un jugador del plantel por nombre o apodo. Úsala siempre primero cuando el usuario pregunte por un jugador en particular. Devuelve una lista de coincidencias (puede haber más de una); si hay más de una, pide al usuario que aclare cuál antes de seguir.",
      input_schema: {
        type: "object",
        properties: {
          nombre: { type: "string", description: "Nombre, apellido o apodo (parcial) del jugador a buscar." },
        },
        required: ["nombre"],
      },
    },
    {
      name: "perfil",
      description: "Datos generales de un jugador: dorsal, posición, categoría, edad, estado de inscripción, estado general.",
      input_schema: {
        type: "object",
        properties: {
          jugador_id: { type: "string", description: "id del jugador (obtenido de buscar_jugador)." },
        },
        required: ["jugador_id"],
      },
    },
    {
      name: "evaluaciones",
      description: "Historial reciente de evaluaciones de desempeño del jugador (técnico, táctico, físico, mental, disciplina, actitud) y su tendencia.",
      input_schema: {
        type: "object",
        properties: {
          jugador_id: { type: "string" },
        },
        required: ["jugador_id"],
      },
    },
    {
      name: "asistencia",
      description: "Historial reciente de asistencia del jugador a entrenamientos y partidos, con porcentaje de asistencia.",
      input_schema: {
        type: "object",
        properties: {
          jugador_id: { type: "string" },
        },
        required: ["jugador_id"],
      },
    },
    {
      name: "historial_partidos",
      description: "Convocatorias y participación del jugador en partidos: goles, tarjetas, minutos jugados, resultados.",
      input_schema: {
        type: "object",
        properties: {
          jugador_id: { type: "string" },
        },
        required: ["jugador_id"],
      },
    },
  ];

  if (FINANCE_ROLES.includes(role)) {
    tools.push({
      name: "estado_financiero",
      description: "Estado de cuenta del jugador: obligaciones pendientes, vencidas y pagadas. Solo disponible para admin, coordinador o directivo.",
      input_schema: {
        type: "object",
        properties: {
          jugador_id: { type: "string" },
        },
        required: ["jugador_id"],
      },
    });
  }

  if (SCHEDULE_ROLES.includes(role)) {
    tools.push(
      {
        name: "crear_partido_borrador",
        description:
          "Crea un partido en BORRADOR (sin confirmar, sin convocatoria) a partir de los datos que el usuario haya dado. Solo úsala cuando el usuario ya te haya dado al menos el rival y la fecha — si preguntó algo tipo 'ayúdame a programar un partido', primero pregúntale un dato a la vez (rival, fecha, si es local o visitante, hora, lugar, competencia) en vez de llamar esta herramienta de inmediato.",
        input_schema: {
          type: "object",
          properties: {
            rival: { type: "string", description: "Nombre del equipo rival." },
            fecha: { type: "string", description: "Fecha del partido en formato YYYY-MM-DD." },
            local: { type: "boolean", description: "true si Jaguares juega de local, false si es visitante." },
            hora: { type: "string", description: "Hora en formato HH:MM (24h), opcional." },
            lugar: { type: "string", description: "Cancha o lugar del partido, opcional." },
            competencia: { type: "string", description: "Torneo o competencia, opcional." },
          },
          required: ["rival", "fecha", "local"],
        },
      },
      {
        name: "crear_entrenamiento_borrador",
        description:
          "Crea un entrenamiento en BORRADOR a partir de los datos que el usuario haya dado. Solo úsala cuando ya tengas al menos la fecha y la hora de inicio — si preguntó algo tipo 'ayúdame a programar un entrenamiento', primero pregúntale un dato a la vez (fecha, hora de inicio, hora de fin, lugar, título/objetivo) en vez de llamar esta herramienta de inmediato.",
        input_schema: {
          type: "object",
          properties: {
            fecha: { type: "string", description: "Fecha del entrenamiento en formato YYYY-MM-DD." },
            hora_inicio: { type: "string", description: "Hora de inicio en formato HH:MM (24h)." },
            hora_fin: { type: "string", description: "Hora de fin en formato HH:MM (24h), opcional." },
            titulo: { type: "string", description: "Título o enfoque de la sesión, opcional (por defecto 'Entrenamiento')." },
            lugar: { type: "string", description: "Cancha o lugar del entrenamiento, opcional." },
          },
          required: ["fecha", "hora_inicio"],
        },
      },
    );
  }

  return tools;
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export interface ChatToolContext {
  role: StaffRole;
}

/** Ejecuta una herramienta pedida por el modelo y devuelve el resultado como texto JSON. */
export async function executeChatTool(
  name: string,
  input: Record<string, unknown>,
  ctx: ChatToolContext,
): Promise<{ result: string; playerCard?: PlayerCardData }> {
  switch (name) {
    case "agenda_equipo": {
      const todayISO = new Date().toISOString().slice(0, 10);
      const activities = await getActivitiesForCategory(defaultCategory);
      const grouped = groupActivities(activities, todayISO, 8);
      const describe = (a: (typeof activities)[number]) => ({
        tipo: a.kind,
        titulo: a.title,
        fecha: a.date,
        hora: a.time,
        lugar: a.subtitle,
      });
      return {
        result: JSON.stringify({
          categoria: defaultCategory,
          hoy: grouped.today.map(describe),
          proximos: grouped.upcoming.map(describe),
          ultimos_realizados: grouped.recent.map(describe),
        }),
      };
    }

    case "buscar_jugador": {
      const query = normalize(String(input.nombre ?? ""));
      if (!query) return { result: JSON.stringify({ error: "Falta el nombre a buscar." }) };
      const players = await getPlayers();
      const matches = players
        .filter((p) => {
          const full = normalize(getFullName(p));
          const nick = normalize(p.nickname ?? "");
          return full.includes(query) || nick.includes(query);
        })
        .slice(0, 8)
        .map((p) => ({
          jugador_id: p.id,
          nombre: getFullName(p),
          apodo: p.nickname,
          categoria: p.category,
          dorsal: p.jersey_number,
        }));
      return { result: JSON.stringify({ coincidencias: matches }) };
    }

    case "perfil": {
      const playerId = String(input.jugador_id ?? "");
      const player = await getPlayerById(playerId);
      if (!player) return { result: JSON.stringify({ error: "No se encontró ese jugador." }) };
      const evaluations = await getPlayerEvaluations(playerId, 1);
      const estado = getEstadoGeneral(player, evaluations[0] ?? null);
      const fullName = getFullName(player);
      const payload = {
        jugador_id: player.id,
        nombre: fullName,
        apodo: player.nickname,
        categoria: player.category,
        dorsal: player.jersey_number,
        posicion: player.position,
        edad: calculateAge(player.birth_date),
        pie_dominante: player.dominant_foot,
        estado_jugador: player.status,
        estado_inscripcion: documentsStatusLabel[player.documents_status] ?? player.documents_status,
        estado_general_0_10: estado.score,
        fecha_ingreso: player.joined_at,
        altura_cm: player.height_cm,
        peso_kg: player.weight_kg,
      };
      return {
        result: JSON.stringify(payload),
        playerCard: {
          id: player.id,
          nombre: fullName,
          apodo: player.nickname,
          fotoUrl: player.photo_url,
          dorsal: player.jersey_number,
          posicion: player.position,
          categoria: player.category,
          estadoGeneral: estado.score,
        },
      };
    }

    case "evaluaciones": {
      const playerId = String(input.jugador_id ?? "");
      const evaluations = await getPlayerEvaluations(playerId, 6);
      if (evaluations.length === 0) {
        return { result: JSON.stringify({ evaluaciones: [], mensaje: "Este jugador todavía no tiene evaluaciones registradas." }) };
      }
      const promedio = (key: keyof (typeof evaluations)[number]) => {
        const vals = evaluations.map((e) => e[key]).filter((v): v is number => typeof v === "number");
        return vals.length ? Number((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)) : null;
      };
      return {
        result: JSON.stringify({
          promedio_general: promedio("overall_score"),
          promedio_tecnico: promedio("technical_score"),
          promedio_tactico: promedio("tactical_score"),
          promedio_fisico: promedio("physical_score"),
          promedio_mental: promedio("mental_score"),
          promedio_disciplina: promedio("discipline_score"),
          promedio_actitud: promedio("attitude_score"),
          ultimas: evaluations.map((e) => ({
            fecha: e.evaluation_date,
            general: e.overall_score,
            destacado: e.is_standout,
            notas: e.notes,
          })),
        }),
      };
    }

    case "asistencia": {
      const playerId = String(input.jugador_id ?? "");
      const history = await getPlayerAttendanceHistory(playerId, 12);
      if (history.length === 0) {
        return { result: JSON.stringify({ historial: [], mensaje: "Sin registros de asistencia todavía." }) };
      }
      const presentes = history.filter((h) => h.status === "Presente" || h.status === "Tarde").length;
      const pct = Math.round((presentes / history.length) * 100);
      return {
        result: JSON.stringify({
          porcentaje_asistencia_reciente: pct,
          total_registros: history.length,
          historial: history.map((h) => ({ fecha: h.date, tipo: h.kind, titulo: h.title, estado: h.status })),
        }),
      };
    }

    case "historial_partidos": {
      const playerId = String(input.jugador_id ?? "");
      const callups = await getPlayerCallupHistory(playerId, 10);
      if (callups.length === 0) {
        return { result: JSON.stringify({ partidos: [], mensaje: "Este jugador todavía no tiene convocatorias registradas." }) };
      }
      const totalGoles = callups.reduce((sum, c) => sum + (c.goals ?? 0), 0);
      const totalAmarillas = callups.reduce((sum, c) => sum + (c.yellow_cards ?? 0), 0);
      const totalRojas = callups.filter((c) => c.red_card).length;
      return {
        result: JSON.stringify({
          convocatorias_totales: callups.length,
          goles_totales: totalGoles,
          tarjetas_amarillas_totales: totalAmarillas,
          tarjetas_rojas_totales: totalRojas,
          partidos: callups.map((c) => ({
            fecha: c.match.match_date,
            rival: c.match.opponent,
            local: c.match.is_home,
            marcador: c.match.our_score !== null && c.match.opponent_score !== null ? `${c.match.our_score}-${c.match.opponent_score}` : null,
            resultado: matchOutcome(c.match),
            estado_convocatoria: c.call_status,
            minutos_jugados: c.minutes_played,
            goles: c.goals,
            amarillas: c.yellow_cards,
            roja: c.red_card,
          })),
        }),
      };
    }

    case "estado_financiero": {
      if (!FINANCE_ROLES.includes(ctx.role)) {
        return { result: JSON.stringify({ error: "No tienes permiso para consultar datos financieros." }) };
      }
      const playerId = String(input.jugador_id ?? "");
      const all = await getObligations();
      const obligations = all.filter((o) => o.playerId === playerId);
      if (obligations.length === 0) {
        return { result: JSON.stringify({ obligaciones: [], mensaje: "Este jugador no tiene obligaciones registradas." }) };
      }
      const pendientes = obligations.filter((o) => o.status === "Pendiente" || o.status === "Parcial");
      const vencidas = obligations.filter((o) => o.status === "Vencido");
      return {
        result: JSON.stringify({
          total_pendiente: pendientes.reduce((s, o) => s + o.amount, 0) + vencidas.reduce((s, o) => s + o.amount, 0),
          cantidad_vencidas: vencidas.length,
          cantidad_pendientes: pendientes.length,
          detalle: obligations.slice(0, 10).map((o) => ({
            concepto: o.concept,
            titulo: o.title,
            monto: o.amount,
            vencimiento: o.dueDate,
            estado: o.status,
          })),
        }),
      };
    }

    case "crear_partido_borrador": {
      if (!SCHEDULE_ROLES.includes(ctx.role)) {
        return { result: JSON.stringify({ error: "No tienes permiso para agendar partidos." }) };
      }
      const rival = String(input.rival ?? "").trim();
      const fecha = String(input.fecha ?? "").trim();
      if (!rival || !fecha) {
        return { result: JSON.stringify({ error: "Faltan datos: rival y fecha son obligatorios." }) };
      }
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("matches")
        .insert({
          category: defaultCategory,
          opponent: rival,
          match_date: fecha,
          match_time: input.hora ? String(input.hora) : null,
          location: input.lugar ? String(input.lugar) : null,
          competition: input.competencia ? String(input.competencia) : null,
          is_home: Boolean(input.local),
          status: "Por confirmar",
        })
        .select("id")
        .single();

      if (error || !data) {
        console.error("crear_partido_borrador() falló:", error);
        return { result: JSON.stringify({ error: "No se pudo crear el partido en Supabase." }) };
      }

      revalidatePath("/plataforma/partidos");
      revalidatePath("/plataforma");
      return {
        result: JSON.stringify({
          creado: true,
          partido_id: data.id,
          estado: "Por confirmar (borrador, sin convocatoria)",
          rival,
          fecha,
          local: Boolean(input.local),
        }),
      };
    }

    case "crear_entrenamiento_borrador": {
      if (!SCHEDULE_ROLES.includes(ctx.role)) {
        return { result: JSON.stringify({ error: "No tienes permiso para agendar entrenamientos." }) };
      }
      const fecha = String(input.fecha ?? "").trim();
      const horaInicio = String(input.hora_inicio ?? "").trim();
      if (!fecha || !horaInicio) {
        return { result: JSON.stringify({ error: "Faltan datos: fecha y hora de inicio son obligatorias." }) };
      }
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("trainings")
        .insert({
          category: defaultCategory,
          title: input.titulo ? String(input.titulo) : "Entrenamiento",
          session_date: fecha,
          start_time: horaInicio,
          end_time: input.hora_fin ? String(input.hora_fin) : null,
          location: input.lugar ? String(input.lugar) : null,
          creation_mode: "manual",
        })
        .select("id")
        .single();

      if (error || !data) {
        console.error("crear_entrenamiento_borrador() falló:", error);
        return { result: JSON.stringify({ error: "No se pudo crear el entrenamiento en Supabase." }) };
      }

      revalidatePath("/plataforma/entrenamientos");
      revalidatePath("/plataforma");
      return {
        result: JSON.stringify({
          creado: true,
          entrenamiento_id: data.id,
          estado: "Borrador (falta completar detalles de la sesión)",
          fecha,
          hora_inicio: horaInicio,
        }),
      };
    }

    default:
      return { result: JSON.stringify({ error: `Herramienta desconocida: ${name}` }) };
  }
}

export interface PlayerCardData {
  id: string;
  nombre: string;
  apodo: string | null;
  fotoUrl: string | null;
  dorsal: number | null;
  posicion: string;
  categoria: string;
  estadoGeneral: number;
}
