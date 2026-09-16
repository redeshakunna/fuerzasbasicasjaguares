import { FinanceSectionHeader } from "@/components/dashboard/finanzas/shared";
import { FinanceSettingsTabs } from "@/components/dashboard/finanzas/FinanceSettingsTabs";
import { getCategoryFees, getConcepts, getFinanceSettings } from "@/lib/data/finance";

export const dynamic = "force-dynamic";

/** Configuración financiera — mensualidades, categorías, métodos de pago y políticas de cobro conectados a Supabase. */
export default async function FinanzasConfiguracionPage() {
  const [concepts, settings, categoryFees] = await Promise.all([getConcepts(), getFinanceSettings(), getCategoryFees()]);

  return (
    <div className="space-y-6">
      <FinanceSectionHeader title="Configuración" subtitle="Valores, categorías, métodos de pago y políticas de cobro." />
      <FinanceSettingsTabs conceptsCount={concepts.length} settings={settings} categoryFees={categoryFees} />
    </div>
  );
}
