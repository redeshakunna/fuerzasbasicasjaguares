"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Check, CreditCard, FileSliders, Loader2, LayoutGrid, ScrollText, Wallet } from "lucide-react";
import { Card } from "../ui/Card";
import {
  actualizarPoliticasCobro,
  actualizarValorMensualidad,
  alternarMetodoPago,
} from "@/app/plataforma/(dashboard)/finanzas/actions";
import { ALL_PAYMENT_METHODS, type CategoryFeeRow, type FinanceSettingsRow, type PaymentMethod } from "@/lib/data/finance";

const tabs = [
  { id: "mensualidades", label: "Mensualidades", icon: Wallet },
  { id: "categorias", label: "Categorías", icon: LayoutGrid },
  { id: "metodos", label: "Métodos de pago", icon: CreditCard },
  { id: "politicas", label: "Políticas", icon: ScrollText },
] as const;

type TabId = (typeof tabs)[number]["id"];

function AmountInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="relative w-[140px]">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-jaguar-ink/40">$</span>
      <input
        type="number"
        min={0}
        step={1000}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-lg border border-jaguar-ink/10 bg-jaguar-mist/50 py-1.5 pl-6 pr-3 text-right text-[13px] lg:text-[14px] font-semibold text-jaguar-ink focus:border-jaguar-green-500/40 focus:outline-none focus:ring-2 focus:ring-jaguar-green-500/10"
      />
    </div>
  );
}

