import Link from "next/link";
import { ArrowRight, CalendarClock, Plus, Receipt } from "lucide-react";
import { Card, CardHeader } from "@/components/dashboard/ui/Card";
import { Avatar } from "@/components/dashboard/ui/Avatar";
import { FinanceKpiCards } from "@/components/dashboard/finanzas/FinanceKpiCards";
import { PaymentMethodsDonut } from "@/components/dashboard/finanzas/PaymentMethodsDonut";
import { FinanceSectionHeader, ObligationStatusBadge, conceptIcon, conceptIconClass } from "@/components/dashboard/finanzas/shared";
import {
  ensureCurrentMonthMensualidades,
  getFinanceSummary,
  getObligations,
  getPaymentMethodBreakdown,
  markOverdueObligations,
} from "@/lib/data/finance";
import { formatCOP, formatShortDate } from "@/lib/finance/format";

export const dynamic = "force-dynamic";

/** Dashboard financiero — lo primero que ve la secretaria cada mañana. Datos reales de Supabase. */
export default async function FinanzasDashboardPage() {
  // Automatización: crea la mensualidad del mes si aún no existe — nadie tiene que generarla a mano.
  await ensureCurrentMonthMensualidades();
  // Automatización: pasa a "Vencido" lo que ya venció — base real para el disparo de recordatorios.
  await markOverdueObligations();

  const [summary, breakdown, obligations] = await Promise.all([
    getFinanceSummary(),
    getPaymentMethodBreakdown(),
    getObligations(),
  ]);

  const upcoming = obligations.filter((o) => o.status !== "Pagado").sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const recent = obligations
    .filter((o) => o.status === "Pagado")
    .sort((a, b) => (b.paidDate ?? "").localeCompare(a.paidDate ?? ""));

  return (
    <div className="space-y-6">
      <FinanceSectionHeader
        title="Gestión Financiera"
        subtitle="Cuentas por cobrar, pagos y estado de cuenta de la academia."
        action={
          <Link
            href="/plataforma/finanzas/nuevo-cobro"
            className="inline-flex items-center gap-1.5 rounded-xl bg-jaguar-green-600 px-4 py-2.5 text-[13px] lg:text-[14px] font-semibold text-white transition-colors hover:bg-jaguar-green-700"
          >
            <Plus className="h-4 w-4" strokeWidth={2.25} aria-hidden />
            Nuevo cobro
          </Link>
        }
      />

      <FinanceKpiCards summary={summary} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card className="pb-4">
            <CardHeader
              title="Próximos vencimientos"
              subtitle="Ordenados por fecha límite de pago"
              action={
                <Link
                  href="/plataforma/finanzas/cuentas-por-cobrar"
                  className="flex items-center gap-1 text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-green-600 hover:text-jaguar-green-700"
                >
                  Ver todas <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
                </Link>
              }
            />
            {upcoming.length === 0 ? (
              <div className="flex flex-col items-center px-6 py-10 text-center">
                <CalendarClock className="h-6 w-6 text-jaguar-ink/20" strokeWidth={1.6} aria-hidden />
                <p className="mt-2 text-[12.5px] lg:text-[13.5px] text-jaguar-ink/45">No hay cobros pendientes por ahora.</p>
              </div>
            ) : (
              <div className="mt-2 divide-y divide-jaguar-ink/6 px-3">
                {upcoming.map((ob) => {
                  const Icon = conceptIcon(ob.concept);
                  return (
                    <Link
                      key={ob.id}
                      href={`/plataforma/finanzas/registrar-pago?concepto=${ob.id}`}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-jaguar-mist/50"
                    >
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${conceptIconClass(ob.concept)}`}>
                        <Icon className="h-4 w-4" strokeWidth={1.9} aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] lg:text-[14px] font-semibold text-jaguar-ink">{ob.title}</p>
                        <p className="text-[11.5px] lg:text-[12.5px] text-jaguar-ink/45">
                          {ob.playerName} · vence {formatShortDate(ob.dueDate)}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[13px] lg:text-[14px] font-bold text-jaguar-ink">{formatCOP(ob.amount)}</p>
                        <ObligationStatusBadge status={ob.status} />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </Card>

          <Card className="pb-4">
            <CardHeader
              title="Actividad reciente"
              subtitle="Últimos pagos registrados"
              action={
                <Link
                  href="/plataforma/finanzas/historial"
                  className="flex items-center gap-1 text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-green-600 hover:text-jaguar-green-700"
                >
                  Ver historial <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
                </Link>
              }
            />
            {recent.length === 0 ? (
              <div className="flex flex-col items-center px-6 py-10 text-center">
                <Receipt className="h-6 w-6 text-jaguar-ink/20" strokeWidth={1.6} aria-hidden />
                <p className="mt-2 text-[12.5px] lg:text-[13.5px] text-jaguar-ink/45">Aún no hay pagos registrados.</p>
              </div>
            ) : (
              <div className="mt-2 divide-y divide-jaguar-ink/6 px-3">
                {recent.map((ob) => (
                  <Link
                    key={ob.id}
                    href={`/plataforma/finanzas/recibo?concepto=${ob.id}`}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-jaguar-mist/50"
                  >
                    <Avatar initials={ob.playerInitials} size={36} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] lg:text-[14px] font-semibold text-jaguar-ink">{ob.title}</p>
                      <p className="text-[11.5px] lg:text-[12.5px] text-jaguar-ink/45">
                        {ob.paymentMethod} · {ob.paidDate ? formatShortDate(ob.paidDate) : ""}
                      </p>
                    </div>
                    <p className="shrink-0 text-[13px] lg:text-[14px] font-bold text-jaguar-green-700">{formatCOP(ob.amount)}</p>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <PaymentMethodsDonut breakdown={breakdown} />

          <Card className="p-5">
            <p className="text-[13px] lg:text-[14px] font-bold text-jaguar-ink">Acciones rápidas</p>
            <div className="mt-3 space-y-2">
              <Link
                href="/plataforma/finanzas/registrar-pago"
                className="flex items-center justify-between rounded-xl border border-jaguar-ink/8 px-3.5 py-2.5 text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-ink/75 transition-colors hover:bg-jaguar-mist/50"
              >
                Registrar pago
                <ArrowRight className="h-3.5 w-3.5 text-jaguar-ink/30" strokeWidth={2.25} aria-hidden />
              </Link>
              <Link
                href="/plataforma/finanzas/estado-cuenta"
                className="flex items-center justify-between rounded-xl border border-jaguar-ink/8 px-3.5 py-2.5 text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-ink/75 transition-colors hover:bg-jaguar-mist/50"
              >
                Estado de cuenta
                <ArrowRight className="h-3.5 w-3.5 text-jaguar-ink/30" strokeWidth={2.25} aria-hidden />
              </Link>
              <Link
                href="/plataforma/finanzas/cuentas-por-cobrar"
                className="flex items-center justify-between rounded-xl border border-jaguar-ink/8 px-3.5 py-2.5 text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-ink/75 transition-colors hover:bg-jaguar-mist/50"
              >
                Cuentas por cobrar
                <ArrowRight className="h-3.5 w-3.5 text-jaguar-ink/30" strokeWidth={2.25} aria-hidden />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
