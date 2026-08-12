"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, CheckCircle2, Clock, Loader2, MapPin, ThumbsDown, ThumbsUp, Trophy } from "lucide-react";
import { submitRsvp } from "@/app/confirmar/[token]/actions";
import type { RsvpLookupResult, RsvpResponse } from "@/lib/data/match-rsvp";

const monthNames = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

function formatFullDate(value: string | null) {
  if (!value) return null;
  const [y, m, d] = value.split("-");
  return `${Number(d)} de ${monthNames[Number(m) - 1]} de ${y}`;
}

function formatTime12h(value: string | null) {
  if (!value) return null;
  const [h, m] = value.split(":");
  const hour = Number(h);
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${m} ${period}`;
}

/** Confirmación de asistencia — personal, un toque, con opción de contar por qué si no puede ir. */
export function RsvpConfirmClient({ token, info }: { token: string; info: RsvpLookupResult }) {
  const [response, setResponse] = useState<RsvpResponse | null>(info.currentResponse);
  const [reason, setReason] = useState(info.currentReason ?? "");
  const [showReasonField, setShowReasonField] = useState(info.currentResponse === "No asiste");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const displayName = info.playerNickname || info.playerFirstName;

  function submit(value: RsvpResponse, reasonText: string) {
    setError(null);
    startTransition(async () => {
      const result = await submitRsvp(token, value, reasonText);
      if (result.error) {
        setError(result.error);
        return;
      }
      setDone(true);
    });
  }

  function choose(value: RsvpResponse) {
    setDone(false);
    setResponse(value);
    if (value === "No asiste") {
      setShowReasonField(true);
      return;
    }
    setShowReasonField(false);
    submit(value, "");
  }

  return (
    <div>
      <div className="flex flex-col items-center text-center">
        <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-jaguar-mist ring-1 ring-jaguar-ink/8">
          <Image src={info.playerPhotoUrl || "/brand/default-avatar.png"} alt={displayName} fill sizes="64px" className="object-cover" />
        </div>
        <h1 className="mt-3 text-[19px] font-extrabold text-jaguar-ink">Hola, {displayName} 👋</h1>
        <p className="mt-1 text-[13px] text-jaguar-ink/55">¿Vas a asistir a este partido?</p>
      </div>

      <div className="mt-5 rounded-2xl bg-jaguar-mist/50 p-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-jaguar-gold-500/15 text-jaguar-gold-700">
            <Trophy className="h-4.5 w-4.5" strokeWidth={1.9} aria-hidden />
          </span>
          <p className="text-[13.5px] font-bold text-jaguar-ink">{info.activityTitle ?? "Partido"}</p>
        </div>
        <div className="mt-3 space-y-1.5 text-[12.5px] text-jaguar-ink/60">
          {info.activityDate ? (
            <div className="flex items-center gap-2">
              <CalendarDays className="h-3.5 w-3.5 text-jaguar-ink/35" strokeWidth={2} aria-hidden />
              {formatFullDate(info.activityDate)}
            </div>
          ) : null}
          {info.activityTime ? (
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-jaguar-ink/35" strokeWidth={2} aria-hidden />
              {formatTime12h(info.activityTime)}
            </div>
          ) : null}
          {info.activityLocation ? (
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-jaguar-ink/35" strokeWidth={2} aria-hidden />
              {info.activityLocation}
            </div>
          ) : null}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {done ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex flex-col items-center gap-2 rounded-2xl bg-jaguar-green-50 px-4 py-6 text-center"
          >
            <CheckCircle2 className="h-7 w-7 text-jaguar-green-600" strokeWidth={1.8} aria-hidden />
            <p className="text-[14px] font-bold text-jaguar-ink">
              {response === "Confirmado" ? `¡Gracias, ${displayName}! Ahí te esperamos.` : `Gracias por avisar, ${displayName}.`}
            </p>
            <p className="text-[12.5px] text-jaguar-ink/55">
              {response === "Confirmado"
                ? "Tu confirmación ya quedó registrada para el cuerpo técnico."
                : "Le avisamos al cuerpo técnico que no podrás asistir."}
            </p>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => choose("Confirmado")}
                disabled={isPending}
                className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 px-4 py-4 text-[13px] font-bold transition-colors disabled:opacity-60 ${
                  response === "Confirmado"
                    ? "border-jaguar-green-600 bg-jaguar-green-50 text-jaguar-green-700"
                    : "border-jaguar-ink/10 text-jaguar-ink/60 hover:border-jaguar-green-500/40"
                }`}
              >
                <ThumbsUp className="h-5 w-5" strokeWidth={2} aria-hidden />
                Sí, ahí estaré
              </button>
              <button
                type="button"
                onClick={() => choose("No asiste")}
                disabled={isPending}
                className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 px-4 py-4 text-[13px] font-bold transition-colors disabled:opacity-60 ${
                  response === "No asiste"
                    ? "border-jaguar-maroon-500 bg-jaguar-maroon-500/8 text-jaguar-maroon-600"
                    : "border-jaguar-ink/10 text-jaguar-ink/60 hover:border-jaguar-maroon-500/30"
                }`}
              >
                <ThumbsDown className="h-5 w-5" strokeWidth={2} aria-hidden />
                No podré ir
              </button>
            </div>

            {showReasonField ? (
              <div className="rounded-2xl bg-jaguar-mist/40 p-4">
                <label className="text-[12.5px] font-semibold text-jaguar-ink/70">¿Nos cuentas por qué? (opcional)</label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ej. tengo un compromiso familiar…"
                  className="mt-2 w-full resize-none rounded-xl border border-jaguar-ink/10 bg-white px-3.5 py-2.5 text-[13px] text-jaguar-ink placeholder:text-jaguar-ink/35 focus:border-jaguar-green-500/40 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => submit("No asiste", reason)}
                  disabled={isPending}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-jaguar-ink px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-jaguar-ink/85 disabled:opacity-60"
                >
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} aria-hidden /> : null}
                  {isPending ? "Enviando…" : "Confirmar que no podré ir"}
                </button>
              </div>
            ) : null}

            {isPending && !showReasonField ? (
              <p className="flex items-center justify-center gap-1.5 text-[12px] font-semibold text-jaguar-ink/40">
                <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2.5} aria-hidden />
                Guardando tu respuesta…
              </p>
            ) : null}

            {error ? <p className="text-center text-[12.5px] font-medium text-jaguar-maroon-600">{error}</p> : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
