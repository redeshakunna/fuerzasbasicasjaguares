import { FinanceSectionHeader } from "@/components/dashboard/finanzas/shared";
import { PaymentsHistoryList } from "@/components/dashboard/finanzas/PaymentsHistoryList";
import { CategorySelector } from "@/components/dashboard/CategorySelector";
import { getObligations } from "@/lib/data/finance";
import { parseCategory } from "@/lib/data/categories";

export const dynamic = "force-dynamic";

interface HistorialPagosPageProps {
  searchParams: Promise<{ categoria?: string }>;
}

/** Historial de pagos — lista limpia de los movimientos registrados de una categoría. */
export default async function HistorialPagosPage({ searchParams }: HistorialPagosPageProps) {
  const { categoria } = await searchParams;
  const category = parseCategory(categoria);

  const obligations = await getObligations(category);
  const paid = obligations.filter((o) => o.status === "Pagado");

  return (
    <div className="space-y-6">
      <FinanceSectionHeader
        title="Historial de pagos"
        subtitle={`Movimientos financieros registrados de ${category}.`}
        action={<CategorySelector active={category} basePath="/plataforma/finanzas/historial" />}
      />
      <PaymentsHistoryList paidObligations={paid} />
    </div>
  );
}
