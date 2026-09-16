"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Card, CardHeader } from "../../ui/Card";
import { Badge } from "../../ui/Badge";
import { marcarRecuperado } from "@/app/plataforma/(dashboard)/jugadores/injury-actions";
import type { InjuryRow, InjurySeverity } from "@/lib/data/injuries";

const severityTone: Record<InjurySeverity, "gold" | "maroon"> = {
  Leve: "gold",
  Moderada: "maroon",
  Severa: "maroon",
};

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
}

function InjuryRowItem({ injury, playerId }: { injury: InjuryRow; playerId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isActive = !injury.recoveredAt;

  function markRecovered() {
    startTransition(async () => {
      await marcarRecuperado(injury.id, playerId);
      router.refresh();
    });
  }

  return (
    <div className={`rounded-xl border px-3.5 py-3 ${isActive ? "border-jaguar-maroon-500/25 bg-jaguar-maroon-500/[0.03]" : "border-jaguar-ink/8"}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <p className="text-[13px] lg:text-[14px] font-semibold text-jaguar-ink">{injury.injuryType}</p>
          <Badge tone={severityTone[injury.severity]}>{injury.severity}</Badge>
          {isActive ? <Badge tone="maroon">Activa</Badge> : <Badge tone="green">Recuperado</Badge>}
        </div>
        {isActive ? (
          <button
            type="button"
            onClick={markRecovered}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-lg border border-jaguar-green-500/30 px-3 py-1.5 text-[11.5px] lg:text-[12.5px] font-semibold text-jaguar-green-700 hover:bg-jaguar-green-50 disabled:opacity-60"
          >
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            {isPending ? "Guardando…" : "Marcar recuperado"}
          </button>
        ) : null}
      </div>
      <p className="mt-1.5 text-[11.5px] lg:text-[12.5px] text-jaguar-ink/45">
        Desde {formatDate(injury.startDate)}
        {injury.expectedRecoveryDate ? ` · Recuperación estimada: ${formatDate(injury.expectedRecoveryDate)}` : ""}
        {injury.recoveredAt ? ` · Recuperado el ${formatDate(injury.recoveredAt)}` : ""}
      </p>
      {injury.notes ? <p className="mt-1.5 text-[12.5px] lg:text-[13.5px] text-jaguar-ink/65">{injury.notes}</p> : null}
    </div>
  );
}

/** Historial de lesiones del jugador — se llena desde el botón "Registrar lesión" de las acciones rápidas. */
export function PlayerInjuriesCard({ playerId, injuries }: { playerId: string; injuries: InjuryRow[] }) {
  if (injuries.length === 0) return null;

  return (
    <Card className="p-0">
      <CardHeader title="Historial de lesiones" subtitle="Registro médico del jugador — más reciente primero." />
      <div className="space-y-2.5 px-6 pb-6 pt-4">
        {injuries.map((injury) => (
          <InjuryRowItem key={injury.id} injury={injury} playerId={playerId} />
        ))}
      </div>
    </Card>
  );
}
