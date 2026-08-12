import { FinanceSectionHeader } from "@/components/dashboard/finanzas/shared";
import { NuevoCobroWizard } from "@/components/dashboard/finanzas/NuevoCobroWizard";
import { getConcepts } from "@/lib/data/finance";
import { getPlayers } from "@/lib/data/players";

export const dynamic = "force-dynamic";

/**
 * Nuevo cobro — wizard visual de 4 pasos que crea un concepto de cobro real.
 * Alcance reducido (Bloque 8): los conceptos recurrentes (Mensualidad) no
 * aparecen aquí — se generan solos cada mes (ver ensureCurrentMonthMensualidades
 * en finance.ts). Crearlos a mano desde el wizard duplicaría la automatización.
 */
export default async function NuevoCobroPage() {
  const [allConcepts, players] = await Promise.all([getConcepts(), getPlayers()]);
  const concepts = allConcepts.filter((c) => !c.isRecurring);

  const playerOptions = players.map((p) => ({
    id: p.id,
    name: `${p.first_name} ${p.last_name}`,
    initials: `${p.first_name[0] ?? ""}${p.last_name[0] ?? ""}`.toUpperCase(),
    category: p.category,
    jerseyNumber: p.jersey_number,
  }));

  return (
    <div className="space-y-6">
      <FinanceSectionHeader title="Nuevo cobro" subtitle="Genera un nuevo concepto de cobro en 4 pasos." />
      <div className="mx-auto max-w-2xl">
        <NuevoCobroWizard concepts={concepts} players={playerOptions} />
      </div>
    </div>
  );
}
