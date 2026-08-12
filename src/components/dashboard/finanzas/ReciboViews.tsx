"use client";

import { useState } from "react";
import Image from "next/image";
import { Download, MessageCircle, Monitor, Printer } from "lucide-react";
import { Card } from "../ui/Card";
import type { ObligationRow } from "@/lib/data/finance";
import { formatCOP, formatLongDate } from "@/lib/finance/format";

type View = "whatsapp" | "desktop" | "pdf";

/** WhatsApp primero — es el flujo real que usa la secretaria; escritorio/PDF quedan como respaldo. */
const tabs: { id: View; label: string; icon: typeof Monitor }[] = [
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { id: "desktop", label: "Escritorio", icon: Monitor },
  { id: "pdf", label: "PDF", icon: Printer },
];

function buildWhatsAppMessage(obligation: ObligationRow, guardianFirstName: string): string {
  return [
    `*Confirmación de pago*`,
    `Hola ${guardianFirstName}, confirmamos el pago de:`,
    ``,
    `*${obligation.title}*`,
    `Valor: ${formatCOP(obligation.amount)}`,
    `Fecha: ${formatLongDate(obligation.paidDate ?? obligation.dueDate)}`,
    `Recibo: ${obligation.receiptNumber}`,
    ``,
    `¡Gracias por confiar en Jaguares de Córdoba!`,
  ].join("\n");
}

/** Normaliza a formato wa.me — asume Colombia (+57) si llegan 10 dígitos sin indicativo. */
function toWhatsAppLink(phone: string | null, message: string): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 0) return null;
  const withCountryCode = digits.length === 10 ? `57${digits}` : digits;
  return `https://wa.me/${withCountryCode}?text=${encodeURIComponent(message)}`;
}

function ReceiptBody({ obligation, playerCategory }: { obligation: ObligationRow; playerCategory: string }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between border-b border-jaguar-ink/8 pb-4">
        <div className="flex items-center gap-2.5">
          <Image src="/brand/logo-fuerzas-basicas.png" alt="" width={36} height={36} className="h-9 w-9 object-contain" />
          <div className="leading-tight">
            <p className="text-[12px] lg:text-[13px] font-extrabold uppercase tracking-[0.02em] text-jaguar-ink">Fuerzas Básicas</p>
            <p className="text-[10px] lg:text-[11px] font-medium uppercase tracking-[0.08em] text-jaguar-ink/40">Jaguares de Córdoba</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[11px] lg:text-[12px] font-bold uppercase tracking-[0.03em] text-jaguar-ink/40">Recibo de pago</p>
          <p className="text-[13px] lg:text-[14px] font-extrabold text-jaguar-ink">{obligation.receiptNumber}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-[12.5px] lg:text-[13.5px]">
        <div>
          <p className="text-jaguar-ink/40">Jugador</p>
          <p className="mt-0.5 font-semibold text-jaguar-ink">{obligation.playerName}</p>
        </div>
        <div>
          <p className="text-jaguar-ink/40">Categoría</p>
          <p className="mt-0.5 font-semibold text-jaguar-ink">{playerCategory}</p>
        </div>
        <div>
          <p className="text-jaguar-ink/40">Concepto</p>
          <p className="mt-0.5 font-semibold text-jaguar-ink">{obligation.title}</p>
        </div>
        <div>
          <p className="text-jaguar-ink/40">Método de pago</p>
          <p className="mt-0.5 font-semibold text-jaguar-ink">{obligation.paymentMethod}</p>
        </div>
        <div>
          <p className="text-jaguar-ink/40">Fecha de pago</p>
          <p className="mt-0.5 font-semibold text-jaguar-ink">{formatLongDate(obligation.paidDate ?? obligation.dueDate)}</p>
        </div>
        <div>
          <p className="text-jaguar-ink/40">Estado</p>
          <p className="mt-0.5 font-semibold text-jaguar-green-700">Pagado</p>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-2xl bg-jaguar-mist/50 px-4 py-3.5">
        <p className="text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-ink/60">Valor pagado</p>
        <p className="text-[19px] lg:text-[21px] font-extrabold text-jaguar-ink">{formatCOP(obligation.amount)}</p>
      </div>

      <p className="text-center text-[10.5px] lg:text-[11.5px] text-jaguar-ink/35">
        Este comprobante certifica el pago recibido por Fuerzas Básicas Jaguares de Córdoba.
      </p>
    </div>
  );
}

