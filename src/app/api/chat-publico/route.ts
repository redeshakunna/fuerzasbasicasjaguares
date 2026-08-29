import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildPublicChatContext } from "@/lib/ai/public-chat-context";

export const dynamic = "force-dynamic";

interface ChatRequestBody {
  messages: { role: "user" | "assistant"; content: string }[];
}

const MAX_MESSAGES = 20;

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Falta configurar ANTHROPIC_API_KEY en el servidor." }, { status: 500 });
  }

  const body = (await request.json()) as ChatRequestBody;
  const messages = (body.messages ?? []).slice(-MAX_MESSAGES);
  if (messages.length === 0) {
    return NextResponse.json({ error: "Falta el mensaje." }, { status: 400 });
  }

  const context = await buildPublicChatContext();

  const systemPrompt = `Eres el asistente virtual del sitio web de Fuerzas Básicas Jaguares de Córdoba FC, una academia de fútbol formativo.

Solo puedes responder usando la información institucional que aparece abajo entre las marcas ---CONTEXTO---. No inventes datos que no estén ahí.

Si te preguntan algo que no está en ese contexto (por ejemplo, datos privados de un jugador, resultados históricos detallados, información administrativa interna, o cualquier tema fuera del club), responde amablemente que no tienes esa información y sugiere escribir por WhatsApp o correo (los datos de contacto sí están en el contexto).

Responde en español, de forma cálida, breve y clara — como lo haría alguien del club atendiendo a un padre de familia o un jugador interesado. No uses listas largas salvo que ayuden a la claridad. Puedes usar **negrita** (doble asterisco) para resaltar un dato puntual — una fecha, un nombre — pero con moderación, nunca mensajes enteros en negrita.

---CONTEXTO---
${context}
---FIN CONTEXTO---`;

  const anthropic = new Anthropic({ apiKey });

  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: systemPrompt,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === "text");
    return NextResponse.json({ reply: textBlock?.text ?? "No pude generar una respuesta." });
  } catch (err) {
    console.error("chat-publico falló:", err);
    return NextResponse.json({ error: "No se pudo consultar el asistente en este momento." }, { status: 500 });
  }
}
