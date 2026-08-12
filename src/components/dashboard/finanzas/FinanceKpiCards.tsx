import type { ComponentType } from "react";
import { AlertTriangle, Banknote, Clock3, Wallet } from "lucide-react";
import { Card } from "../ui/Card";
import type { FinanceSummary } from "@/lib/data/finance";
import { formatCOP } from "@/lib/finance/format";

function KpiCard({
  icon: Icon,
  iconClass,
  label,
  value,
  hint,
}: {
  icon: ComponentType<{ className?: string; strokeWidth?: number; "aria-hidden"?: boolean }>;
  iconClass: string;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Card className="p-4">
      <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconClass}`}>
        <Icon className="h-4.5 w-4.5" strokeWidth={1.9} aria-hidden />
      </span>
      <p className="mt-3 text-[22px] lg:text-[24px] font-extrabold text-jaguar-ink">{value}</p>
      <p className="mt-0.5 text-[12px] lg:text-[13px] font-medium text-jaguar-ink/50">{label}</p>
      <p className="mt-1 text-[11px] lg:text-[12px] text-jaguar-ink/35">{hint}</p>
    </Card>
  );
}

/** KPIs financieros — 4 tarjetas, la vista que la secretaria mira primero cada día. */
export function FinanceKpiCards({ summary }: { summary: FinanceSummary }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <KpiCard
        icon={Wallet}
        iconClass="bg-jaguar-gold-500/15 text-jaguar-gold-600"
        label="Total por cobrar"
        value={formatCOP(summary.totalPorCobrar)}
        hint={`${summary.pendientesCount} concepto${summary.pendientesCount === 1 ? "" : "s"} pendiente${summary.pendientesCount === 1 ? "" : "s"}`}
      />
      <KpiCard
        icon={Banknote}
        iconClass="bg-jaguar-green-50 text-jaguar-green-600"
        label="Total recaudado"
        value={formatCOP(summary.totalRecaudado)}
        hint="Temporada 2026"
      />
      <KpiCard
        icon={Clock3}
        iconClass="bg-jaguar-turquoise-500/10 text-jaguar-turquoise-600"
        label="Pagos pendientes"
        value={String(summary.pendientesCount)}
        hint="Próximos a vencer"
      />
      <KpiCard
        icon={AlertTriangle}
        iconClass="bg-jaguar-maroon-500/10 text-jaguar-maroon-600"
        label="Vencidos"
        value={String(summary.vencidosCount)}
        hint={summary.vencidosCount === 0 ? "Todo al día" : formatCOP(summary.vencidosAmount)}
      />
    </div>
  );
}