/**
 * Recibo — WhatsApp es el flujo por defecto (alcance reducido, Bloque 8): es
 * como la academia realmente confirma un pago a las familias. Escritorio y
 * PDF quedan disponibles como respaldo, no como camino principal.
 */
export function ReciboViews({
  obligation,
  playerCategory,
  guardianFirstName,
  guardianPhone,
}: {
  obligation: ObligationRow;
  playerCategory: string;
  guardianFirstName: string;
  guardianPhone: string | null;
}) {
  const [view, setView] = useState<View>("whatsapp");
  const whatsappMessage = buildWhatsAppMessage(obligation, guardianFirstName);
  const whatsappLink = toWhatsAppLink(guardianPhone, whatsappMessage);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-xl bg-jaguar-mist/60 p-1">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = view === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setView(t.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[12.5px] lg:text-[13.5px] font-semibold transition-colors ${
                  active ? "bg-jaguar-green-600 text-white" : "text-jaguar-ink/55 hover:text-jaguar-ink"
                }`}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                {t.label}
              </button>
            );
          })}
        </div>
        {view === "whatsapp" ? (
          whatsappLink ? (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#25D366] px-3.5 py-2 text-[12.5px] lg:text-[13.5px] font-semibold text-white transition-colors hover:opacity-90"
            >
              <MessageCircle className="h-3.5 w-3.5" strokeWidth={2.1} aria-hidden />
              Enviar por WhatsApp
            </a>
          ) : (
            <p className="text-[12px] lg:text-[13px] text-jaguar-ink/40">Sin teléfono del acudiente registrado.</p>
          )
        ) : (
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-xl border border-jaguar-ink/10 px-3.5 py-2 text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-ink/70 transition-colors hover:bg-jaguar-ink/[0.03]"
          >
            <Download className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            Descargar
          </button>
        )}
      </div>

      {view === "desktop" ? (
        <Card className="mx-auto max-w-lg p-6">
          <ReceiptBody obligation={obligation} playerCategory={playerCategory} />
        </Card>
      ) : null}

      {view === "pdf" ? (
        <div className="flex justify-center rounded-[18px] bg-jaguar-ink/[0.04] p-8">
          <div className="w-full max-w-[420px] rounded-sm bg-white p-7 shadow-[0_8px_32px_-8px_rgba(13,18,16,0.25)]">
            <ReceiptBody obligation={obligation} playerCategory={playerCategory} />
          </div>
        </div>
      ) : null}

      {view === "whatsapp" ? (
        <div className="mx-auto max-w-sm overflow-hidden rounded-[22px] border border-jaguar-ink/8 bg-[#e5ddd3]">
          <div className="flex items-center gap-2.5 bg-[#075e54] px-4 py-3">
            <Image src="/brand/logo-fuerzas-basicas.png" alt="" width={30} height={30} className="h-[30px] w-[30px] rounded-full object-contain bg-white" />
            <p className="text-[13px] lg:text-[14px] font-semibold text-white">Fuerzas Básicas Jaguares</p>
          </div>
          <div className="space-y-2 p-4">
            <div className="ml-auto max-w-[85%] rounded-lg rounded-tr-none bg-[#dcf8c6] px-3.5 py-2.5 text-[12.5px] lg:text-[13.5px] leading-relaxed text-jaguar-ink shadow-sm">
              <p className="font-bold">*Confirmación de pago*</p>
              <p className="mt-1.5">Hola {guardianFirstName}, confirmamos el pago de:</p>
              <p className="mt-1.5">
                *{obligation.title}*
                <br />
                Valor: {formatCOP(obligation.amount)}
                <br />
                Fecha: {formatLongDate(obligation.paidDate ?? obligation.dueDate)}
                <br />
                Recibo: {obligation.receiptNumber}
              </p>
              <p className="mt-1.5">¡Gracias por confiar en Jaguares de Córdoba!</p>
              <p className="mt-1 text-right text-[10px] lg:text-[11px] text-jaguar-ink/40">10:32 a. m. ✓✓</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
