import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getCurrentStaffProfile } from "@/lib/data/player-profile";
import { getToolsForRole, executeChatTool, type PlayerCardData } from "@/lib/ai/chat-tools";

export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `Eres el asistente de la plataforma de Fuerzas Básicas Jaguares de Córdoba, una academia de fútbol formativo (categoría Sub-15).

Ayudas al cuerpo técnico y administrativo con tres tipos de tareas:
1. Preguntas generales del equipo — horarios, próximos entrenamientos/partidos, qué pasó en el último entrenamiento. Usa agenda_equipo.
2. Preguntas sobre un jugador puntual — perfil, evaluaciones, asistencia, historial de partidos y (si tienes el permiso) estado financiero. Usa buscar_jugador primero para encontrar su id, y luego la herramienta que corresponda.
3. Agendar un partido o entrenamiento nuevo (si tienes las herramientas crear_partido_borrador / crear_entrenamiento_borrador disponibles).

Cómo agendar (muy importante):
- Cuando el usuario diga algo como "ayúdame a programar un partido/entrenamiento", NO llames la herramienta de inmediato. Primero pregúntale los datos UNO A LA VEZ, en conversación normal — no todos en un solo mensaje.
- Para un partido, en este orden: rival → fecha → local o visitante → hora (puede quedar pendiente) → lugar (opcional) → competencia (opcional).
- Para un entrenamiento, en este orden: fecha → hora de inicio → hora de fin (opcional) → lugar (opcional) → título o enfoque (opcional).
- En cuanto tengas los datos obligatorios (rival+fecha+local/visitante para partido; fecha+hora de inicio para entrenamiento), puedes crear el borrador ya — no hace falta esperar los opcionales si el usuario no los da o dice "así está bien".
- Al crear el borrador, SIEMPRE deja claro en tu respuesta que quedó sin confirmar y sin convocatoria, y que debe completarse/confirmarse desde la sección correspondiente de la plataforma (Partidos o Entrenamientos). Nunca digas que ya quedó confirmado o que ya se armó la convocatoria — eso no lo hace esta herramienta.

Reglas generales:
- Para preguntas generales del equipo, usa agenda_equipo directamente — no hace falta buscar_jugador.
- Para preguntas sobre un jugador, siempre usa buscar_jugador primero. Si devuelve más de una coincidencia, pregunta al usuario cuál es antes de seguir — nunca adivines.
- Solo respondes con datos que vengan de las herramientas. Nunca inventes cifras, fechas ni nombres.
- Si una herramienta dice que no hay datos, dilo tal cual — no lo rellenes ni lo suavices.
- Todavía no respondes preguntas agregadas de todo el plantel a la vez (ej. comparar a todos los jugadores) — solo agenda general, un jugador puntual, o agendar un partido/entrenamiento.
- Fuera de agendar partidos/entrenamientos, no puedes modificar ni borrar datos — solo consultar.

Formato de tus respuestas:
- Responde en español, de forma breve y clara, como lo haría un asistente deportivo profesional.
- Usa prosa normal, no listas ni viñetas salvo que el usuario pida detalle o compares varias cosas.
- Puedes usar **negrita** (doble asterisco) para resaltar un dato puntual importante — un nombre, una fecha, un número — pero con moderación, nunca la mayoría del mensaje ni títulos enteros en negrita.`;

interface ChatRequestBody {
  messages: { role: "user" | "assistant"; content: string }[];
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Falta configurar ANTHROPIC_API_KEY en el servidor." }, { status: 500 });
  }

  const staff = await getCurrentStaffProfile();
  if (!staff) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const body = (await request.json()) as ChatRequestBody;
  const messages = body.messages ?? [];
  if (messages.length === 0) {
    return NextResponse.json({ error: "Falta el mensaje." }, { status: 400 });
  }

  const anthropic = new Anthropic({ apiKey });
  const tools = getToolsForRole(staff.role);

  const conversation: Anthropic.MessageParam[] = messages.map((m) => ({ role: m.role, content: m.content }));

  let playerCard: PlayerCardData | undefined;

  // Loop de tool-use: el modelo puede pedir varias herramientas en cadena
  // (ej. buscar_jugador → perfil → evaluaciones) antes de dar la respuesta final.
  for (let turn = 0; turn < 6; turn++) {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools,
      messages: conversation,
    });

    const toolUseBlocks = response.content.filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");

    if (toolUseBlocks.length === 0) {
      const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === "text");
      return NextResponse.json({
        reply: textBlock?.text ?? "No pude generar una respuesta.",
        playerCard,
      });
    }

    conversation.push({ role: "assistant", content: response.content });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of toolUseBlocks) {
      const { result, playerCard: card } = await executeChatTool(
        block.name,
        (block.input ?? {}) as Record<string, unknown>,
        { role: staff.role },
      );
      if (card) playerCard = card;
      toolResults.push({ type: "tool_result", tool_use_id: block.id, content: result });
    }
    conversation.push({ role: "user", content: toolResults });
  }

  return NextResponse.json({ error: "La conversación se extendió demasiado. Intenta reformular tu pregunta." }, { status: 500 });
}
