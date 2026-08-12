"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, ClipboardCheck, MapPin, Sparkles, Wallet } from "lucide-react";
import { markOnboarded } from "@/app/plataforma/(dashboard)/onboarding-actions";
import { useTour } from "./tour/TourContext";
import type { Enums } from "@/lib/supabase/database.types";

type Role = Enums<"user_role">;

const copyByRole: Record<Exclude<Role, "padre">, { greeting: string; tips: string[] }> = {
  entrenador: {
    greeting: "Aquí vas a pasar la mayor parte del tiempo: tu cola de acciones del día.",
    tips: [
      "El Dashboard te muestra asistencia, evaluaciones y convocatorias pendientes de hoy — en ese orden.",
      "Cada jugador tiene una hoja de vida completa: rendimiento, asistencia, informes y estado financiero.",
      "Los informes de evolución se generan solos cada mes — tú solo los revisas antes de compartirlos.",
    ],
  },
  coordinador: {
    greeting: "Tu vista está pensada para seguimiento general, no captura diaria de datos.",
    tips: [
      "Jugadores, Entrenamientos y Partidos te dan el panorama completo de la Sub-15.",
      "Gestión Financiera centraliza cobros y pagos — sin duplicar información en otro lado.",
      "Configuración te deja administrar entrenadores, temporadas y usuarios del staff.",
    ],
  },
  directivo: {
    greeting: "Tu vista está pensada para seguimiento general, no captura diaria de datos.",
    tips: [
      "El Dashboard resume el estado del día: asistencia, evaluaciones, convocatorias y cobros.",
      "Gestión Financiera muestra cuentas por cobrar, recaudo y vencidos en tiempo real.",
      "Configuración te deja administrar entrenadores, temporadas y usuarios del staff.",
    ],
  },
  admin: {
    greeting: "Tienes acceso completo a la plataforma, incluida la configuración de la academia.",
    tips: [
      "Configuración es tuya: categorías, temporadas, entrenadores y permisos de usuarios.",
      "Solo el rol admin puede editar la información sensible de un jugador desde su perfil.",
      "Gestión Financiera y los informes de evolución funcionan solos — revísalos, no los generes a mano.",
    ],
  },
};

/**
 * Bienvenida guiada — una sola vez por usuario, adaptada a su rol. Al
 * cerrarla se marca `onboarded_at` (no vuelve a aparecer sola) y se ofrece
 * encadenar el recorrido guiado con tooltips por el menú y el Dashboard.
 */
export function OnboardingWelcome({ fullName, role }: { fullName: string; role: Exclude<Role, "padre"> }) {
  const [stage, setStage] = useState<"welcome" | "offer" | "closed">("welcome");
  const [isPending, startTransition] = useTransition();
  const { startTour } = useTour();
  const content = copyByRole[role];
  const firstName = fullName.trim().split(/\s+/)[0] ?? fullName;

  function continueToOffer() {
    setStage("offer");
    startTransition(() => {
      markOnboarded();
    });
  }

  function acceptTour() {
    setStage("closed");
    startTour();
  }

  function declineTour() {
    setStage("closed");
  }

  if (stage === "closed") return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-jaguar-ink/40 p-4 backdrop-blur-sm">
      {stage === "welcome" ? (
        <div className="w-full max-w-[440px] rounded-[18px] bg-white p-7 shadow-2xl">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-jaguar-green-500/10 text-jaguar-green-600">
            <Sparkles className="h-5 w-5" strokeWidth={2} aria-hidden />
          </span>
          <h2 className="mt-4 text-[18px] lg:text-[20px] font-extrabold text-jaguar-ink">Bienvenido, {firstName}</h2>
          <p className="mt-1 text-[13px] lg:text-[14px] text-jaguar-ink/55">{content.greeting}</p>

          <div className="mt-5 space-y-3">
            {content.tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-jaguar-mist text-jaguar-ink/40">
                  {i === 0 ? (
                    <ClipboardCheck className="h-3 w-3" strokeWidth={2} aria-hidden />
                  ) : i === 1 ? (
                    <Wallet className="h-3 w-3" strokeWidth={2} aria-hidden />
                  ) : (
                    <CheckCircle2 className="h-3 w-3" strokeWidth={2} aria-hidden />
                  )}
                </span>
                <p className="text-[13px] lg:text-[14px] leading-relaxed text-jaguar-ink/70">{tip}</p>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={continueToOffer}
            disabled={isPending}
            className="mt-6 w-full rounded-xl bg-jaguar-green-600 py-3 text-[13.5px] lg:text-[15px] font-semibold text-white transition-colors hover:bg-jaguar-green-700 disabled:opacity-60"
          >
            Comenzar
          </button>
        </div>
      ) : (
        <div className="w-full max-w-[400px] rounded-[18px] bg-white p-7 text-center shadow-2xl">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-jaguar-turquoise-500/10 text-jaguar-turquoise-600">
            <MapPin className="h-5 w-5" strokeWidth={2} aria-hidden />
          </span>
          <h2 className="mt-4 text-[16.5px] lg:text-[18px] font-extrabold text-jaguar-ink">
            ¿Quieres un recorrido guiado por el menú?
          </h2>
          <p className="mt-1.5 text-[13px] lg:text-[14px] leading-relaxed text-jaguar-ink/55">
            Te mostramos, paso a paso, qué hace cada opción del panel — toma menos de un minuto y puedes repetirlo
            cuando quieras desde el botón de ayuda.
          </p>

          <div className="mt-6 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={acceptTour}
              className="w-full rounded-xl bg-jaguar-green-600 py-3 text-[13.5px] lg:text-[15px] font-semibold text-white transition-colors hover:bg-jaguar-green-700"
            >
              Sí, mostrarme
            </button>
            <button
              type="button"
              onClick={declineTour}
              className="w-full rounded-xl py-2.5 text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-ink/45 transition-colors hover:text-jaguar-ink/70"
            >
              Ahora no
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
