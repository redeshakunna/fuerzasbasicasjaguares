import { ConfiguracionTabs } from "@/components/dashboard/configuracion/ConfiguracionTabs";
import { getCurrentStaffProfile } from "@/lib/data/player-profile";
import { getPrimaryAcademia, getTemporadas } from "@/lib/data/academia";
import { getCoachingStaff } from "@/lib/data/staff";

export const dynamic = "force-dynamic";

/** Configuración — alcance MVP: Organización, Categorías, Temporadas, Entrenadores, Usuarios y Permisos. */
export default async function ConfiguracionPage() {
  const [academia, temporadas, staff, currentStaff] = await Promise.all([
    getPrimaryAcademia(),
    getTemporadas(),
    getCoachingStaff(),
    getCurrentStaffProfile(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[26px] font-extrabold leading-snug text-jaguar-ink lg:text-[30px]">
          <span className="text-jaguar-green-600">Configuración</span>
        </h1>
        <p className="mt-1.5 max-w-md text-[14px] lg:text-[15.5px] text-jaguar-ink/55">Organización, categorías, temporadas, staff y permisos.</p>
      </div>
      <ConfiguracionTabs academia={academia} temporadas={temporadas} staff={staff} isAdmin={currentStaff?.isAdmin ?? false} />
    </div>
  );
}
