import { Info } from "lucide-react";
import { CategorySelector } from "@/components/dashboard/CategorySelector";
import { InformesHub } from "@/components/dashboard/informes/InformesHub";
import { getPlayers } from "@/lib/data/players";
import { getFullName } from "@/lib/data/players-stats";
import { getReportsStatusForPeriod } from "@/lib/data/reports";
import { getCategoryPhoto, getGroupReports } from "@/lib/data/group-reports";
import { getPrimaryAcademia } from "@/lib/data/academia";
import { getCurrentStaffProfile } from "@/lib/data/player-profile";
import { getPrimaryStaffNames } from "@/lib/data/staff";
import { activeCategories, parseCategory } from "@/lib/data/categories";

export const dynamic = "force-dynamic";

interface InformesPageProps {
  searchParams: Promise<{ categoria?: string }>;
}

/**
 * Centro de generación masiva de Informes de Evolución — complementa (no reemplaza) la pestaña
 * de Informes de cada jugador. Desde aquí el técnico genera de un tiro los informes individuales
 * pendientes de la categoría y el informe grupal del mes, con recordatorio de cadencia configurable.
 */
export default async function InformesPage({ searchParams }: InformesPageProps) {
  const { categoria } = await searchParams;
  const category = parseCategory(categoria);
  const isActiveCategory = activeCategories.includes(category);
  const currentPeriod = new Date().toISOString().slice(0, 7);

  const [roster, academia, groupReports, categoryPhoto, staff, staffNames] = await Promise.all([
    getPlayers(category),
    getPrimaryAcademia(),
    getGroupReports(category),
    getCategoryPhoto(category),
    getCurrentStaffProfile(),
    getPrimaryStaffNames(),
  ]);

  const reportsStatus = await getReportsStatusForPeriod(
    roster.map((p) => p.id),
    currentPeriod,
  );

  const rosterSummary = roster.map((p) => ({
    id: p.id,
    name: getFullName(p),
    photoUrl: p.photo_url,
    initials: `${p.first_name[0] ?? ""}${p.last_name[0] ?? ""}`.toUpperCase(),
    guardianEmail: p.guardian_email,
    reportStatus: reportsStatus.get(p.id)?.status ?? null,
  }));

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold leading-snug text-jaguar-ink lg:text-[26px]">
              <span className="text-jaguar-green-600">Informes</span> de Evolución
            </h1>
            <p className="mt-1 text-[14px] lg:text-[15.5px] text-jaguar-ink/55">
              Genera y envía los informes individuales y el informe grupal de la categoría.
            </p>
          </div>
          <CategorySelector active={category} basePath="/plataforma/informes" />
        </div>

        {!isActiveCategory ? (
          <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-jaguar-gold-500/10 px-4 py-3 text-[13px] lg:text-[14px] font-medium text-jaguar-gold-700">
            <Info className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
            La categoría {category} aún no tiene plantel activo — los informes llegarán cuando tenga jugadores registrados.
          </div>
        ) : null}
      </div>

      <InformesHub
        category={category}
        currentPeriod={currentPeriod}
        roster={rosterSummary}
        cadence={(academia?.report_cadence as "mensual" | "quincenal") ?? "mensual"}
        groupReports={groupReports}
        categoryPhoto={categoryPhoto}
        isAdmin={staff?.isAdmin ?? false}
        coachName={staffNames.coachName}
        coordinatorName={staffNames.coordinatorName}
      />
    </div>
  );
}
