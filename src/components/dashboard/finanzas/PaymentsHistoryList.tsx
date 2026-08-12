"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Receipt, Search } from "lucide-react";
import { Avatar } from "../ui/Avatar";
import { conceptIcon, conceptIconClass } from "./shared";
import type { ObligationRow } from "@/lib/data/finance";
import { formatCOP, formatShortDate } from "@/lib/finance/format";

/** Historial de pagos — lista limpia, pocas columnas, con búsqueda simple. */
export function PaymentsHistoryList({ paidObligations }: { paidObligations: ObligationRow[] }) {
  const [query, setQuery] = useState("");

  const sorted = useMemo(
    () => [...paidObligations].sort((a, b) => (b.paidDate ?? "").localeCompare(a.paidDate ?? "")),
    [paidObligations],
  );

  const filtered = useMemo(() => {
    if (query.trim().length === 0) return sorted;
    const q = query.trim().toLowerCase();
    return sorted.filter((ob) => `${ob.title} ${ob.paymentMethod} ${ob.receiptNumber} ${ob.playerName}`.toLowerCase().includes(q));
  }, [sorted, query]);

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-jaguar-ink/35" strokeWidth={1.8} aria-hidden />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por concepto, método o recibo…"
          className="w-full rounded-xl border border-jaguar-ink/10 bg-jaguar-mist/50 py-2.5 pl-10 pr-4 text-[13.5px] lg:text-[15px] text-jaguar-ink placeholder:text-jaguar-ink/35 focus:border-jaguar-green-500/40 focus:outline-none focus:ring-2 focus:ring-jaguar-green-500/10"
        />
      </div>

      <div className="overflow-hidden rounded-[18px] border border-jaguar-ink/8 bg-white shadow-[0_1px_2px_rgba(13,18,16,0.04)]">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <Receipt className="h-7 w-7 text-jaguar-ink/20" strokeWidth={1.6} aria-hidden />
            <p className="mt-2 text-[13px] lg:text-[14px] font-semibold text-jaguar-ink/50">Sin resultados.</p>
          </div>
        ) : (
          <div className="divide-y divide-jaguar-ink/6 px-3 py-3">
            {filtered.map((ob) => {
              const Icon = conceptIcon(ob.concept);
              return (
                <Link
                  key={ob.id}
                  href={`/plataforma/finanzas/recibo?concepto=${ob.id}`}
                  className="flex flex-wrap items-center gap-4 rounded-xl px-3 py-3.5 transition-colors hover:bg-jaguar-mist/40"
                >
                  <Avatar initials={ob.playerInitials} size={36} />
                  <div className="min-w-[150px] flex-1">
                    <p className="text-[13px] lg:text-[14px] font-semibold text-jaguar-ink">{ob.playerName}</p>
                    <p className="text-[11.5px] lg:text-[12.5px] text-jaguar-ink/45">{ob.receiptNumber}</p>
                  </div>
                  <div className="flex min-w-[150px] items-center gap-2">
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${conceptIconClass(ob.concept)}`}>
                      <Icon className="h-3.5 w-3.5" strokeWidth={1.9} aria-hidden />
                    </span>
                    <p className="text-[12.5px] lg:text-[13.5px] font-medium text-jaguar-ink/75">{ob.title}</p>
                  </div>
                  <p className="min-w-[110px] text-[12.5px] lg:text-[13.5px] text-jaguar-ink/50">{ob.paymentMethod}</p>
                  <p className="min-w-[100px] text-[12.5px] lg:text-[13.5px] text-jaguar-ink/50">{formatShortDate(ob.paidDate ?? ob.dueDate)}</p>
                  <p className="ml-auto shrink-0 text-[13.5px] lg:text-[15px] font-bold text-jaguar-ink">{formatCOP(ob.amount)}</p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
