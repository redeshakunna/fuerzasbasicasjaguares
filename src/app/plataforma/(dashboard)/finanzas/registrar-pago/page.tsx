import { FinanceSectionHeader } from "@/components/dashboard/finanzas/shared";
import { RegistrarPagoForm } from "@/components/dashboard/finanzas/RegistrarPagoForm";
import { getObligations } from "@/lib/data/finance";

export const dynamic = "force-dynamic";

interface RegistrarPagoPageProps {
  searchParams: Promise<{ concepto?: string }>;
}

/** Registrar pago — el formulario más usado del módulo. Escribe directo a Supabase. */
export default async function RegistrarPagoPage({ searchParams }: RegistrarPagoPageProps) {
  const { concepto } = await searchParams;
  const obligations = await getObligations();
  const pending = obligations.filter((o) => o.status !== "Pagado");

  return (
    <div className="space-y-6">
      <FinanceSectionHeader title="Registrar pago" subtitle="Confirma un pago recibido en menos de un minuto." />
      <div className="mx-auto max-w-lg">
        <RegistrarPagoForm pendingObligations={pending} initialObligationId={concepto} />
      </div>
    </div>
  );
}
