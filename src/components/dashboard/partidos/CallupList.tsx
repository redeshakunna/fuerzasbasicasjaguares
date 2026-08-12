"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle2, ChevronDown, ClipboardCheck, Loader2, MessageCircle, MoreVertical, XCircle } from "lucide-react";
import { Avatar } from "../ui/Avatar";
import { Card, CardHeader } from "../ui/Card";
import { StarRating } from "../ui/StarRating";
import { CallupPitchPreview } from "./CallupPitchPreview";
import { buildCallupWhatsAppMessage, saveCallups, type CallupRecordInput } from "@/app/plataforma/(dashboard)/partidos/actions";
import { callupPositionLabel, callupPositionOrder, getFullName, sortRosterForCallup } from "@/lib/data/players-stats";
import { whatsAppShareUrl } from "@/lib/training/whatsapp";
import type { PlayerRow } from "@/lib/data/players";
import type { CallupRow } from "@/lib/data/match-callups";
import type { RsvpStatus } from "@/lib/data/match-rsvp";
import type { Enums } from "@/lib/supabase/database.types";

type CallStatus = Enums<"call_status">;

const TARGET_SQUAD = 18;
const MAX_SQUAD = 20;

type Availability = "Disponible" | "Lesionado" | "Suspendido" | "No asistirá";
const availabilityOptions: Availability[] = ["Disponible", "Lesionado", "Suspendido", "No asistirá"];

interface RowState {
  availability: Availability;
  confirmed: boolean;
  minutes_played: string;
  entered_minute: string;
  goals: string;
  yellow_cards: string;
  red_card: boolean;
  notes: string;
}

function toRowState(c?: CallupRow): RowState {
  const special: Availability[] = ["Lesionado", "Suspendido", "No asistirá"];
  const status = c?.call_status ?? "Pendiente";
  const availability = special.includes(status as Availability) ? (status as Availability) : "Disponible";
  return {
    availability,
    confirmed: status === "Confirmado",
    minutes_played: c?.minutes_played != null ? String(c.minutes_played) : "",
    entered_minute: c?.entered_minute != null ? String(c.entered_minute) : "",
    goals: c?.goals ? String(c.goals) : "",
    yellow_cards: c?.yellow_cards ? String(c.yellow_cards) : "",
    red_card: c?.red_card ?? false,
    notes: c?.notes ?? "",
  };
}

function rowToCallStatus(r: RowState): CallStatus {
  if (r.availability !== "Disponible") return r.availability;
  return r.confirmed ? "Confirmado" : "Pendiente";
}

/**
 * Convocatoria — trae siempre el plantel completo de la categoría, ordenado de atrás
 * hacia adelante (Porteros → Defensas → Volantes → Extremos → Delanteros) y por mejor
 * promedio dentro de cada posición. El técnico marca con un check hasta completar los
 * 18 titulares (puede agregar hasta 2 opcionales, 20 en total). Jugadores lesionados,
 * suspendidos o que no asistirán se marcan aparte y no cuentan para el cupo.
 */
