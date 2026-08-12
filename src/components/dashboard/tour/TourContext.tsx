"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { GuidedTour } from "./GuidedTour";

interface TourContextValue {
  /** Lanza el recorrido guiado desde cualquier punto de la plataforma (ej. botón de ayuda del Header). */
  startTour: () => void;
}

const TourContext = createContext<TourContextValue | null>(null);

export function useTour(): TourContextValue {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("useTour() debe usarse dentro de <TourProvider>");
  return ctx;
}

/**
 * Envuelve el shell de la plataforma (Sidebar + Header + contenido) para que
 * cualquier componente hijo pueda lanzar el recorrido guiado — el botón de
 * ayuda del Header y la bienvenida de primera vez lo usan.
 */
export function TourProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false);

  const startTour = useCallback(() => setIsActive(true), []);
  const endTour = useCallback(() => setIsActive(false), []);

  return (
    <TourContext.Provider value={{ startTour }}>
      {children}
      {isActive ? <GuidedTour onFinish={endTour} /> : null}
    </TourContext.Provider>
  );
}
