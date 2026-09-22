"use client";

import { useState, useTransition } from "react";
import { setAssignedCoach } from "@/app/plataforma/(dashboard)/jugadores/actions";

export interface AssignableCoach {
  id: string;
  fullName: string;
}

interface AssignedCoachSelectProps {
  playerId: string;
  initialCoachId: string | null;
  coaches: AssignableCoach[];
  editable: boolean;
}

/**
 * Selector "Entrenador asignado" — reemplaza a la antigua Categoría A/B.
 * Es un dato neutral (a qué entrenador reporta este jugador), no un nivel
 * de desempeño: no hay jerarquía entre los entrenadores de la lista.
 * Guarda al instante (optimista, revierte si el servidor rechaza el cambio).
 */
export function AssignedCoachSelect({ playerId, initialCoachId, coaches, editable }: AssignedCoachSelectProps) {
  const [coachId, setCoachId] = useState<string | null>(initialCoachId);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const currentName = coaches.find((c) => c.id === coachId)?.fullName ?? null;

  if (!editable && !currentName) return null;

  function choose(nextId: string) {
    if (!editable || isPending) return;
    const next = nextId || null;
    if (next === coachId) return;
    const previous = coachId;
    setError(null);
    setCoachId(next);
    startTransition(async () => {
      const result = await setAssignedCoach(playerId, next);
      if (result.error) {
        setCoachId(previous);
        setError(result.error);
      }
    });
  }

  if (!editable) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-jaguar-ink/10 bg-white px-3 py-1 text-[12px] lg:text-[13px] font-bold text-jaguar-ink/70">
        {currentName}
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-2">
      <span className="text-[10.5px] lg:text-[11.5px] font-semibold uppercase tracking-[0.03em] text-jaguar-ink/40">Entrenador</span>
      <select
        value={coachId ?? ""}
        onChange={(e) => choose(e.target.value)}
        disabled={isPending}
        className="rounded-full border border-jaguar-ink/10 bg-white px-3 py-1 text-[12px] lg:text-[13px] font-bold text-jaguar-ink/70 focus:border-jaguar-green-500/40 focus:outline-none"
      >
        <option value="">Sin asignar</option>
        {coaches.map((c) => (
          <option key={c.id} value={c.id}>
            {c.fullName}
          </option>
        ))}
      </select>
      {error ? <span className="text-[11px] lg:text-[12px] font-medium text-jaguar-maroon-600">{error}</span> : null}
    </div>
  );
}
