"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, Send, ShieldCheck, X } from "lucide-react";
import { MarkdownLite } from "@/components/dashboard/chat/MarkdownLite";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = ["¿Cuándo es el próximo partido?", "¿Cómo inscribo a mi hijo?", "¿Qué categorías tienen?"];

/**
 * Burbuja de chat flotante del sitio público — informativa, sin sesión.
 * Se oculta en /plataforma y /confirmar porque esas rutas tienen su propio
 * contexto (la plataforma ya trae su propio asistente logueado).
 */
export function PublicChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const hidden = pathname?.startsWith("/plataforma") || pathname?.startsWith("/confirmar");
  if (hidden) return null;

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setError(null);
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat-publico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Algo falló consultando el chat.");
        setMessages((prev) => prev.slice(0, -1));
        return;
      }
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setError("No se pudo conectar. Revisa tu conexión e intenta de nuevo.");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 lg:bottom-7 lg:right-7">
      {open ? (
        <div className="flex h-[min(600px,calc(100vh-140px))] w-[min(370px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-[22px] border border-jaguar-ink/8 bg-white shadow-[0_30px_80px_-24px_rgba(13,18,16,0.35)]">
          <div className="flex items-center justify-between gap-3 border-b border-jaguar-ink/8 bg-jaguar-green-900 px-4 py-3.5 text-white">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                <ShieldCheck className="h-[18px] w-[18px]" strokeWidth={1.9} aria-hidden />
              </span>
              <div>
                <p className="text-[13.5px] font-bold leading-tight">Jaguares — Asistente</p>
                <p className="text-[11px] text-white/60">Info sobre el club</p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Cerrar"
              onClick={() => setOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/10"
            >
              <X className="h-4 w-4" strokeWidth={2} aria-hidden />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.length === 0 ? (
              <div className="space-y-3 pt-2">
                <p className="text-[12.5px] text-jaguar-ink/50">
                  Pregúntame por el club, próximos partidos, categorías o cómo inscribirte.
                </p>
                <div className="space-y-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => send(s)}
                      className="block w-full rounded-xl border border-jaguar-ink/10 px-3.5 py-2.5 text-left text-[12px] font-medium text-jaguar-ink/70 transition-colors hover:border-jaguar-green-500/40 hover:bg-jaguar-green-500/5"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[12.5px] leading-relaxed ${
                      m.role === "user" ? "bg-jaguar-green-600 text-white" : "bg-jaguar-mist/70 text-jaguar-ink"
                    }`}
                  >
                    <MarkdownLite text={m.content} />
                  </div>
                </div>
              ))
            )}
            {loading ? (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-2xl bg-jaguar-mist/70 px-4 py-3">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-jaguar-ink/30 [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-jaguar-ink/30 [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-jaguar-ink/30" />
                </div>
              </div>
            ) : null}
            {error ? <p className="text-[11.5px] font-medium text-jaguar-maroon-600">{error}</p> : null}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-jaguar-ink/8 px-3.5 py-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu pregunta…"
              disabled={loading}
              className="flex-1 rounded-xl border border-jaguar-ink/10 bg-jaguar-mist/40 px-3.5 py-2.5 text-[12.5px] text-jaguar-ink placeholder:text-jaguar-ink/35 focus:border-jaguar-green-500/40 focus:outline-none disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Enviar"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-jaguar-green-600 text-white transition-colors hover:bg-jaguar-green-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send className="h-4 w-4" strokeWidth={2.2} aria-hidden />
            </button>
          </form>
        </div>
      ) : null}

      <button
        type="button"
        aria-label={open ? "Cerrar asistente" : "Abrir asistente"}
        onClick={() => setOpen((v) => !v)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-jaguar-green-600 text-white shadow-[0_16px_36px_-10px_rgba(20,92,44,0.55)] transition-transform hover:scale-105"
      >
        {open ? <X className="h-5 w-5" strokeWidth={2.2} aria-hidden /> : <MessageCircle className="h-6 w-6" strokeWidth={1.9} aria-hidden />}
      </button>
    </div>
  );
}
