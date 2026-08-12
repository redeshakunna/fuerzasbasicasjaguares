"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { EvaluationSummaryCards } from "./EvaluationSummaryCards";
import { EvaluationPlayerList } from "./EvaluationPlayerList";
import { EvaluationDrawer } from "./EvaluationDrawer";
import type { AttendanceActivity } from "@/app/plataforma/(dashboard)/entrenamientos/actions";
import type { PlayerRow } from "@/lib/data/players";
import type { Enums, Tables } from "@/lib/supabase/database.types";

type EvaluationRow = Tables<"evaluations">;
type AttendanceStatus = Enums<"attendance_status">;
type CallupRow = Tables<"match_callups">;

/** Orquesta la lista + Drawer del hub de Evaluaciones para una actividad (entrenamiento o partido). */
export function EvaluacionesShell({
  activity,
  activityTitle,
  category,
  players,
  evaluationsByPlayer,
  attendanceByPlayer,
  callupByPlayer,
}: {
  activity: AttendanceActivity;
  activityTitle: string;
  category: string;
  players: PlayerRow[];
  evaluationsByPlayer: Record<string, EvaluationRow>;
  attendanceByPlayer: Record<string, AttendanceStatus>;
  callupByPlayer?: Record<string, CallupRow>;
}) {
  const router = useRouter();
  const evaluations = useMemo(() => new Map(Object.entries(evaluationsByPlayer)), [evaluationsByPlayer]);
  const hasAttendance = Object.keys(attendanceByPlayer).length > 0;
  const [onlyPresent, setOnlyPresent] = useState(hasAttendance);
  const [openPlayerId, setOpenPlayerId] = useState<string | null>(null);

  const visiblePlayers = useMemo(() => {
    if (!onlyPresent || !hasAttendance) return players;
    return players.filter((p) => {
      const status = attendanceByPlayer[p.id];
      return status === "Presente" || status === "Tarde";
    });
  }, [players, onlyPresent, hasAttendance, attendanceByPlayer]);

  const doneCount = players.filter((p) => evaluations.has(p.id)).length;
  const pendingCount = players.length - doneCount;
  const overallValues = players
    .map((p) => evaluations.get(p.id)?.overall_score)
    .filter((v): v is number => v !== undefined && v !== null);
  const average = overallValues.length > 0 ? overallValues.reduce((a, b) => a + b, 0) / overallValues.length / 2 : null;
  const featured = players.filter((p) => evaluations.get(p.id)?.is_standout === true).length;

  const openPlayer = players.find((p) => p.id === openPlayerId) ?? null;

  return (
    <div className="space-y-6">
      <EvaluationSummaryCards pending={pendingCount} done={doneCount} total={players.length} average={average} featured={featured} />

      {hasAttendance ? (
        <div className="flex flex-wrap items-center gap-2 text-[12.5px] lg:text-[13.5px] text-jaguar-ink/55">
          <button
            type="button"
            onClick={() => setOnlyPresent((v) => !v)}
            className={`rounded-full px-3 py-1.5 font-semibold transition-colors ${
              onlyPresent ? "bg-jaguar-green-50 text-jaguar-green-700" : "bg-jaguar-mist/60 text-jaguar-ink/50"
            }`}
          >
            {onlyPresent ? "Mostrando solo jugadores presentes" : "Mostrando todo el plantel"}
          </button>
          <span className="text-jaguar-ink/35">Basado en la asistencia registrada para esta sesión.</span>
        </div>
      ) : null}

      <EvaluationPlayerList players={visiblePlayers} evaluations={evaluations} onEvaluate={setOpenPlayerId} />

      {openPlayer ? (
        <EvaluationDrawer
          activity={activity}
          activityTitle={activityTitle}
          player={openPlayer}
          category={category}
          existingEvaluation={evaluations.get(openPlayer.id) ?? null}
          callup={callupByPlayer?.[openPlayer.id] ?? null}
          onClose={() => setOpenPlayerId(null)}
          onSaved={() => router.refresh()}
        />
      ) : null}
    </div>
  );
}
