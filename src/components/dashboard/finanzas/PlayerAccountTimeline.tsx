import Link from "next/link";
import { Card } from "../ui/Card";
import { ObligationStatusBadge, conceptIcon, conceptIconClass } from "./shared";
import type { ObligationRow, ObligationStatus } from "@/lib/data/finance";
import { formatCOP, formatLongDate } from "@/lib/finance/format";

const dotClass: Record<ObligationStatus, string> = {
  Pagado: "bg-jaguar-green-600",
  Pendiente: "bg-jaguar-gold-500",
  Vencido: "bg-jaguar-maroon-500",
  Parcial: "bg-jaguar-turquoise-500",
};

/** Historial financiero de un jugador — timeline vertical, no una tabla. */
export function PlayerAccountTimeline({ obligations }: { obligations: ObligationRow[] }) {
  const sorted = [...obligations].sort((a, b) => a.issuedDate.localeCompare(b.issuedDate));

  return (
    <div className="relative space-y-4 pl-2">
      <div className="absolute bottom-4 left-[23px] top-4 w-px bg-jaguar-ink/8" aria-hidden />
      {sorted.map((ob) => {
        const Icon = conceptIcon(ob.concept);
        return (
          <div key={ob.id} className="relative flex gap-4">
            <span
              className={`relative z-10 flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full ring-4 ring-white ${conceptIconClass(ob.concept)}`}
            >
              <Icon className="h-4 w-4" strokeWidth={1.9} aria-hidden />
            </span>
            <Card className="flex-1 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotClass[ob.status]}`} aria-hidden />
                    <p className="text-[13.5px] lg:text-[15px] font-bold text-jaguar-ink">{ob.title}</p>
                  </div>
                  <p className="mt-1 text-[12px] lg:text-[13px] text-jaguar-ink/50">{ob.description}</p>
                  <p className="mt-1.5 text-[11.5px] lg:text-[12.5px] text-jaguar-ink/40">
                    {ob.status === "Pagado" ? `Pagado el ${formatLongDate(ob.paidDate ?? ob.dueDate)}` : `Vence el ${formatLongDate(ob.dueDate)}`}
                    {ob.paymentMethod ? ` · ${ob.paymentMethod}` : ""}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[15px] lg:text-[16.5px] font-extrabold text-jaguar-ink">{formatCOP(ob.amount)}</p>
                  <div className="mt-1.5">
                    <ObligationStatusBadge status={ob.status} />
                  </div>
                </div>
              </div>
              <div className="mt-3 flex justify-end gap-2 border-t border-jaguar-ink/6 pt-3">
                {ob.status === "Pagado" ? (
                  <Link
                    href={`/plataforma/finanzas/recibo?concepto=${ob.id}`}
                    className="rounded-lg border border-jaguar-ink/10 px-3 py-1.5 text-[12px] lg:text-[13px] font-semibold text-jaguar-ink/70 transition-colors hover:bg-jaguar-ink/[0.03]"
                  >
                    Ver recibo
                  </Link>
                ) : (
                  <Link
                    href={`/plataforma/finanzas/registrar-pago?concepto=${ob.id}`}
                    className="rounded-lg bg-jaguar-green-600 px-3.5 py-1.5 text-[12px] lg:text-[13px] font-semibold text-white transition-colors hover:bg-jaguar-green-700"
                  >
                    Registrar pago
                  </Link>
                )}
              </div>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
