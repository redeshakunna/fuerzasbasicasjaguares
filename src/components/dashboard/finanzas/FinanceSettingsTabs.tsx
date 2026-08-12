"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, CreditCard, FileSliders, LayoutGrid, ScrollText, Wallet } from "lucide-react";
import { Card } from "../ui/Card";
import { formatCOP } from "@/lib/finance/format";

const tabs = [
  { id: "mensualidades", label: "Mensualidades", icon: Wallet },
  { id: "categorias", label: "Categorías", icon: LayoutGrid },
  { id: "metodos", label: "Métodos de pago", icon: CreditCard },
  { id: "politicas", label: "Políticas", icon: ScrollText },
] as const;

type TabId = (typeof tabs)[number]["id"];

function SettingRow({ label, hint, value }: { label: string; hint: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-jaguar-ink/8 px-4 py-3.5">
      <div>
        <p className="text-[13px] lg:text-[14px] font-semibold text-jaguar-ink">{label}</p>
        <p className="text-[11.5px] lg:text-[12.5px] text-jaguar-ink/45">{hint}</p>
      </div>
      <input
        defaultValue={value}
        className="w-[140px] rounded-lg border border-jaguar-ink/10 bg-jaguar-mist/50 px-3 py-1.5 text-right text-[13px] lg:text-[14px] font-semibold text-jaguar-ink focus:border-jaguar-green-500/40 focus:outline-none focus:ring-2 focus:ring-jaguar-green-500/10"
      />
    </div>
  );
}

/** Configuración financiera — solo interfaz, sin lógica real todavía. */
export function FinanceSettingsTabs({ conceptsCount }: { conceptsCount: number }) {
  const [tab, setTab] = useState<TabId>("mensualidades");

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
              <SettingRow label="Sub-13" hint="Categoría formativa inicial" value={formatCOP(100000)} />
              <SettingRow label="Sub-15" hint="Categoría activa actualmente" value={formatCOP(120000)} />
              <SettingRow label="Sub-17" hint="Categoría formativa avanzada" value={formatCOP(140000)} />
            </div>
          </div>
        ) : null}

        {tab === "categorias" ? (
          <div className="space-y-3">
            <p className="text-[14px] lg:text-[15.5px] font-bold text-jaguar-ink">Categorías activas</p>
            <p className="text-[12.5px] lg:text-[13.5px] text-jaguar-ink/45">La facturación se organiza por categoría formativa.</p>
            <div className="mt-2 space-y-2.5">
              {["Sub-13", "Sub-15", "Sub-17"].map((cat) => (
                <div key={cat} className="flex items-center justify-between rounded-xl border border-jaguar-ink/8 px-4 py-3.5">
                  <p className="text-[13px] lg:text-[14px] font-semibold text-jaguar-ink">{cat}</p>
                  <span className={`text-[11.5px] lg:text-[12.5px] font-semibold ${cat === "Sub-15" ? "text-jaguar-green-600" : "text-jaguar-ink/35"}`}>
                    {cat === "Sub-15" ? "1 jugador activo" : "Sin jugadores aún"}
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
              {["Efectivo", "Transferencia", "Nequi / Daviplata", "Tarjeta"].map((m) => (
                <div key={m} className="flex items-center justify-between rounded-xl border border-jaguar-ink/8 px-3.5 py-3">
                  <p className="text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-ink">{m}</p>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-jaguar-green-50 text-jaguar-green-600">
                    <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden />
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {tab === "politicas" ? (
          <div className="space-y-3">
            <p className="text-[14px] lg:text-[15.5px] font-bold text-jaguar-ink">Políticas de cobro</p>
            <p className="text-[12.5px] lg:text-[13.5px] text-jaguar-ink/45">Reglas generales que aplican a los cobros de la academia.</p>
            <div className="mt-2 space-y-2.5">
              <SettingRow label="Día límite de pago mensual" hint="Día del mes en que vence la mensualidad" value="5" />
              <SettingRow label="Recordatorio automático" hint="Días antes del vencimiento" value="3" />
              <SettingRow label="Conceptos activos" hint="Definidos en el catálogo" value={String(conceptsCount)} />
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex justify-end border-t border-jaguar-ink/6 pt-4">
          <button type="button" className="rounded-xl bg-jaguar-green-600 px-5 py-2.5 text-[13px] lg:text-[14px] font-semibold text-white hover:bg-jaguar-green-700">
            Guardar cambios
          </button>
        </div>
      </Card>
    </div>
  );
}
