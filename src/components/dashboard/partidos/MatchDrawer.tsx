"use client";

import { useState } from "react";
import { CalendarDays, Clock, MapPin, Pencil, ShieldCheck, Trophy, X } from "lucide-react";
import { Badge } from "../ui/Badge";
import { CallupList } from "./CallupList";
import { EditMatchDialog } from "./EditMatchDialog";
import { RegisterResultForm } from "./RegisterResultForm";
import { formatMatchDateLong, formatMatchTime12h, matchOutcome, outcomeBadgeTone } from "@/lib/data/match-stats";
import type { MatchRow } from "@/lib/data/matches";
import type { PlayerRow } from "@/lib/data/players";
import type { CallupRow } from "@/lib/data/match-callups";
import type { StaffProfile } from "@/lib/data/staff";

function TeamBadge({ label, tone }: { label: string; tone: "green" | "neutral" }) {
  return (
    <span
      className={`flex h-14 w-14 items-center justify-center rounded-2xl text-[13px] lg:text-[14px] font-extrabold ${
        tone === "green" ? "bg-jaguar-green-600 text-white" : "bg-jaguar-mist text-jaguar-ink/60"
      }`}
    >
      {label}
    </span>
  );
}

/** Panel lateral de detalle de partido — la vía rápida a convocatoria, cuerpo técnico y resultado sin salir de la página. */
export function MatchDrawer({
  match,
  players,
  callups,
  staff,
  onClose,
}: {
  match: MatchRow;
  players: PlayerRow[];
  callups: CallupRow[];
  staff: StaffProfile[];
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"convocatoria" | "cuerpo">("convocatoria");
  const [showResultForm, setShowResultForm] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const outcome = matchOutcome(match);

  const rivalInitials = match.opponent.slice(0, 3).toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-jaguar-ink/40 p-4 backdrop-blur-sm">
      <button type="button" aria-label="Cerrar" onClick={onClose} className="absolute inset-0" />
      <div className="relative flex max-h-[92vh] w-full max-w-[880px] flex-col overflow-hidden rounded-[22px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-jaguar-ink/6 px-6 py-5">
          <h2 className="text-[16px] lg:text-[17.5px] font-extrabold text-jaguar-ink">Detalle de partido</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-jaguar-ink/40 hover:bg-jaguar-mist/60"
          >
            <X className="h-4 w-4" strokeWidth={2} aria-hidden />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-6">
            <div className="flex items-center justify-center gap-6">
              <div className="flex flex-col items-center gap-1.5">
                <TeamBadge label="JAG" tone="green" />
                <span className="text-[12px] lg:text-[13px] font-semibold text-jaguar-ink/60">Jaguares {match.category}</span>
              </div>
              <span className="text-[13px] lg:text-[14px] font-bold text-jaguar-ink/30">VS</span>
              <div className="flex flex-col items-center gap-1.5">
                <TeamBadge label={rivalInitials} tone="neutral" />
                <span className="max-w-[140px] truncate text-[12px] lg:text-[13px] font-semibold text-jaguar-ink/60">{match.opponent}</span>
              </div>
            </div>

            <div className="mt-4 flex justify-center">
              <Badge tone={outcomeBadgeTone[outcome]}>{outcome === "Programado" ? match.status : outcome}</Badge>
            </div>

            {outcome !== "Programado" ? (
              <p className="mt-3 text-center text-[30px] font-extrabold text-jaguar-ink">
                {match.our_score} <span className="text-jaguar-ink/25">-</span> {match.opponent_score}
              </p>
            ) : null}

            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12.5px] lg:text-[13.5px] text-jaguar-ink/60">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-3.5 w-3.5 text-jaguar-ink/35" strokeWidth={2} aria-hidden />
                {formatMatchDateLong(match.match_date)}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-jaguar-ink/35" strokeWidth={2} aria-hidden />
                {formatMatchTime12h(match.match_time)}
              </div>
              {match.location ? (
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-jaguar-ink/35" strokeWidth={2} aria-hidden />
                  {match.location}
                </div>
              ) : null}
              {match.competition ? (
                <div className="flex items-center gap-2">
                  <Trophy className="h-3.5 w-3.5 text-jaguar-ink/35" strokeWidth={2} aria-hidden />
                  {match.competition}
                </div>
              ) : null}
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-jaguar-ink/35" strokeWidth={2} aria-hidden />
                Categoría: {match.category}
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-1 border-y border-jaguar-ink/6 px-6">
            <button
              type="button"
              onClick={() => setTab("convocatoria")}
              className={`border-b-2 px-4 py-2.5 text-[12.5px] lg:text-[13.5px] font-bold transition-colors ${
                tab === "convocatoria" ? "border-jaguar-green-600 text-jaguar-green-700" : "border-transparent text-jaguar-ink/40"
              }`}
            >
              Convocatoria ({players.length})
            </button>
            <button
              type="button"
              onClick={() => setTab("cuerpo")}
              className={`border-b-2 px-4 py-2.5 text-[12.5px] lg:text-[13.5px] font-bold transition-colors ${
                tab === "cuerpo" ? "border-jaguar-green-600 text-jaguar-green-700" : "border-transparent text-jaguar-ink/40"
              }`}
            >
              Cuerpo técnico ({staff.length})
            </button>
          </div>

          <div className="py-2">
            {tab === "convocatoria" ? (
              <CallupList matchId={match.id} category={match.category} players={players} initialCallups={callups} />
            ) : (
              <div className="mx-auto max-w-[480px] divide-y divide-jaguar-ink/6 px-6">
                {staff.length === 0 ? (
                  <p className="px-1 py-8 text-center text-[12.5px] lg:text-[13.5px] text-jaguar-ink/40">Sin cuerpo técnico registrado.</p>
                ) : (
                  staff.map((member) => (
                    <div key={member.id} className="flex items-center gap-3 px-1 py-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-jaguar-turquoise-500/10 text-[12px] lg:text-[13px] font-bold text-jaguar-turquoise-600">
                        {member.full_name.slice(0, 2).toUpperCase()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] lg:text-[14px] font-semibold text-jaguar-ink">{member.full_name}</p>
                        <p className="text-[11.5px] lg:text-[12.5px] capitalize text-jaguar-ink/45">{member.role}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {showResultForm ? (
            <div className="mx-auto max-w-[480px] border-t border-jaguar-ink/6 px-6 py-4">
              <RegisterResultForm match={match} onDone={() => setShowResultForm(false)} />
            </div>
          ) : null}
        </div>

        <div className="mx-auto flex w-full max-w-[560px] items-center gap-2 border-t border-jaguar-ink/6 px-6 py-4">
          <button
            type="button"
            onClick={() => setShowEditDialog(true)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-jaguar-ink/10 px-4 py-2.5 text-[13px] lg:text-[14px] font-semibold text-jaguar-ink/70 transition-colors hover:bg-jaguar-mist/50"
          >
            <Pencil className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            Editar
          </button>
          <button
            type="button"
            onClick={() => setShowResultForm((v) => !v)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-jaguar-green-600 px-4 py-2.5 text-[13px] lg:text-[14px] font-semibold text-white transition-colors hover:bg-jaguar-green-700"
          >
            <Trophy className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            {showResultForm ? "Ocultar" : "Resultado"}
          </button>
        </div>
      </div>

      {showEditDialog ? <EditMatchDialog match={match} onClose={() => setShowEditDialog(false)} /> : null}
    </div>
  );
}
