import { FinanceSectionHeader } from "@/components/dashboard/finanzas/shared";
import { PaymentsHistoryList } from "@/components/dashboard/finanzas/PaymentsHistoryList";
import { getObligations } from "@/lib/data/finance";

export const dynamic = "force-dynamic";

/** Historial de pagos — lista limpia de todos los movimientos registrados. */
export default async function HistorialPagosPage() {
  const obligations = await getObligations();
  const paid = obligations.filter((o) => o.status === "Pagado");

  return (
    <div className="space-y-6">
      <FinanceSectionHeader title="Historial de pagos" subtitle="Todos los movimientos financieros registrados." />
      <PaymentsHistoryList paidObligations={paid} />
    </div>
  );
}
