"use client";

import { useEffect } from "react";
import { CalendarDays, Clock, MapPin, X } from "lucide-react";
import type { MatchRow } from "@/lib/data/matches";

const weekdayFormatter = new Intl.DateTimeFormat("es-CO", { weekday: "long", timeZone: "UTC" });
const monthFormatter = new Intl.DateTimeFormat("es-CO", { month: "long", timeZone: "UTC" });

function formatMatchDateLong(matchDate: string): string {
  const date = new Date(`${matchDate}T00:00:00Z`);
  const weekday = weekdayFormatter.format(date);
  const month = monthFormatter.format(date);
  const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  return `${capitalizedWeekday} ${date.getUTCDate()} de ${month}, ${date.getUTCFullYear()}`;
}

function formatMatchTime(matchTime: string | null): string {
  if (!matchTime) return "Hora por confirmar";
  const [hourStr, minuteStr] = matchTime.split(":");
  const hour = Number(hourStr);
  const minute = Number(minuteStr ?? "0");
  if (Number.isNaN(hour) || Number.isNaN(minute)) return "Hora por confirmar";
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${String(minute).padStart(2, "0")} ${period}`;
}

const statusStyles: Record<string, string> = {
  Confirmado: "bg-jaguar-green-600/10 text-jaguar-green-700",
  "Por confirmar": "bg-jaguar-gold-500/15 text-jaguar-gold-700",
};

interface MatchCalendarModalProps {
  matches: MatchRow[];
  open: boolean;
  onClose: () => void;
}

/**
 * Ventana emergente "Calendario de partidos" — puramente informativa, sin
 * acciones ni login: muestra los partidos programados (confirmados o no)
 * para que las familias vean la agenda completa, no solo el próximo.
 */
export function MatchCalendarModal({ matches, open, onClose }: MatchCalendarModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-jaguar-ink/40 p-4 backdrop-blur-sm">
      <button type="button" aria-label="Cerrar" onClick={onClose} className="absolute inset-0" />
      <div className="relative flex max-h-[85vh] w-full max-w-[540px] flex-col overflow-hidden rounded-[22px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-jaguar-ink/6 px-6 py-5">
          <div>
            <h2 className="text-[16px] lg:text-[17.5px] font-extrabold text-jaguar-ink">Calendario de partidos</h2>
            <p className="mt-0.5 text-[12.5px] text-jaguar-ink/50">Partidos programados — solo informativo.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-jaguar-ink/40 hover:bg-jaguar-mist/60"
          >
            <X className="h-4 w-4" strokeWidth={2} aria-hidden />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3">
          {matches.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-14 text-center">
              <CalendarDays className="h-6 w-6 text-jaguar-ink/20" strokeWidth={1.6} aria-hidden />
              <p className="mt-2 text-[13px] text-jaguar-ink/45">Todavía no hay partidos programados.</p>
            </div>
          ) : (
            <ul className="divide-y divide-jaguar-ink/6">
              {matches.map((match) => (
                <li key={match.id} className="px-3 py-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-bold text-jaguar-ink">
                        {match.is_home ? "Jaguares vs. " : "vs. "}
                        {match.opponent}
                      </p>
                      <p className="mt-0.5 text-[12px] text-jaguar-ink/50">
                        {match.competition || "Torneo por confirmar"} · {match.category}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.04em] ${
                        statusStyles[match.status] ?? "bg-jaguar-ink/6 text-jaguar-ink/50"
                      }`}
                    >
                      {match.status}
                    </span>
                  </div>
                  <dl className="mt-2 space-y-1 text-[12px] text-jaguar-ink/60">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-3.5 w-3.5 shrink-0 text-jaguar-ink/35" strokeWidth={1.8} aria-hidden />
                      <dd>{formatMatchDateLong(match.match_date)}</dd>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 shrink-0 text-jaguar-ink/35" strokeWidth={1.8} aria-hidden />
                      <dd>{formatMatchTime(match.match_time)}</dd>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-jaguar-ink/35" strokeWidth={1.8} aria-hidden />
                      <dd className="leading-relaxed">{match.location || "Sede por confirmar"}</dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
