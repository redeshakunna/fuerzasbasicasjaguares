"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, BellRing, FileSearch, MessageCircle, Search } from "lucide-react";
import { Avatar } from "../ui/Avatar";
import { conceptIcon, conceptIconClass, ObligationStatusBadge } from "./shared";
import { enviarRecordatorios } from "@/app/plataforma/(dashboard)/finanzas/actions";
import type { ObligationRow, ObligationStatus } from "@/lib/data/finance";
import { formatCOP, formatShortDate } from "@/lib/finance/format";

const statusFilters: Array<ObligationStatus | "Todos"> = ["Todos", "Pendiente", "Pagado", "Vencido"];

/**
 * Buscador + filtros + tabla de cuentas por cobrar, con acción masiva de
 * recordatorios. Reemplaza la pantalla independiente de Recordatorios: el
 * recordatorio vive junto a la cuenta que lo origina, no en una pantalla aparte.
 */
export function ObligationsTable({ obligations }: { obligations: ObligationRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ObligationStatus | "Todos">("Todos");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    return obligations.filter((ob) => {
      if (status !== "Todos" && ob.status !== status) return false;
      if (query.trim().length === 0) return true;
      const haystack = `${ob.title} ${ob.concept} ${ob.playerName}`.toLowerCase();
      return haystack.includes(query.trim().toLowerCase());
    });
  }, [obligations, query, status]);

  const remindable = filtered.filter((ob) => ob.status === "Pendiente" || ob.status === "Vencido");
  const overdueIds = filtered.filter((ob) => ob.status === "Vencido").map((ob) => ob.id);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectOverdue() {
    setSelected(new Set(overdueIds));
  }

  function sendReminders() {
    const ids = [...selected];
    startTransition(async () => {
      await enviarRecordatorios(ids);
      setSelected(new Set());
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {remindable.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-jaguar-turquoise-500/15 bg-jaguar-turquoise-500/[0.05] p-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-jaguar-turquoise-500/10 text-jaguar-turquoise-600">
              <BellRing className="h-4 w-4" strokeWidth={1.9} aria-hidden />
            </span>
            <p className="text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-ink/70">
              {selected.size > 0 ? `${selected.size} seleccionada${selected.size === 1 ? "" : "s"}` : "Selecciona cuentas para avisar a las familias"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {overdueIds.length > 0 ? (
              <button
                type="button"
                onClick={selectOverdue}
                className="rounded-lg border border-jaguar-ink/10 bg-white px-3 py-1.5 text-[12px] lg:text-[13px] font-semibold text-jaguar-ink/65 transition-colors hover:bg-jaguar-ink/[0.03]"
              >
                Seleccionar vencidos ({overdueIds.length})
              </button>
            ) : null}
            <button
              type="button"
              onClick={sendReminders}
              disabled={selected.size === 0 || isPending}
              className="inline-flex items-center gap-1.5 rounded-lg bg-jaguar-turquoise-600 px-3.5 py-1.5 text-[12px] lg:text-[13px] font-semibold text-white transition-colors hover:bg-jaguar-turquoise-700 disabled:opacity-40"
            >
              <MessageCircle className="h-3.5 w-3.5" strokeWidth={2.1} aria-hidden />
              {isPending ? "Enviando…" : `Enviar recordatorio${selected.size > 1 ? "s" : ""}`}
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 rounded-[18px] border border-jaguar-ink/8 bg-white p-4 shadow-[0_1px_2px_rgba(13,18,16,0.04)]">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-jaguar-ink/35" strokeWidth={1.8} aria-hidden />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por concepto o jugador…"
            className="w-full rounded-xl border border-jaguar-ink/10 bg-jaguar-mist/50 py-2.5 pl-10 pr-4 text-[13.5px] lg:text-[15px] text-jaguar-ink placeholder:text-jaguar-ink/35 focus:border-jaguar-green-500/40 focus:outline-none focus:ring-2 focus:ring-jaguar-green-500/10"
          />
        </div>
        <div className="flex items-center gap-1 rounded-xl bg-jaguar-mist/60 p-1">
          {statusFilters.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`rounded-lg px-3 py-1.5 text-[12.5px] lg:text-[13.5px] font-semibold transition-colors ${
                status === s ? "bg-jaguar-green-600 text-white" : "text-jaguar-ink/55 hover:text-jaguar-ink"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-[18px] border border-jaguar-ink/8 bg-white shadow-[0_1px_2px_rgba(13,18,16,0.04)]">
        <div className="flex items-center justify-between px-6 pt-5">
          <p className="text-[13px] lg:text-[14px] font-bold text-jaguar-ink">
            {filtered.length} {filtered.length === 1 ? "cuenta encontrada" : "cuentas encontradas"}
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <FileSearch className="h-7 w-7 text-jaguar-ink/20" strokeWidth={1.6} aria-hidden />
            <p className="mt-2 text-[13px] lg:text-[14px] font-semibold text-jaguar-ink/50">Sin resultados para este filtro.</p>
          </div>
        ) : (
          <div className="mt-3 divide-y divide-jaguar-ink/6 px-3 pb-3">
            {filtered.map((ob) => {
              const Icon = conceptIcon(ob.concept);
              const canRemind = ob.status === "Pendiente" || ob.status === "Vencido";
              return (
                <div key={ob.id} className="flex flex-wrap items-center gap-4 rounded-xl px-3 py-3.5 transition-colors hover:bg-jaguar-mist/40">
                  {canRemind ? (
                    <input
                      type="checkbox"
                      checked={selected.has(ob.id)}
                      onChange={() => toggle(ob.id)}
                      className="h-4 w-4 shrink-0 rounded border-jaguar-ink/20 accent-jaguar-turquoise-600"
                      aria-label={`Seleccionar ${ob.title} de ${ob.playerName}`}
                    />
                  ) : (
                    <span className="h-4 w-4 shrink-0" aria-hidden />
                  )}
                  <Avatar initials={ob.playerInitials} size={38} />
                  <div className="min-w-[180px] flex-1">
                    <p className="text-[13px] lg:text-[14px] font-semibold text-jaguar-ink">{ob.playerName}</p>
                  </div>
                  <div className="flex min-w-[160px] items-center gap-2">
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${conceptIconClass(ob.concept)}`}>
                      <Icon className="h-3.5 w-3.5" strokeWidth={1.9} aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-ink">{ob.title}</p>
                      <p className="text-[11px] lg:text-[12px] text-jaguar-ink/40">{ob.concept}</p>
                    </div>
                  </div>
                  <div className="min-w-[110px]">
                    <p className="text-[13px] lg:text-[14px] font-bold text-jaguar-ink">{formatCOP(ob.amount)}</p>
                  </div>
                  <div className="min-w-[110px]">
                    <p className="text-[12px] lg:text-[13px] text-jaguar-ink/55">
                      {ob.status === "Pagado" ? "Pagado el" : "Vence el"} {formatShortDate(ob.status === "Pagado" ? (ob.paidDate ?? ob.dueDate) : ob.dueDate)}
                    </p>
                  </div>
                  <div className="min-w-[90px]">
                    <ObligationStatusBadge status={ob.status} />
                  </div>
                  {ob.reminderSentAt ? (
                    <div className="flex min-w-[130px] items-center gap-1 text-[11.5px] lg:text-[12.5px] text-jaguar-turquoise-600">
                      <Bell className="h-3 w-3" strokeWidth={2} aria-hidden />
                      Avisado {formatShortDate(ob.reminderSentAt)}
                    </div>
                  ) : null}
                  <div className="ml-auto shrink-0">
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
                        Cobrar
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
