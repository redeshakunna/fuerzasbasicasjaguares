"use client";

import { Copy, PenLine, Plus, Trash2 } from "lucide-react";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { conceptIcon, conceptIconClass } from "./shared";
import type { ConceptRow } from "@/lib/data/finance";
import { formatCOP } from "@/lib/finance/format";

/** Conceptos de cobro — tarjetas con acciones de edición inertes (el catálogo en sí es real). */
export function ConceptsGrid({ concepts }: { concepts: ConceptRow[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {concepts.map((c) => {
        const Icon = conceptIcon(c.name);
        return (
          <Card key={c.id} className="p-5">
            <div className="flex items-start justify-between">
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${conceptIconClass(c.name)}`}>
                <Icon className="h-4.5 w-4.5" strokeWidth={1.9} aria-hidden />
              </span>
              <Badge tone={c.status === "Activo" ? "green" : "neutral"}>{c.status}</Badge>
            </div>
            <p className="mt-3 text-[14.5px] lg:text-[16px] font-bold text-jaguar-ink">{c.name}</p>
            <p className="mt-1 text-[12.5px] lg:text-[13.5px] leading-relaxed text-jaguar-ink/50">{c.description}</p>
            <div className="mt-3 flex items-center justify-between border-t border-jaguar-ink/6 pt-3">
              <p className="text-[12px] lg:text-[13px] text-jaguar-ink/40">Valor sugerido</p>
              <p className="text-[13.5px] lg:text-[15px] font-bold text-jaguar-ink">{c.suggestedAmount > 0 ? formatCOP(c.suggestedAmount) : "Variable"}</p>
            </div>
            <div className="mt-4 flex items-center gap-1.5">
              <button
                type="button"
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-jaguar-ink/10 px-3 py-1.5 text-[12px] lg:text-[13px] font-semibold text-jaguar-ink/70 transition-colors hover:bg-jaguar-ink/[0.03]"
              >
                <PenLine className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                Editar
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg border border-jaguar-ink/10 p-1.5 text-jaguar-ink/50 transition-colors hover:bg-jaguar-ink/[0.03]"
                aria-label="Duplicar concepto"
              >
                <Copy className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg border border-jaguar-ink/10 p-1.5 text-jaguar-maroon-600/70 transition-colors hover:bg-jaguar-maroon-500/5"
                aria-label="Eliminar concepto"
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              </button>
            </div>
          </Card>
        );
      })}

      <button
        type="button"
        className="flex min-h-[210px] flex-col items-center justify-center gap-2 rounded-[18px] border-2 border-dashed border-jaguar-ink/12 text-jaguar-ink/35 transition-colors hover:border-jaguar-green-500/40 hover:text-jaguar-green-600"
      >
        <Plus className="h-6 w-6" strokeWidth={1.8} aria-hidden />
        <span className="text-[13px] lg:text-[14px] font-semibold">Nuevo concepto</span>
      </button>
    </div>
  );
}