export function CallupList({
  matchId,
  category,
  players,
  initialCallups,
  rsvpByPlayer,
}: {
  matchId: string;
  category: string;
  players: PlayerRow[];
  initialCallups: CallupRow[];
  rsvpByPlayer?: Record<string, RsvpStatus>;
}) {
  const sortedRoster = useMemo(() => sortRosterForCallup(players), [players]);
  const callupByPlayer = useMemo(() => new Map(initialCallups.map((c) => [c.player_id, c])), [initialCallups]);

  const [rows, setRows] = useState<Record<string, RowState>>(() =>
    Object.fromEntries(sortedRoster.map((p) => [p.id, toRowState(callupByPlayer.get(p.id))])),
  );
  const [expanded, setExpanded] = useState<string | null>(null);
  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSharing, startSharingTransition] = useTransition();
  const [shareError, setShareError] = useState<string | null>(null);

  const confirmedCount = sortedRoster.filter((p) => rows[p.id]?.confirmed).length;
  const atMax = confirmedCount >= MAX_SQUAD;
  const confirmedPlayers = sortedRoster.filter((p) => rows[p.id]?.confirmed);

  const groups = useMemo(() => {
    const map = new Map<PlayerRow["position_group"], PlayerRow[]>();
    for (const p of sortedRoster) {
      const arr = map.get(p.position_group) ?? [];
      arr.push(p);
      map.set(p.position_group, arr);
    }
    return [...map.entries()].sort(([a], [b]) => callupPositionOrder[a] - callupPositionOrder[b]);
  }, [sortedRoster]);

  function updateRow(playerId: string, patch: Partial<RowState>) {
    setSaved(false);
    setRows((prev) => ({ ...prev, [playerId]: { ...(prev[playerId] as RowState), ...patch } }));
  }

  function toggleConfirmed(playerId: string) {
    const row = rows[playerId] as RowState;
    if (!row.confirmed && atMax) return;
    updateRow(playerId, { confirmed: !row.confirmed });
  }

  function setAvailability(playerId: string, availability: Availability) {
    updateRow(playerId, { availability, confirmed: availability === "Disponible" ? rows[playerId]?.confirmed ?? false : false });
    setMenuOpenFor(null);
  }

  function handleSave() {
    setError(null);
    const records: CallupRecordInput[] = sortedRoster.map((p) => {
      const r = rows[p.id] as RowState;
      return {
        player_id: p.id,
        call_status: rowToCallStatus(r),
        minutes_played: r.minutes_played ? Number(r.minutes_played) : null,
        entered_minute: r.entered_minute ? Number(r.entered_minute) : null,
        goals: r.goals ? Number(r.goals) : 0,
        yellow_cards: r.yellow_cards ? Number(r.yellow_cards) : 0,
        red_card: r.red_card,
        notes: r.notes ? r.notes : null,
      };
    });
    startTransition(async () => {
      const result = await saveCallups(matchId, records);
      if (result.error) setError(result.error);
      else setSaved(true);
    });
  }

  function handleShareWhatsApp() {
    setShareError(null);
    startSharingTransition(async () => {
      const result = await buildCallupWhatsAppMessage(matchId);
      if (result.error || !result.message) {
        setShareError(result.error ?? "No se pudo armar el mensaje.");
        return;
      }
      window.open(whatsAppShareUrl(result.message), "_blank");
    });
  }

  return (
    <Card className="border-none shadow-none">
      <CardHeader
        title="Convocatoria"
        subtitle={`${sortedRoster.length} jugadores de la categoría`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/plataforma/asistencia?categoria=${category}&partido=${matchId}`}
              className="flex items-center gap-1.5 rounded-xl border border-jaguar-ink/10 px-3.5 py-2.5 text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-ink/65 transition-colors hover:bg-jaguar-ink/[0.03]"
            >
              <ClipboardCheck className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              Ver asistencia
            </Link>
            <button
              type="button"
              onClick={handleShareWhatsApp}
              disabled={isSharing}
              className="flex items-center gap-1.5 rounded-xl bg-[#25D366] px-3.5 py-2.5 text-[12.5px] lg:text-[13.5px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {isSharing ? <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2.5} aria-hidden /> : <MessageCircle className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />}
              {isSharing ? "Armando…" : "Convocatoria WhatsApp"}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending}
              className="flex items-center gap-1.5 rounded-xl bg-jaguar-green-600 px-4 py-2.5 text-[13px] lg:text-[14px] font-semibold text-white transition-colors hover:bg-jaguar-green-700 disabled:opacity-60"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} aria-hidden /> : null}
              {isPending ? "Guardando…" : "Guardar convocatoria"}
            </button>
          </div>
        }
      />

      {shareError ? (
        <p className="mx-6 mt-3 rounded-xl bg-jaguar-maroon-500/8 px-3.5 py-2.5 text-[13px] lg:text-[14px] font-medium text-jaguar-maroon-600">{shareError}</p>
      ) : null}

      <p className="mt-3 px-6 text-[11.5px] lg:text-[12.5px] text-jaguar-ink/40">
        &ldquo;Convocatoria WhatsApp&rdquo; incluye, junto a cada convocado, su link personal para confirmar asistencia.
      </p>

      <div className="mt-4 flex items-center justify-between px-6">
        <p className="text-[13.5px] lg:text-[15px] font-bold text-jaguar-ink">
          {confirmedCount} <span className="font-medium text-jaguar-ink/40">/ {TARGET_SQUAD} convocados</span>
          {confirmedCount > TARGET_SQUAD ? (
            <span className="ml-1.5 text-[12px] lg:text-[13px] font-semibold text-jaguar-gold-600">
              (+{confirmedCount - TARGET_SQUAD} opcional{confirmedCount - TARGET_SQUAD > 1 ? "es" : ""})
            </span>
          ) : null}
        </p>
        {atMax ? <p className="text-[11.5px] lg:text-[12.5px] font-semibold text-jaguar-maroon-600">Cupo máximo alcanzado ({MAX_SQUAD})</p> : null}
      </div>

      <div className="mt-4">
        <CallupPitchPreview players={confirmedPlayers} />
      </div>

      {error ? (
        <p className="mx-6 mt-3 rounded-xl bg-jaguar-maroon-500/8 px-3.5 py-2.5 text-[13px] lg:text-[14px] font-medium text-jaguar-maroon-600">{error}</p>
      ) : null}
      {saved ? <p className="mx-6 mt-3 text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-green-600">Convocatoria guardada ✓</p> : null}

      <div className="mx-auto mt-4 max-w-[640px] space-y-5 px-4 pb-2">
        {sortedRoster.length === 0 ? (
          <p className="px-3 py-6 text-center text-[12.5px] lg:text-[13.5px] text-jaguar-ink/40">No hay jugadores en esta categoría todavía.</p>
        ) : null}

        {groups.map(([positionGroup, groupPlayers]) => (
          <div key={positionGroup}>
            <p className="px-2 text-[11px] lg:text-[12px] font-bold uppercase tracking-[0.05em] text-jaguar-ink/35">
              {callupPositionLabel[positionGroup]} · {groupPlayers.length}
            </p>
            <div className="mt-1.5 divide-y divide-jaguar-ink/6">
              {groupPlayers.map((player) => {
                const fullName = getFullName(player);
                const row = rows[player.id] as RowState;
                const isExpanded = expanded === player.id;
                const isSpecial = row.availability !== "Disponible";
                const disableCheckbox = isSpecial || (!row.confirmed && atMax);
                const rsvp = rsvpByPlayer?.[player.id];

                return (
                  <div key={player.id} className="py-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={row.confirmed}
                        disabled={disableCheckbox}
                        onClick={() => toggleConfirmed(player.id)}
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-colors ${
                          row.confirmed
                            ? "border-jaguar-green-600 bg-jaguar-green-600 text-white"
                            : "border-jaguar-ink/15 bg-white text-transparent"
                        } ${disableCheckbox ? "opacity-35" : "hover:border-jaguar-green-500"}`}
                      >
                        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden>
                          <path d="M3 8.5 6.2 12 13 4" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>

                      <Link href={`/plataforma/jugadores/${player.id}`} className="shrink-0" onClick={(e) => e.stopPropagation()}>
                        <Avatar initials={fullName.slice(0, 2).toUpperCase()} photoUrl={player.photo_url} size={40} />
                      </Link>

                      <Link
                        href={`/plataforma/jugadores/${player.id}`}
                        className="group min-w-0 flex-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <p className="truncate text-[13.5px] lg:text-[15px] font-semibold text-jaguar-ink group-hover:underline">{fullName}</p>
                        <div className="mt-0.5 flex items-center gap-1.5">
                          <p className="text-[11.5px] lg:text-[12.5px] text-jaguar-ink/45">
                            {player.jersey_number ? `#${player.jersey_number} · ` : ""}
                            {player.position}
                          </p>
                          {player.rating ? <StarRating value={player.rating} size={10} /> : null}
                        </div>
                      </Link>

                      {row.confirmed && !isSpecial && rsvp?.response ? (
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
                      ) : null}

                      {isSpecial ? (
                        <span className="rounded-full bg-jaguar-maroon-500/10 px-2.5 py-1 text-[10.5px] lg:text-[11.5px] font-bold uppercase tracking-[0.02em] text-jaguar-maroon-600">
                          {row.availability}
                        </span>
                      ) : null}

                      {row.confirmed && !isSpecial ? (
                        <button
                          type="button"
                          onClick={() => setExpanded(isExpanded ? null : player.id)}
                          aria-label="Detalle de participación"
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-jaguar-ink/35 hover:bg-jaguar-mist/60"
                        >
                          <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} strokeWidth={2} aria-hidden />
                        </button>
                      ) : null}

                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setMenuOpenFor(menuOpenFor === player.id ? null : player.id)}
                          aria-label="Disponibilidad"
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-jaguar-ink/30 hover:bg-jaguar-mist/60"
                        >
                          <MoreVertical className="h-4 w-4" strokeWidth={2} aria-hidden />
                        </button>
                      </div>
                    </div>

                    {menuOpenFor === player.id ? (
                      <div className="mt-2 ml-9 flex flex-wrap gap-1.5">
                        {availabilityOptions.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setAvailability(player.id, opt)}
                            className={`rounded-full px-2.5 py-1 text-[11px] lg:text-[12px] font-semibold transition-colors ${
                              row.availability === opt
                                ? "bg-jaguar-ink text-white"
                                : "bg-jaguar-mist/70 text-jaguar-ink/55 hover:bg-jaguar-mist"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    ) : null}

                    {isExpanded && row.confirmed && !isSpecial ? (
                      <div className="mt-2.5 ml-9 grid grid-cols-2 gap-2 sm:grid-cols-4">
                        <label className="text-[10.5px] lg:text-[11.5px] text-jaguar-ink/50">
                          Min. jugados
                          <input
                            type="number"
                            min={0}
                            max={120}
                            value={row.minutes_played}
                            onChange={(e) => updateRow(player.id, { minutes_played: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-jaguar-ink/10 bg-jaguar-mist/40 px-2 py-1.5 text-[12px] lg:text-[13px] text-jaguar-ink focus:outline-none"
                          />
                        </label>
                        <label className="text-[10.5px] lg:text-[11.5px] text-jaguar-ink/50">
                          Ingresó min.
                          <input
                            type="number"
                            min={0}
                            max={120}
                            value={row.entered_minute}
                            onChange={(e) => updateRow(player.id, { entered_minute: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-jaguar-ink/10 bg-jaguar-mist/40 px-2 py-1.5 text-[12px] lg:text-[13px] text-jaguar-ink focus:outline-none"
                          />
                        </label>
                        <label className="text-[10.5px] lg:text-[11.5px] text-jaguar-ink/50">
                          Goles
                          <input
                            type="number"
                            min={0}
                            value={row.goals}
                            onChange={(e) => updateRow(player.id, { goals: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-jaguar-ink/10 bg-jaguar-mist/40 px-2 py-1.5 text-[12px] lg:text-[13px] text-jaguar-ink focus:outline-none"
                          />
                        </label>
                        <label className="text-[10.5px] lg:text-[11.5px] text-jaguar-ink/50">
                          T. amarillas
                          <input
                            type="number"
                            min={0}
                            max={2}
                            value={row.yellow_cards}
                            onChange={(e) => updateRow(player.id, { yellow_cards: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-jaguar-ink/10 bg-jaguar-mist/40 px-2 py-1.5 text-[12px] lg:text-[13px] text-jaguar-ink focus:outline-none"
                          />
                        </label>
                        <label className="col-span-2 flex items-center gap-2 text-[11px] lg:text-[12px] text-jaguar-ink/60 sm:col-span-4">
                          <input
                            type="checkbox"
                            checked={row.red_card}
                            onChange={(e) => updateRow(player.id, { red_card: e.target.checked })}
                            className="h-3.5 w-3.5 rounded border-jaguar-ink/20"
                          />
                          Tarjeta roja
                        </label>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
