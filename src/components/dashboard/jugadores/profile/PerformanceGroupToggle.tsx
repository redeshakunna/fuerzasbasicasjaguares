"use client";

import { useState, useTransition } from "react";
import { setPerformanceGroup } from "@/app/plataforma/(dashboard)/jugadores/actions";

interface PerformanceGroupToggleProps {
  playerId: string;
  initialGroup: string | null;
  editable: boolean;
}

/**
 * Selector rápido A/B — el técnico (o el súper admin) marca en cuál
 * categoría de desempeño está el jugador ahora mismo. A = mejor desempeño
 * actual, B = le sigue en el escalafón. Guarda al instante (optimista,
 * revierte si el servidor rechaza el cambio).
 */
export function PerformanceGroupToggle({ playerId, initialGroup, editable }: PerformanceGroupToggleProps) {
  const [group, setGroup] = useState<string | null>(initialGroup);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!editable && !group) return null;

  function choose(next: "A" | "B") {
    if (!editable || isPending || next === group) return;
    const previous = group;
    setError(null);
    setGroup(next);
    startTransition(async () => {
      const result = await setPerformanceGroup(playerId, next);
      if (result.error) {
        setGroup(previous);
        setError(result.error);
      }
    });
  }

  return (
    <div className="inline-flex items-center gap-2">
      <span className="text-[10.5px] lg:text-[11.5px] font-semibold uppercase tracking-[0.03em] text-jaguar-ink/40">Categoría</span>
      <div className="inline-flex overflow-hidden rounded-full border border-jaguar-ink/10">
        {(["A", "B"] as const).map((option) => (
          <button
            key={option}
            type="button"
            disabled={!editable || isPending}
            onClick={() => choose(option)}
            title={editable ? `Marcar como categoría ${option}` : undefined}
            className={`px-3 py-1 text-[12px] lg:text-[13px] font-bold transition-colors ${
              group === option ? "bg-jaguar-green-600 text-white" : "bg-white text-jaguar-ink/50 hover:bg-jaguar-mist/60"
            } ${editable ? "cursor-pointer" : "cursor-default"}`}
          >
            {option}
          </button>
        ))}
      </div>
      {error ? <span className="text-[11px] lg:text-[12px] font-medium text-jaguar-maroon-600">{error}</span> : null}
    </div>
  );
}
