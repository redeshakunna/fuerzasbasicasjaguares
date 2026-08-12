"use client";

import { useState, useTransition } from "react";
import { ArrowUpCircle } from "lucide-react";
import { setPromotionReady } from "@/app/plataforma/(dashboard)/jugadores/actions";

interface PromotionToggleProps {
  playerId: string;
  initialReady: boolean;
  nextCategory: string | null;
  editable: boolean;
}

/**
 * Marcado manual (súper admin) de "listo para promoción" a la siguiente
 * categoría formativa. No hay cálculo automático — es una decisión del
 * cuerpo técnico/dirección, este control solo la deja registrada y visible.
 */
export function PromotionToggle({ playerId, initialReady, nextCategory, editable }: PromotionToggleProps) {
  const [ready, setReady] = useState(initialReady);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!nextCategory) return null;
  if (!editable && !ready) return null;

  function toggle() {
    if (!editable || isPending) return;
    const previous = ready;
    setError(null);
    setReady(!ready);
    startTransition(async () => {
      const result = await setPromotionReady(playerId, !previous);
      if (result.error) {
        setReady(previous);
        setError(result.error);
      }
    });
  }

  return (
    <div className="inline-flex items-center gap-1.5">
      <button
        type="button"
        onClick={toggle}
        disabled={!editable || isPending}
        title={editable ? `Marcar listo para ${nextCategory}` : undefined}
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] lg:text-[12px] font-bold uppercase tracking-[0.02em] transition-colors ${
          ready
            ? "border-jaguar-turquoise-500 bg-jaguar-turquoise-500/12 text-jaguar-turquoise-700"
            : "border-jaguar-ink/10 text-jaguar-ink/35 hover:border-jaguar-ink/20"
        } ${editable ? "cursor-pointer" : "cursor-default"}`}
      >
        <ArrowUpCircle className="h-3 w-3" strokeWidth={2.2} aria-hidden />
        {ready ? `Listo para ${nextCategory}` : `Marcar listo para ${nextCategory}`}
      </button>
      {error ? <span className="text-[11px] lg:text-[12px] font-medium text-jaguar-maroon-600">{error}</span> : null}
    </div>
  );
}
