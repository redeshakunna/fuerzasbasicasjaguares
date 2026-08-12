"use client";

import { useState, type ReactNode } from "react";
import { ClipboardCheck, FileText, Info, Sparkles, Wallet } from "lucide-react";

const tabs = [
  { id: "general", label: "General", icon: Info },
  { id: "evaluaciones", label: "Evaluaciones", icon: ClipboardCheck },
  { id: "documentos", label: "Documentos", icon: FileText },
  { id: "informes", label: "Informes", icon: Sparkles },
  { id: "financiero", label: "Financiero", icon: Wallet },
] as const;

type TabId = (typeof tabs)[number]["id"];

/**
 * Cinco pestañas — no diez. General (resumen ya integrado con historial de
 * partidos/asistencia), Evaluaciones (historial completo), Documentos,
 * Informes (el informe mensual de evolución) y Financiero (espejo de solo
 * lectura de Gestión Financiera — nunca un segundo punto de captura de pagos).
 */
export function ProfileTabs({
  generalContent,
  evaluacionesContent,
  documentosContent,
  financieroContent,
  informesContent,
}: {
  generalContent: ReactNode;
  evaluacionesContent: ReactNode;
  documentosContent: ReactNode;
  financieroContent: ReactNode;
  informesContent: ReactNode;
}) {
  const [active, setActive] = useState<TabId>("general");

  return (
    <div>
      <div className="scrollbar-none flex gap-1 overflow-x-auto rounded-xl bg-jaguar-mist/60 p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-[12.5px] lg:text-[13.5px] font-semibold transition-colors ${
                active === tab.id
                  ? "bg-white text-jaguar-green-700 shadow-sm"
                  : "text-jaguar-ink/50 hover:text-jaguar-ink"
              }`}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mt-5">
        {active === "general" ? generalContent : null}
        {active === "evaluaciones" ? evaluacionesContent : null}
        {active === "documentos" ? documentosContent : null}
        {active === "financiero" ? financieroContent : null}
        {active === "informes" ? informesContent : null}
      </div>
    </div>
  );
}
