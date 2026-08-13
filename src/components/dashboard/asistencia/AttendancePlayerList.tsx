"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Search, XCircle } from "lucide-react";
import { Avatar } from "../ui/Avatar";
import { Card, CardHeader } from "../ui/Card";
import { getFullName } from "@/lib/data/players-stats";
import type { RsvpStatus } from "@/lib/data/match-rsvp";
import type { PlayerRow } from "@/lib/data/players";
import type { Enums } from "@/lib/supabase/database.types";

type AttendanceStatus = Enums<"attendance_status">;

const statusOptions: { value: AttendanceStatus; label: string; tone: string }[] = [
  { value: "Presente", label: "Presente", tone: "border-jaguar-green-500 bg-jaguar-green-50 text-jaguar-green-700" },
  { value: "Tarde", label: "Tarde", tone: "border-jaguar-gold-500 bg-jaguar-gold-500/10 text-jaguar-gold-700" },
  { value: "Justificado", label: "Justificado", tone: "border-jaguar-turquoise-500 bg-jaguar-turquoise-500/10 text-jaguar-turquoise-600" },
  { value: "Ausente", label: "Ausente", tone: "border-jaguar-maroon-500 bg-jaguar-maroon-500/10 text-jaguar-maroon-600" },
];

// Tinte de fondo + borde por fila — para que las excepciones (todo menos "Presente") salten a la vista sin leer cada nombre.
const rowTone: Record<AttendanceStatus, string> = {
  Presente: "border-l-transparent",
  Tarde: "bg-jaguar-gold-500/[0.06] border-l-jaguar-gold-500",
  Justificado: "bg-jaguar-turquoise-500/[0.06] border-l-jaguar-turquoise-500",
  Ausente: "bg-jaguar-maroon-500/[0.06] border-l-jaguar-maroon-500",
};

/** Lista limpia de jugadores — un clic sobre el estado deseado lo cambia, sin pasos extra. */
export function AttendancePlayerList({
  players,
  statuses,
  onChange,
  readOnly = false,
  rsvpByPlayer,
  manualNoShow,
}: {
  players: PlayerRow[];
  statuses: Record<string, AttendanceStatus>;
  onChange: (playerId: string, status: AttendanceStatus) => void;
  readOnly?: boolean;
  rsvpByPlayer?: Record<string, RsvpStatus>;
  /** Jugadores que el técnico marcó manualmente como "No asistirá" en la Convocatoria. */
  manualNoShow?: Record<string, boolean>;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<AttendanceStatus | "Todos">("Todos");

  const filtered = players.filter((p) => {
    const matchesSearch = getFullName(p).toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "Todos" || statuses[p.id] === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <Card>
      <CardHeader
        title={`Jugadores (${players.length})`}
        action={
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1 sm:flex-none">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-jaguar-ink/30" strokeWidth={2} aria-hidden />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar jugador…"
                className="w-full rounded-xl border border-jaguar-ink/10 bg-jaguar-mist/40 py-2 pl-8 pr-3 text-[12.5px] lg:text-[13.5px] text-jaguar-ink placeholder:text-jaguar-ink/35 focus:border-jaguar-green-500/40 focus:outline-none sm:w-auto"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as AttendanceStatus | "Todos")}
              className="w-full rounded-xl border border-jaguar-ink/10 bg-white px-3 py-2 text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-ink focus:border-jaguar-green-500/40 focus:outline-none sm:w-auto"
            >
              <option value="Todos">Todos los estados</option>
              {statusOptions.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        }
      />
      {filtered.length === 0 ? (
        <p className="px-6 py-8 text-center text-[13px] lg:text-[14px] text-jaguar-ink/40">
          {players.length === 0 ? "No hay jugadores en esta categoría todavía." : "No hay jugadores que coincidan."}
        </p>
      ) : (
        <div className="mt-3 grid grid-cols-1 gap-x-4 px-3 pb-3 sm:grid-cols-2">
          {filtered.map((player) => {
            const fullName = getFullName(player);
            const status = statuses[player.id];
            const rsvp = rsvpByPlayer?.[player.id];
            const expectedAbsent = rsvp?.response === "No asiste" || Boolean(manualNoShow?.[player.id]);
            return (
              <div
                key={player.id}
                className={`rounded-xl border-l-[3px] px-2.5 py-2.5 transition-colors ${
                  status ? rowTone[status] : rowTone.Presente
                } ${!status || status === "Presente" ? "hover:bg-jaguar-mist/30" : ""}`}
              >
                <div className="flex items-center gap-2.5">
                  <Link
                    href={`/plataforma/jugadores/${player.id}`}
                    className={`shrink-0 rounded-full ${
                      rsvp?.response === "Confirmado"
                        ? "ring-2 ring-jaguar-green-500 ring-offset-2 ring-offset-white"
                        : expectedAbsent
                          ? "ring-2 ring-jaguar-maroon-400 ring-offset-2 ring-offset-white"
                          : ""
                    }`}
                  >
                    <Avatar initials={fullName.slice(0, 2).toUpperCase()} photoUrl={player.photo_url} size={34} />
                  </Link>
                  <Link href={`/plataforma/jugadores/${player.id}`} className="group min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 truncate text-[13px] lg:text-[14px] font-semibold text-jaguar-ink group-hover:underline">
                      {fullName}
                    </p>
                    <p className="text-[11px] lg:text-[12px] text-jaguar-ink/45">{player.position}</p>
                  </Link>
                  {rsvp?.response ? (
                    <span
                      title={rsvp.response === "Confirmado" ? "Confirmó por WhatsApp" : `Avisó que no va${rsvp.reason ? `: ${rsvp.reason}` : ""}`}
                      className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10px] lg:text-[11px] font-bold ${
                        rsvp.response === "Confirmado"
                          ? "bg-jaguar-green-500/10 text-jaguar-green-700"
                          : "bg-jaguar-maroon-500/10 text-jaguar-maroon-600"
                      }`}
                    >
                      {rsvp.response === "Confirmado" ? (
                        <CheckCircle2 className="h-3 w-3" strokeWidth={2.2} aria-hidden />
                      ) : (
                        <XCircle className="h-3 w-3" strokeWidth={2.2} aria-hidden />
                      )}
                      <span className="hidden sm:inline">{rsvp.response === "Confirmado" ? "Confirmó" : "No va"}</span>
                    </span>
                  ) : !rsvp?.response && manualNoShow?.[player.id] ? (
                    <span
                      title="Marcado como No asistirá en la convocatoria"
                      className="flex shrink-0 items-center gap-1 rounded-full bg-jaguar-maroon-500/10 px-2 py-1 text-[10px] lg:text-[11px] font-bold text-jaguar-maroon-600"
                    >
                      <XCircle className="h-3 w-3" strokeWidth={2.2} aria-hidden />
                      <span className="hidden sm:inline">No asistirá</span>
                    </span>
                  ) : null}
                </div>
                <div className="mt-2.5 grid grid-cols-4 gap-1.5">
                  {statusOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={readOnly}
                      onClick={() => onChange(player.id, opt.value)}
                      className={`flex min-h-[38px] items-center justify-center rounded-lg border px-1 text-center text-[11px] lg:text-[12px] font-semibold leading-tight transition-colors ${
                        statuses[player.id] === opt.value ? opt.tone : "border-jaguar-ink/10 text-jaguar-ink/40"
                      } ${readOnly ? "cursor-not-allowed opacity-60" : ""}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
