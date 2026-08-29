import Link from "next/link";
import type { Metadata } from "next";
import { ShieldAlert } from "lucide-react";
import { getCurrentStaffProfile } from "@/lib/data/player-profile";
import { getRegistrationRequests } from "@/lib/data/registration-requests";
import { SolicitudCard } from "./SolicitudCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Solicitudes de inscripción — Plataforma Jaguares",
};

const tabs = [
  { id: "Pendiente", label: "Pendientes" },
  { id: "Aprobado", label: "Aprobadas" },
  { id: "Rechazado", label: "Rechazadas" },
] as const;

type EstadoTab = (typeof tabs)[number]["id"];

function parseEstado(value: string | undefined): EstadoTab {
  return tabs.some((t) => t.id === value) ? (value as EstadoTab) : "Pendiente";
}

interface SolicitudesPageProps {
  searchParams: Promise<{ estado?: string }>;
}

/**
 * Bandeja de revisión de solicitudes públicas de inscripción (Sub-15).
 * Solo técnico, coordinador o admin pueden ver/aprobar/rechazar — el resto
 * del staff (directivo, padre) no tiene acceso a datos de solicitudes sin
 * revisar todavía.
 */
export default async function SolicitudesPage({ searchParams }: SolicitudesPageProps) {
  const { estado } = await searchParams;
  const activeTab = parseEstado(estado);

  const staff = await getCurrentStaffProfile();
  const canReview = !!staff && (staff.role === "entrenador" || staff.role === "coordinador" || staff.isAdmin);

  if (!canReview) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[18px] border border-jaguar-ink/8 bg-white px-6 py-16 text-center shadow-[0_1px_2px_rgba(13,18,16,0.04)]">
        <ShieldAlert className="h-8 w-8 text-jaguar-ink/25" strokeWidth={1.6} aria-hidden />
        <p className="mt-3 text-[14px] lg:text-[15px] font-semibold text-jaguar-ink/70">
          Solo el técnico, el coordinador o el admin pueden revisar solicitudes de inscripción.
        </p>
      </div>
    );
  }

  const requests = await getRegistrationRequests(activeTab);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[18px] lg:text-[20px] font-extrabold text-jaguar-ink">Solicitudes de inscripción</h1>
        <p className="mt-1 text-[13px] lg:text-[14px] text-jaguar-ink/50">
          Jugadores y acudientes de Sub-15 que se inscribieron desde el link público — revisa y aprueba antes de que
          entren al plantel.
        </p>
      </div>

      <div className="flex items-center gap-1.5 border-b border-jaguar-ink/8">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={`/plataforma/jugadores/solicitudes?estado=${tab.id}`}
            className={`rounded-t-lg px-4 py-2.5 text-[13px] lg:text-[14px] font-semibold transition-colors ${
              activeTab === tab.id
                ? "border-b-2 border-jaguar-green-600 text-jaguar-green-600"
                : "text-jaguar-ink/45 hover:text-jaguar-ink"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {requests.length === 0 ? (
        <div className="rounded-[18px] border border-dashed border-jaguar-ink/12 bg-white/60 px-6 py-14 text-center text-[13.5px] lg:text-[14.5px] text-jaguar-ink/45">
          No hay solicitudes {activeTab === "Pendiente" ? "pendientes" : activeTab === "Aprobado" ? "aprobadas" : "rechazadas"}
          {" "}por ahora.
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => (
            <SolicitudCard key={request.id} request={request} reviewable={activeTab === "Pendiente"} />
          ))}
        </div>
      )}
    </div>
  );
}
