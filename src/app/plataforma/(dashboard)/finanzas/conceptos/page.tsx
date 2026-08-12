import { FinanceSectionHeader } from "@/components/dashboard/finanzas/shared";
import { ConceptsGrid } from "@/components/dashboard/finanzas/ConceptsGrid";
import { getConcepts } from "@/lib/data/finance";

export const dynamic = "force-dynamic";

/** Conceptos de cobro — catálogo real de tipos de cobro que ofrece la academia. */
export default async function ConceptosPage() {
  const concepts = await getConcepts();

  return (
    <div className="space-y-6">
      <FinanceSectionHeader title="Conceptos de cobro" subtitle="El catálogo de cobros que usa toda la academia." />
      <ConceptsGrid concepts={concepts} />
    </div>
  );
}
