import type { Metadata } from "next";
import { MessageCircle, Info } from "lucide-react";
import { MensajesShell } from "@/components/dashboard/mensajes/MensajesShell";
import { CategorySelector } from "@/components/dashboard/CategorySelector";
import { categories, activeCategories, parseCategory } from "@/lib/data/categories";
import {
  getDebtorRecipients,
  getCutoffNoticeRecipients,
  getAbsenteeRecipients,
  getActivePlayersForCategory,
  getReplacementGroups,
} from "@/lib/data/messaging";

export const metadata: Metadata = {
  title: "Mensajería — Fuerzas Básicas de Jaguares de Córdoba FC",
};

export const dynamic = "force-dynamic";

interface MensajesPageProps {
  searchParams: Promise<{ categoria?: string }>;
}

/**
 * Centro de mensajes — no es una bandeja de chat propia (esa batalla la
 * pierde cualquiera contra WhatsApp): es una herramienta administrativa de
 * plantillas que arma el texto y calcula en vivo a quién avisar (deudores,
 * fecha de corte, inasistentes, cupos de convocatoria, avisos generales por
 * categoría), y abre WhatsApp con el mensaje ya listo, uno por destinatario.
 */
export default async function MensajesPage({ searchParams }: MensajesPageProps) {
  const { categoria } = await searchParams;
  const category = parseCategory(categoria);
  const isActiveCategory = activeCategories.includes(category);

  const [debtors, cutoffRecipients, absentees, replacementGroups, playersByCategoryEntries] = await Promise.all([
    getDebtorRecipients(category),
    getCutoffNoticeRecipients(category),
    getAbsenteeRecipients(category),
    getReplacementGroups(category),
    Promise.all(categories.map(async (c) => [c, await getActivePlayersForCategory(c)] as const)),
  ]);

  const playersByCategory = Object.fromEntries(playersByCategoryEntries) as Record<
    (typeof categories)[number],
    Awaited<ReturnType<typeof getActivePlayersForCategory>>
  >;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-jaguar-green-600/10 text-jaguar-green-600">
            <MessageCircle className="h-5 w-5" strokeWidth={1.9} aria-hidden />
          </span>
          <div>
            <h1 className="text-[18px] lg:text-[20px] font-bold text-jaguar-ink">Mensajería</h1>
            <p className="text-[13px] lg:text-[14px] text-jaguar-ink/50">
              Herramienta administrativa de la academia — arma el mensaje y abre WhatsApp ya escrito, uno por familia.
            </p>
          </div>
        </div>
        <CategorySelector active={category} basePath="/plataforma/mensajes" />
      </div>

      {!isActiveCategory ? (
        <div className="flex items-center gap-2.5 rounded-xl bg-jaguar-gold-500/10 px-4 py-3 text-[13px] font-medium text-jaguar-gold-700">
          <Info className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
          La categoría {category} aún no tiene plantel activo — Deudores, Inasistencias y Reemplazo se mostrarán
          vacíos hasta que haya jugadores registrados.
        </div>
      ) : null}

      <MensajesShell
        category={category}
        debtors={debtors}
        cutoffRecipients={cutoffRecipients}
        absentees={absentees}
        replacementGroups={replacementGroups}
        playersByCategory={playersByCategory}
      />
    </div>
  );
}
