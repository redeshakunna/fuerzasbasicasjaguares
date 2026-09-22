import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PlanificacionTabs } from "@/components/dashboard/entrenamientos/planificacion/PlanificacionTabs";
import { getTemporadas } from "@/lib/data/academia";
import { getCiclos } from "@/lib/data/ciclos";
import { getMicrociclos } from "@/lib/data/microciclos";
import { getCoachingStaff } from "@/lib/data/staff";
import { getCurrentStaffProfile } from "@/lib/data/player-profile";

export const dynamic = "force-dynamic";

const validTabs = new Set(["temporadas", "ciclos", "microciclos"]);

interface PlanificacionPageProps {
  searchParams: Promise<{ tab?: string; crear?: string }>;
}

/**
 * Planificación deportiva — Temporada → Ciclo → Microciclo. Vive dentro de
 * "Entrenamientos" pero es una capa independiente: no obliga a nada, un
 * entrenamiento suelto sigue funcionando exactamente igual sin pasar por acá.
 */
export default async function PlanificacionPage({ searchParams }: PlanificacionPageProps) {
  const { tab, crear } = await searchParams;
  const initialTab = validTabs.has(tab ?? "") ? (tab as "temporadas" | "ciclos" | "microciclos") : undefined;
  const autoCreate = crear === "1";

  const [temporadas, ciclos, microciclos, staff, currentStaff] = await Promise.all([
    getTemporadas(),
    getCiclos(),
    getMicrociclos(),
    getCoachingStaff(),
    getCurrentStaffProfile(),
  ]);

  const canManageCiclos = Boolean(currentStaff?.isAdmin || currentStaff?.role === "coordinador");
  const canManageMicrociclos = Boolean(
    currentStaff?.isAdmin || currentStaff?.role === "coordinador" || currentStaff?.role === "entrenador",
  );

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/plataforma/entrenamientos"
          className="inline-flex items-center gap-1.5 text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-ink/50 hover:text-jaguar-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
          Entrenamientos
        </Link>
        <h1 className="mt-2 text-[26px] font-extrabold leading-snug text-jaguar-ink lg:text-[30px]">
          <span className="text-jaguar-green-600">Planificación</span>
        </h1>
        <p className="mt-1.5 max-w-xl text-[14px] lg:text-[15.5px] text-jaguar-ink/55">
          Organizá la temporada en ciclos y microciclos. Es opcional — cualquier entrenamiento se puede seguir creando
          suelto, sin pasar por acá.
        </p>
      </div>

      <PlanificacionTabs
        temporadas={temporadas}
        ciclos={ciclos}
        microciclos={microciclos}
        staff={staff}
        canManageCiclos={canManageCiclos}
        canManageMicrociclos={canManageMicrociclos}
        initialTab={initialTab}
        autoCreate={autoCreate}
      />
    </div>
  );
}
