"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Banknote, Check, CreditCard, Landmark, Smartphone } from "lucide-react";
import { Card } from "../ui/Card";
import { Avatar } from "../ui/Avatar";
import { registrarPago } from "@/app/plataforma/(dashboard)/finanzas/actions";
import type { ObligationRow } from "@/lib/data/finance";
import { formatCOP } from "@/lib/finance/format";

const methods = [
  { id: "Efectivo", icon: Banknote },
  { id: "Transferencia", icon: Landmark },
  { id: "Nequi / Daviplata", icon: Smartphone },
  { id: "Tarjeta", icon: CreditCard },
] as const;

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/** Registrar pago — pensado para la secretaria: mínimos clics, escribe directo a Supabase. */
export function RegistrarPagoForm({
  pendingObligations,
  initialObligationId,
}: {
  pendingObligations: ObligationRow[];
  initialObligationId?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const initial = pendingObligations.find((o) => o.id === initialObligationId) ?? pendingObligations[0] ?? null;

  const [selected, setSelected] = useState<ObligationRow | null>(initial);
  const [amount, setAmount] = useState(String(initial?.amount ?? ""));
  const [method, setMethod] = useState<(typeof methods)[number]["id"]>("Efectivo");
  const [paidDate, setPaidDate] = useState(todayISO());
  const [error, setError] = useState<string | null>(null);

  function selectObligation(id: string) {
    const ob = pendingObligations.find((o) => o.id === id) ?? null;
    setSelected(ob);
    setAmount(String(ob?.amount ?? ""));
  }

  function submit() {
    if (!selected) return;
    setError(null);
    startTransition(async () => {
      const result = await registrarPago(selected.id, { amount: Number(amount) || selected.amount, method, paidAt: paidDate });
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push(`/plataforma/finanzas/recibo?concepto=${selected.id}`);
    });
  }

  if (pendingObligations.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-2 p-14 text-center">
        <Check className="h-7 w-7 text-jaguar-green-600" strokeWidth={1.8} aria-hidden />
        <p className="text-[14px] lg:text-[15.5px] font-semibold text-jaguar-ink">No hay cobros pendientes por registrar.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      {selected ? (
        <div className="flex items-center gap-3 rounded-2xl bg-jaguar-mist/50 p-4">
          <Avatar initials={selected.playerInitials} size={44} />
          <div>
            <p className="text-[13.5px] lg:text-[15px] font-bold text-jaguar-ink">{selected.playerName}</p>
            <p className="text-[12px] lg:text-[13px] text-jaguar-ink/50">{selected.concept}</p>
          </div>
        </div>
      ) : null}

      <label className="mt-5 block">
        <span className="text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-ink/60">Concepto a pagar</span>
        <select
          value={selected?.id ?? ""}
          onChange={(e) => selectObligation(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-jaguar-ink/10 bg-white py-2.5 px-3.5 text-[13.5px] lg:text-[15px] font-medium text-jaguar-ink focus:border-jaguar-green-500/40 focus:outline-none focus:ring-2 focus:ring-jaguar-green-500/10"
        >
          {pendingObligations.map((o) => (
            <option key={o.id} value={o.id}>
              {o.playerName} — {o.title} — {formatCOP(o.amount)}
            </option>
          ))}
        </select>
      </label>

      <label className="mt-4 block">
        <span className="text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-ink/60">Valor recibido</span>
        <div className="relative mt-1.5">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[13.5px] lg:text-[15px] text-jaguar-ink/40">$</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-xl border border-jaguar-ink/10 bg-jaguar-mist/50 py-2.5 pl-8 pr-4 text-[15px] lg:text-[16.5px] font-bold text-jaguar-ink focus:border-jaguar-green-500/40 focus:outline-none focus:ring-2 focus:ring-jaguar-green-500/10"
          />
        </div>
      </label>

      <div className="mt-4">
        <span className="text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-ink/60">Método de pago</span>
        <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {methods.map((m) => {
            const Icon = m.icon;
            const active = method === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMethod(m.id)}
                className={`flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-3 text-[11.5px] lg:text-[12.5px] font-semibold transition-colors ${
                  active ? "border-jaguar-green-600 bg-jaguar-green-50/50 text-jaguar-green-700" : "border-jaguar-ink/8 text-jaguar-ink/60 hover:bg-jaguar-mist/40"
                }`}
              >
                <Icon className="h-4.5 w-4.5" strokeWidth={1.9} aria-hidden />
                {m.id}
              </button>
            );
          })}
        </div>
      </div>

      <label className="mt-4 block max-w-[220px]">
        <span className="text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-ink/60">Fecha de pago</span>
        <input
          type="date"
          value={paidDate}
          onChange={(e) => setPaidDate(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-jaguar-ink/10 bg-jaguar-mist/50 py-2.5 px-3.5 text-[13.5px] lg:text-[15px] text-jaguar-ink focus:border-jaguar-green-500/40 focus:outline-none focus:ring-2 focus:ring-jaguar-green-500/10"
        />
      </label>

      {error ? <p className="mt-3 text-[12.5px] lg:text-[13.5px] font-medium text-jaguar-maroon-600">{error}</p> : null}

      <button
        type="button"
        onClick={submit}
        disabled={!selected || isPending}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-jaguar-green-600 py-3.5 text-[14px] lg:text-[15.5px] font-bold text-white transition-colors hover:bg-jaguar-green-700 disabled:opacity-50"
      >
        <Check className="h-4.5 w-4.5" strokeWidth={2.25} aria-hidden />
        {isPending ? "Registrando…" : "Registrar pago"}
      </button>
    </Card>
  );
}
