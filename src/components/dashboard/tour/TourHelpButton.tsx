"use client";

import { HelpCircle } from "lucide-react";
import { useTour } from "./TourContext";

/** Botón de ayuda fijo en el Header — repite el recorrido guiado cuando quieras. */
export function TourHelpButton() {
  const { startTour } = useTour();

  return (
    <button
      type="button"
      onClick={startTour}
      aria-label="Ver recorrido guiado de la plataforma"
      title="Ver recorrido guiado"
      className="flex h-10 w-10 items-center justify-center rounded-xl text-jaguar-ink/60 transition-colors hover:bg-jaguar-ink/[0.04]"
    >
      <HelpCircle className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
    </button>
  );
}
