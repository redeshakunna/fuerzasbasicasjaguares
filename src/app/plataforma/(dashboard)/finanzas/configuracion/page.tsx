import { FinanceSectionHeader } from "@/components/dashboard/finanzas/shared";
import { FinanceSettingsTabs } from "@/components/dashboard/finanzas/FinanceSettingsTabs";
import { getConcepts } from "@/lib/data/finance";

export const dynamic = "force-dynamic";

/** Configuración financiera — solo interfaz, preparada para futuras reglas de negocio. */
export default async function FinanzasConfiguracionPage() {
  const concepts = await getConcepts();

  return (
    <div className="space-y-6">
      <FinanceSectionHeader title="Configuración" subtitle="Valores, categorías, métodos de pago y políticas de cobro." />
      <FinanceSettingsTabs conceptsCount={concepts.length} />
    </div>
  );
}
