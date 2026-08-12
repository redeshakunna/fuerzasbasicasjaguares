import Link from "next/link";
import { FinanceSectionHeader } from "@/components/dashboard/finanzas/shared";
import { ObligationsTable } from "@/components/dashboard/finanzas/ObligationsTable";
import { getObligations, markOverdueObligations } from "@/lib/data/finance";

export const dynamic = "force-dynamic";

/** Cuentas por cobrar — buscador, filtros, recordatorios masivos y acciones sobre cada concepto pendiente o pagado. */
export default async function CuentasPorCobrarPage() {
  // Automatización: pasa a "Vencido" lo que ya venció antes de listar.
  await markOverdueObligations();
  const obligations = await getObligations();

  return (
    <div className="space-y-6">
      <FinanceSectionHeader
        title="Cuentas por cobrar"
        subtitle="Todos los conceptos de cobro de la academia, en un solo lugar."
        action={
          <Link
            href="/plataforma/finanzas/conceptos"
            className="inline-flex items-center gap-1.5 rounded-xl border border-jaguar-ink/10 px-4 py-2.5 text-[13px] lg:text-[14px] font-semibold text-jaguar-ink/70 transition-colors hover:bg-jaguar-ink/[0.03]"
          >
            Conceptos de cobro
          </Link>
        }
      />
      <ObligationsTable obligations={obligations} />
    </div>
  );
}