/** Configuración financiera — conectada a Supabase: mensualidad por categoría, métodos de pago y políticas de cobro. */
export function FinanceSettingsTabs({
  conceptsCount,
  settings,
  categoryFees,
}: {
  conceptsCount: number;
  settings: FinanceSettingsRow | null;
  categoryFees: CategoryFeeRow[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("mensualidades");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [savedTab, setSavedTab] = useState<TabId | null>(null);

  const [fees, setFees] = useState(() => new Map(categoryFees.map((f) => [f.category, f.monthlyAmount])));
  const [dueDay, setDueDay] = useState(settings?.dueDay ?? 5);
  const [reminderDaysBefore, setReminderDaysBefore] = useState(settings?.reminderDaysBefore ?? 3);
  const enabledMethods = new Set(settings?.enabledPaymentMethods ?? []);

  function flashSaved(t: TabId) {
    setSavedTab(t);
    setTimeout(() => setSavedTab((prev) => (prev === t ? null : prev)), 2000);
  }

  function saveMensualidades() {
    setError(null);
    startTransition(async () => {
      for (const c of categoryFees) {
        const result = await actualizarValorMensualidad(c.category, fees.get(c.category) ?? 0);
        if (result.error) {
          setError(result.error);
          return;
        }
      }
      router.refresh();
      flashSaved("mensualidades");
    });
  }

  function toggleMethod(method: PaymentMethod) {
    setError(null);
    startTransition(async () => {
      const result = await alternarMetodoPago(method, !enabledMethods.has(method));
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function savePoliticas() {
    setError(null);
    startTransition(async () => {
      const result = await actualizarPoliticasCobro({ dueDay, reminderDaysBefore });
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
      flashSaved("politicas");
    });
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
      <div className="space-y-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-[13px] lg:text-[14px] font-semibold transition-colors ${
                active ? "bg-jaguar-green-600 text-white" : "text-jaguar-ink/60 hover:bg-jaguar-ink/[0.04]"
              }`}
            >
              <Icon className="h-4 w-4" strokeWidth={1.9} aria-hidden />
              {t.label}
            </button>
          );
        })}
        <Link
          href="/plataforma/finanzas/conceptos"
          className="flex w-full items-center justify-between gap-2.5 rounded-xl px-3.5 py-2.5 text-[13px] lg:text-[14px] font-semibold text-jaguar-ink/60 transition-colors hover:bg-jaguar-ink/[0.04]"
        >
          <span className="flex items-center gap-2.5">
            <FileSliders className="h-4 w-4" strokeWidth={1.9} aria-hidden />
            Conceptos de cobro
          </span>
          <ArrowRight className="h-3.5 w-3.5 text-jaguar-ink/30" strokeWidth={2.25} aria-hidden />
        </Link>
      </div>

      <Card className="p-6">
        {tab === "mensualidades" ? (
          <div className="space-y-3">
            <p className="text-[14px] lg:text-[15.5px] font-bold text-jaguar-ink">Valores de mensualidad por categoría</p>
            <p className="text-[12.5px] lg:text-[13.5px] text-jaguar-ink/45">Define el valor mensual sugerido para cada categoría formativa.</p>
            <div className="mt-2 space-y-2.5">
              {categoryFees.map((c) => (
                <div key={c.category} className="flex items-center justify-between rounded-xl border border-jaguar-ink/8 px-4 py-3.5">
                  <div>
                    <p className="text-[13px] lg:text-[14px] font-semibold text-jaguar-ink">{c.category}</p>
                    <p className="text-[11.5px] lg:text-[12.5px] text-jaguar-ink/45">
                      {c.activePlayers > 0 ? `${c.activePlayers} jugador${c.activePlayers === 1 ? "" : "es"} activo${c.activePlayers === 1 ? "" : "s"}` : "Sin jugadores aún"}
                    </p>
                  </div>
                  <AmountInput value={fees.get(c.category) ?? 0} onChange={(n) => setFees((prev) => new Map(prev).set(c.category, n))} />
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {tab === "categorias" ? (
          <div className="space-y-3">
            <p className="text-[14px] lg:text-[15.5px] font-bold text-jaguar-ink">Categorías activas</p>
            <p className="text-[12.5px] lg:text-[13.5px] text-jaguar-ink/45">La facturación se organiza por categoría formativa.</p>
            <div className="mt-2 space-y-2.5">
              {categoryFees.map((c) => (
                <div key={c.category} className="flex items-center justify-between rounded-xl border border-jaguar-ink/8 px-4 py-3.5">
                  <p className="text-[13px] lg:text-[14px] font-semibold text-jaguar-ink">{c.category}</p>
                  <span className={`text-[11.5px] lg:text-[12.5px] font-semibold ${c.activePlayers > 0 ? "text-jaguar-green-600" : "text-jaguar-ink/35"}`}>
                    {c.activePlayers > 0 ? `${c.activePlayers} jugador${c.activePlayers === 1 ? "" : "es"} activo${c.activePlayers === 1 ? "" : "s"}` : "Sin jugadores aún"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {tab === "metodos" ? (
          <div className="space-y-3">
            <p className="text-[14px] lg:text-[15.5px] font-bold text-jaguar-ink">Métodos de pago habilitados</p>
            <p className="text-[12.5px] lg:text-[13.5px] text-jaguar-ink/45">Elige qué métodos puede usar la secretaria al registrar un pago.</p>
            <div className="mt-2 grid grid-cols-2 gap-2.5">
              {ALL_PAYMENT_METHODS.map((m) => {
                const on = enabledMethods.has(m);
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => toggleMethod(m)}
                    disabled={isPending}
                    className="flex items-center justify-between rounded-xl border border-jaguar-ink/8 px-3.5 py-3 text-left transition-colors hover:bg-jaguar-ink/[0.02] disabled:opacity-60"
                  >
                    <p className="text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-ink">{m}</p>
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full ${
                        on ? "bg-jaguar-green-50 text-jaguar-green-600" : "bg-jaguar-ink/6 text-transparent"
                      }`}
                    >
                      <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {tab === "politicas" ? (
          <div className="space-y-3">
            <p className="text-[14px] lg:text-[15.5px] font-bold text-jaguar-ink">Políticas de cobro</p>
            <p className="text-[12.5px] lg:text-[13.5px] text-jaguar-ink/45">Reglas generales que aplican a los cobros de la academia.</p>
            <div className="mt-2 space-y-2.5">
              <div className="flex items-center justify-between gap-4 rounded-xl border border-jaguar-ink/8 px-4 py-3.5">
                <div>
                  <p className="text-[13px] lg:text-[14px] font-semibold text-jaguar-ink">Día límite de pago mensual</p>
                  <p className="text-[11.5px] lg:text-[12.5px] text-jaguar-ink/45">Día del mes en que vence la mensualidad</p>
                </div>
                <input
                  type="number"
                  min={1}
                  max={28}
                  value={dueDay}
                  onChange={(e) => setDueDay(Number(e.target.value))}
                  className="w-[80px] rounded-lg border border-jaguar-ink/10 bg-jaguar-mist/50 px-3 py-1.5 text-right text-[13px] lg:text-[14px] font-semibold text-jaguar-ink focus:border-jaguar-green-500/40 focus:outline-none focus:ring-2 focus:ring-jaguar-green-500/10"
                />
              </div>
              <div className="flex items-center justify-between gap-4 rounded-xl border border-jaguar-ink/8 px-4 py-3.5">
                <div>
                  <p className="text-[13px] lg:text-[14px] font-semibold text-jaguar-ink">Recordatorio automático</p>
                  <p className="text-[11.5px] lg:text-[12.5px] text-jaguar-ink/45">Días antes del vencimiento</p>
                </div>
                <input
                  type="number"
                  min={0}
                  value={reminderDaysBefore}
                  onChange={(e) => setReminderDaysBefore(Number(e.target.value))}
                  className="w-[80px] rounded-lg border border-jaguar-ink/10 bg-jaguar-mist/50 px-3 py-1.5 text-right text-[13px] lg:text-[14px] font-semibold text-jaguar-ink focus:border-jaguar-green-500/40 focus:outline-none focus:ring-2 focus:ring-jaguar-green-500/10"
                />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-jaguar-ink/8 px-4 py-3.5">
                <p className="text-[13px] lg:text-[14px] font-semibold text-jaguar-ink">Conceptos activos</p>
                <p className="text-[11.5px] lg:text-[12.5px] font-semibold text-jaguar-ink/45">Definidos en el catálogo</p>
                <p className="text-[13px] lg:text-[14px] font-bold text-jaguar-ink">{conceptsCount}</p>
              </div>
            </div>
          </div>
        ) : null}

        {error ? (
          <p className="mt-4 rounded-xl bg-jaguar-maroon-500/8 px-3.5 py-2.5 text-[13px] lg:text-[14px] font-medium text-jaguar-maroon-600">
            {error}
          </p>
        ) : null}

        {tab === "mensualidades" || tab === "politicas" ? (
          <div className="mt-6 flex items-center justify-end gap-3 border-t border-jaguar-ink/6 pt-4">
            {savedTab === tab ? <span className="text-[12.5px] font-semibold text-jaguar-green-600">Guardado</span> : null}
            <button
              type="button"
              disabled={isPending}
              onClick={tab === "mensualidades" ? saveMensualidades : savePoliticas}
              className="flex items-center gap-2 rounded-xl bg-jaguar-green-600 px-5 py-2.5 text-[13px] lg:text-[14px] font-semibold text-white hover:bg-jaguar-green-700 disabled:opacity-60"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} aria-hidden /> : null}
              {isPending ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
