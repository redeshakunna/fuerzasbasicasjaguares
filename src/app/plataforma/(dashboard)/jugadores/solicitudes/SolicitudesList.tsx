"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckSquare, Loader2, Square } from "lucide-react";
import { SolicitudCard } from "./SolicitudCard";
import { approveRegistrationRequestsBulk, type BulkApproveFailure } from "./actions";
import type { RegistrationRequest } from "@/lib/data/registration-requests";

interface SolicitudesListProps {
  requests: RegistrationRequest[];
  reviewable: boolean;
}

/**
 * Lista de solicitudes con selección múltiple — solo en la pestaña
 * Pendientes. "Aprobar seleccionadas" crea cada jugador con el número de
 * camiseta que sugirió, sin entrenador asignado (se reparte después desde
 * cada ficha). La que choque queda aparte, sin frenar a las demás.
 */
export function SolicitudesList({ requests, reviewable }: SolicitudesListProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [summary, setSummary] = useState<{ approvedCount: number; failed: BulkApproveFailure[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const allSelected = requests.length > 0 && selected.size === requests.length;

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(requests.map((r) => r.id)));
  }

  function approveSelected() {
    setError(null);
    setSummary(null);
    startTransition(async () => {
      const result = await approveRegistrationRequestsBulk(Array.from(selected));
      if (result.error) {
        setError(result.error);
        return;
      }
      setSummary({ approvedCount: result.approvedCount ?? 0, failed: result.failed ?? [] });
      setSelected(new Set());
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      {reviewable && requests.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-jaguar-ink/8 bg-jaguar-mist/30 px-4 py-2.5">
          <button
            type="button"
            onClick={toggleAll}
            className="inline-flex items-center gap-1.5 text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-ink/70"
          >
            {allSelected ? (
              <CheckSquare className="h-4 w-4 text-jaguar-green-600" strokeWidth={2} aria-hidden />
            ) : (
              <Square className="h-4 w-4 text-jaguar-ink/35" strokeWidth={2} aria-hidden />
            )}
            {selected.size > 0 ? `${selected.size} seleccionada${selected.size === 1 ? "" : "s"}` : "Seleccionar todas"}
          </button>
          <button
            type="button"
            disabled={selected.size === 0 || isPending}
            onClick={approveSelected}
            className="inline-flex items-center gap-1.5 rounded-xl bg-jaguar-green-600 px-3.5 py-1.5 text-[12.5px] lg:text-[13.5px] font-semibold text-white transition-colors hover:bg-jaguar-green-700 disabled:opacity-50"
          >
            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2.5} aria-hidden /> : null}
            Aprobar seleccionadas
          </button>
        </div>
      ) : null}

      {error ? (
        <p className="rounded-xl bg-jaguar-maroon-500/8 px-3.5 py-2.5 text-[13px] font-medium text-jaguar-maroon-600">{error}</p>
      ) : null}

      {summary ? (
        <div className="rounded-xl border border-jaguar-ink/8 bg-white px-4 py-3 text-[13px] lg:text-[13.5px]">
          <p className="font-semibold text-jaguar-green-700">
            {summary.approvedCount} solicitud{summary.approvedCount === 1 ? "" : "es"} aprobada
            {summary.approvedCount === 1 ? "" : "s"}.
          </p>
          {summary.failed.length > 0 ? (
            <div className="mt-2 space-y-1">
              <p className="font-semibold text-jaguar-maroon-600">Quedaron pendientes de revisar a mano:</p>
              {summary.failed.map((f) => (
                <p key={f.id} className="text-jaguar-ink/60">
                  {f.name} — {f.reason}
                </p>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-3">
        {requests.map((request) => (
          <SolicitudCard
            key={request.id}
            request={request}
            reviewable={reviewable}
            selectable={reviewable}
            selected={selected.has(request.id)}
            onToggleSelect={toggleOne}
          />
        ))}
      </div>
    </div>
  );
}
