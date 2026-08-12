"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Avatar } from "../ui/Avatar";
import { Card, CardHeader } from "../ui/Card";
import { saveAttendance } from "@/app/plataforma/(dashboard)/entrenamientos/actions";
import { getFullName } from "@/lib/data/players-stats";
import type { PlayerRow } from "@/lib/data/players";
import type { Enums } from "@/lib/supabase/database.types";

type AttendanceStatus = Enums<"attendance_status">;

const statusOptions: { value: AttendanceStatus; label: string; tone: string }[] = [
  { value: "Presente", label: "Presente", tone: "border-jaguar-green-500 bg-jaguar-green-50 text-jaguar-green-700" },
  { value: "Tarde", label: "Tarde", tone: "border-jaguar-gold-500 bg-jaguar-gold-500/10 text-jaguar-gold-700" },
  { value: "Justificado", label: "Justificado", tone: "border-jaguar-turquoise-500 bg-jaguar-turquoise-500/10 text-jaguar-turquoise-600" },
  { value: "Ausente", label: "Ausente", tone: "border-jaguar-maroon-500 bg-jaguar-maroon-500/10 text-jaguar-maroon-600" },
];

export function AttendanceForm({
  trainingId,
  players,
  initialAttendance,
}: {
  trainingId: string;
  players: PlayerRow[];
  initialAttendance: Record<string, AttendanceStatus>;
}) {
  const router = useRouter();
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>(() => {
    const base: Record<string, AttendanceStatus> = {};
    players.forEach((p) => {
      base[p.id] = initialAttendance[p.id] ?? "Presente";
    });
    return base;
  });
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const presentCount = Object.values(statuses).filter((s) => s === "Presente").length;

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const records = players.map((p) => ({ playerId: p.id, status: statuses[p.id] ?? "Presente" }));
      const result = await saveAttendance({ kind: "entrenamiento", id: trainingId }, records);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push(`/plataforma/entrenamientos/${trainingId}`);
    });
  }

  return (
    <Card>
      <CardHeader title="Asistencia" subtitle={`${presentCount} de ${players.length} presentes`} />
      <div className="mt-3 divide-y divide-jaguar-ink/6 px-3 pb-4">
        {players.map((player) => {
          const fullName = getFullName(player);
          return (
            <div key={player.id} className="flex flex-wrap items-center gap-3 px-3 py-3">
              <Avatar initials={fullName.slice(0, 2).toUpperCase()} photoUrl={player.photo_url} size={36} />
              <span className="min-w-0 flex-1 truncate text-[13.5px] lg:text-[15px] font-semibold text-jaguar-ink">{fullName}</span>
              <div className="flex flex-wrap gap-1.5">
                {statusOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setStatuses((prev) => ({ ...prev, [player.id]: opt.value }))}
                    className={`rounded-full border px-2.5 py-1 text-[11.5px] lg:text-[12.5px] font-semibold transition-colors ${
                      statuses[player.id] === opt.value ? opt.tone : "border-jaguar-ink/10 text-jaguar-ink/45"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {error ? (
        <p className="mx-4 mb-4 rounded-xl bg-jaguar-maroon-500/8 px-3.5 py-2.5 text-[13px] lg:text-[14px] font-medium text-jaguar-maroon-600">{error}</p>
      ) : null}

      <div className="flex items-center justify-end gap-3 border-t border-jaguar-ink/6 px-6 py-4">
        <button
          type="button"
          onClick={() => router.push(`/plataforma/entrenamientos/${trainingId}`)}
          className="rounded-xl px-4 py-2.5 text-[13.5px] lg:text-[15px] font-semibold text-jaguar-ink/60 hover:bg-jaguar-ink/[0.04]"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="flex items-center gap-2 rounded-xl bg-jaguar-green-600 px-5 py-2.5 text-[13.5px] lg:text-[15px] font-semibold text-white hover:bg-jaguar-green-700 disabled:opacity-60"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} aria-hidden /> : null}
          {isPending ? "Guardando…" : "Guardar asistencia"}
        </button>
      </div>
    </Card>
  );
}
