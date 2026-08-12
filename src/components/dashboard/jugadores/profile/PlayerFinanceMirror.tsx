import Link from "next/link";
import { ArrowRight, Wallet } from "lucide-react";
import { Card, CardHeader } from "../../ui/Card";
import { PlayerAccountTimeline } from "../../finanzas/PlayerAccountTimeline";
import { getObligations } from "@/lib/data/finance";
import { formatCOP } from "@/lib/finance/format";

/**
 * Espejo de solo lectura del estado financiero del jugador — Gestión Financiera
 * es la única fuente de verdad; esta pestaña nunca captura pagos.
 */
export async function PlayerFinanceMirror({ playerId }: { playerId: string }) {
  const all = await getObligations();
  const obligations = all.filter((o) => o.playerId === playerId);

  if (obligations.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-2 px-6 py-16 text-center">
        <Wallet className="h-6 w-6 text-jaguar-ink/20" strokeWidth={1.6} aria-hidden />
        <p className="text-[13.5px] lg:text-[15px] font-bold text-jaguar-ink">Aún no hay información financiera para este jugador.</p>
        <p className="max-w-md text-[13px] lg:text-[14px] text-jaguar-ink/45">
          Los cargos y pagos que se registren en Gestión Financiera aparecerán aquí automáticamente.
        </p>
      </Card>
    );
  }

  const totalRecaudado = obligations.filter((o) => o.status === "Pagado").reduce((s, o) => s + o.amount, 0);
  const totalPorCobrar = obligations.filter((o) => o.status !== "Pagado").reduce((s, o) => s + o.amount, 0);

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-6">
            <div>
              <p className="text-[11px] lg:text-[12px] font-bold uppercase tracking-[0.03em] text-jaguar-ink/40">Pagado</p>
              <p className="mt-1 text-[17px] lg:text-[18.5px] font-extrabold text-jaguar-green-700">{formatCOP(totalRecaudado)}</p>
            </div>
            <div>
              <p className="text-[11px] lg:text-[12px] font-bold uppercase tracking-[0.03em] text-jaguar-ink/40">Pendiente</p>
              <p className="mt-1 text-[17px] lg:text-[18.5px] font-extrabold text-jaguar-gold-600">{formatCOP(totalPorCobrar)}</p>
            </div>
          </div>
          <Link
            href="/plataforma/finanzas/estado-cuenta"
            className="flex items-center gap-1 text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-green-600 hover:text-jaguar-green-700"
          >
            Gestionar en Finanzas <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
          </Link>
        </div>
      </Card>

      <Card className="p-5">
        <CardHeader title="Historial financiero" subtitle="Solo lectura — los pagos se registran desde Gestión Financiera" />
        <div className="mt-4">
          <PlayerAccountTimeline obligations={obligations} />
        </div>
      </Card>
    </div>
  );
}
