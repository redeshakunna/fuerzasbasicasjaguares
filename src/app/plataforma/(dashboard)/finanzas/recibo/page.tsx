import { FinanceSectionHeader } from "@/components/dashboard/finanzas/shared";
import { ReciboViews } from "@/components/dashboard/finanzas/ReciboViews";
import { Card } from "@/components/dashboard/ui/Card";
import { Receipt } from "lucide-react";
import { getObligationById, getObligations } from "@/lib/data/finance";
import { getPlayers } from "@/lib/data/players";

export const dynamic = "force-dynamic";

interface ReciboPageProps {
  searchParams: Promise<{ concepto?: string }>;
}

/** Recibo de pago — 3 formatos visuales del mismo comprobante. */
export default async function ReciboPage({ searchParams }: ReciboPageProps) {
  const { concepto } = await searchParams;
  const candidate = concepto ? await getObligationById(concepto) : null;

  let obligation = candidate?.status === "Pagado" ? candidate : null;
  if (!obligation) {
    const paid = (await getObligations())
      .filter((o) => o.status === "Pagado")
      .sort((a, b) => (b.paidDate ?? "").localeCompare(a.paidDate ?? ""));
    obligation = paid[0] ?? null;
  }

  const players = obligation ? await getPlayers() : [];
  const player = players.find((p) => p.id === obligation?.playerId) ?? null;

  return (
    <div className="space-y-6">
      <FinanceSectionHeader title="Recibo de pago" subtitle="Confirma el pago por WhatsApp — escritorio y PDF quedan como respaldo." />
      {obligation ? (
        <ReciboViews
          obligation={obligation}
          playerCategory={player?.category ?? "Sub-15"}
          guardianFirstName={(player?.guardian_name ?? "").split(" ")[0] || "familia"}
          guardianPhone={player?.guardian_phone ?? null}
        />
      ) : (
        <Card className="flex flex-col items-center gap-3 p-14 text-center">
          <Receipt className="h-7 w-7 text-jaguar-ink/20" strokeWidth={1.6} aria-hidden />
          <p className="text-[13px] lg:text-[14px] font-semibold text-jaguar-ink/50">Aún no hay pagos registrados para generar un recibo.</p>
        </Card>
      )}
    </div>
  );
}
