"use client";

import { useState } from "react";
import { Bell, BellRing, MessageCircle } from "lucide-react";
import { Card, CardHeader } from "../ui/Card";
import { Avatar } from "../ui/Avatar";
import { conceptIcon, conceptIconClass } from "./shared";
import type { ObligationRow } from "@/lib/data/finance";
import { formatCOP, formatLongDate } from "@/lib/finance/format";

/** Recordatorios de pago pendientes — solo diseño, sin envío ni automatización real. */
export function RemindersList({ pendingObligations }: { pendingObligations: ObligationRow[] }) {
  const [sent, setSent] = useState<Set<string>>(new Set());
  const [autoEnabled, setAutoEnabled] = useState(false);

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-jaguar-turquoise-500/10 text-jaguar-turquoise-600">
              <BellRing className="h-4.5 w-4.5" strokeWidth={1.9} aria-hidden />
            </span>
            <div>
              <p className="text-[13.5px] lg:text-[15px] font-bold text-jaguar-ink">Recordatorios automáticos</p>
              <p className="text-[12px] lg:text-[13px] text-jaguar-ink/50">Envía un aviso 3 días antes del vencimiento (próximamente).</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAutoEnabled((v) => !v)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${autoEnabled ? "bg-jaguar-green-600" : "bg-jaguar-ink/15"}`}
            aria-pressed={autoEnabled}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${autoEnabled ? "translate-x-[22px]" : "translate-x-0.5"}`}
            />
          </button>
        </div>
      </Card>

      <Card className="pb-4">
        <CardHeader title="Próximos vencimientos" subtitle="Envía un recordatorio manual por WhatsApp" />
        {pendingObligations.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-10 text-center">
            <Bell className="h-6 w-6 text-jaguar-ink/20" strokeWidth={1.6} aria-hidden />
            <p className="mt-2 text-[12.5px] lg:text-[13.5px] text-jaguar-ink/45">No hay vencimientos próximos.</p>
          </div>
        ) : (
          <div className="mt-2 divide-y divide-jaguar-ink/6 px-3">
            {pendingObligations.map((ob) => {
              const Icon = conceptIcon(ob.concept);
              const wasSent = sent.has(ob.id);
              return (
                <div key={ob.id} className="flex flex-wrap items-center gap-3 px-3 py-3.5">
                  <Avatar initials={ob.playerInitials} size={38} />
                  <div className="min-w-[160px] flex-1">
                    <p className="text-[13px] lg:text-[14px] font-semibold text-jaguar-ink">{ob.playerName}</p>
                    <p className="text-[11.5px] lg:text-[12.5px] text-jaguar-ink/45">
                      {ob.title} · vence {formatLongDate(ob.dueDate)}
                    </p>
                  </div>
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${conceptIconClass(ob.concept)}`}>
                    <Icon className="h-3.5 w-3.5" strokeWidth={1.9} aria-hidden />
                  </span>
                  <p className="min-w-[100px] text-[13px] lg:text-[14px] font-bold text-jaguar-ink">{formatCOP(ob.amount)}</p>
                  <button
                    type="button"
                    onClick={() => setSent((prev) => new Set(prev).add(ob.id))}
                    disabled={wasSent}
                    className={`ml-auto inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[12px] lg:text-[13px] font-semibold transition-colors ${
                      wasSent ? "bg-jaguar-green-50 text-jaguar-green-700" : "bg-[#25D366] text-white hover:opacity-90"
                    }`}
                  >
                    <MessageCircle className="h-3.5 w-3.5" strokeWidth={2.1} aria-hidden />
                    {wasSent ? "Recordatorio enviado" : "Enviar recordatorio"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
