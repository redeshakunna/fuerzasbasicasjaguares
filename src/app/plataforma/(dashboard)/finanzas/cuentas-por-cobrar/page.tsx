import Link from "next/link";
import { FinanceSectionHeader } from "@/components/dashboard/finanzas/shared";
import { ObligationsTable } from "@/components/dashboard/finanzas/ObligationsTable";
import { CategorySelector } from "@/components/dashboard/CategorySelector";
import { getObligations, markOverdueObligations } from "@/lib/data/finance";
import { parseCategory } from "@/lib/data/categories";

export const dynamic = "force-dynamic";

interface CuentasPorCobrarPageProps {
  searchParams: Promise<{ categoria?: string }>;
}

/** Cuentas por cobrar — buscador, filtros, recordatorios masivos y acciones sobre cada concepto pendiente o pagado, por categoría. */
export default async function CuentasPorCobrarPage({ searchParams }: CuentasPorCobrarPageProps) {
  const { categoria } = await searchParams;
  const category = parseCategory(categoria);

  // Automatización: pasa a "Vencido" lo que ya venció antes de listar.
  await markOverdueObligations();
  const obligations = await getObligations(category);

  return (
    <div className="space-y-6">
      <FinanceSectionHeader
        title="Cuentas por cobrar"
        subtitle={`Conceptos de cobro de ${category}, en un solo lugar.`}
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            <CategorySelector active={category} basePath="/plataforma/finanzas/cuentas-por-cobrar" />
            <Link
              href="/plataforma/finanzas/conceptos"
              className="inline-flex items-center gap-1.5 rounded-xl border border-jaguar-ink/10 px-4 py-2.5 text-[13px] lg:text-[14px] font-semibold text-jaguar-ink/70 transition-colors hover:bg-jaguar-ink/[0.03]"
            >
              Conceptos de cobro
            </Link>
          </div>
        }
      />
      <ObligationsTable obligations={obligations} />
    </div>
  );
}
