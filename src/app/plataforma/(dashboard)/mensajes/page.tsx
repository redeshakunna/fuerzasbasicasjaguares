import type { Metadata } from "next";
import { MessageCircle } from "lucide-react";
import { MensajesShell } from "@/components/dashboard/mensajes/MensajesShell";
import { defaultCategory } from "@/lib/data/categories";
import {
  getDebtorRecipients,
  getAbsenteeRecipients,
  getActivePlayersForCategory,
  getReplacementGroups,
} from "@/lib/data/messaging";

export const metadata: Metadata = {
  title: "Mensajería — Fuerzas Básicas de Jaguares de Córdoba FC",
};

export const dynamic = "force-dynamic";

/**
 * Centro de mensajes — no es una bandeja de chat propia (esa batalla la
 * pierde cualquiera contra WhatsApp): es un motor de plantillas que arma el
 * texto y calcula en vivo a quién avisar (deudores, inasistentes, cupos de
 * convocatoria), y abre WhatsApp con el mensaje ya listo, uno por
 * destinatario — mismo patrón de citaciones/convocatorias ya construido,
 * ahora centralizado y reutilizable en un solo lugar.
 */
export default async function MensajesPage() {
  const category = defaultCategory; // Sub-15 — única categoría activa en el MVP

  const [debtors, absentees, freeMessagePlayers, replacementGroups] = await Promise.all([
    getDebtorRecipients(category),
    getAbsenteeRecipients(category),
    getActivePlayersForCategory(category),
    getReplacementGroups(category),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-jaguar-green-600/10 text-jaguar-green-600">
          <MessageCircle className="h-5 w-5" strokeWidth={1.9} aria-hidden />
        </span>
        <div>
          <h1 className="text-[18px] lg:text-[20px] font-bold text-jaguar-ink">Mensajería</h1>
          <p className="text-[13px] lg:text-[14px] text-jaguar-ink/50">
            Plantillas listas para avisar a las familias por WhatsApp.
          </p>
        </div>
      </div>

      <MensajesShell
        debtors={debtors}
        absentees={absentees}
        replacementGroups={replacementGroups}
        freeMessagePlayers={freeMessagePlayers}
      />
    </div>
  );
}
