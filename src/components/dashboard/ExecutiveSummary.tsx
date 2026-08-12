import Link from "next/link";
import { AlertTriangle, ArrowRight, Trophy, Users, Wallet } from "lucide-react";
import { Card } from "./ui/Card";
import type { FinanceSummary } from "@/lib/data/finance";
import { formatCOP } from "@/lib/finance/format";
import type { DashboardMatch } from "@/components/dashboard/data/matches.data";

function SummaryTile({
  icon: Icon,
  tone,
  label,
  value,
  hint,
  href,
}: {
  icon: typeof Users;
  tone: "green" | "turquoise" | "gold" | "maroon";
  label: string;
  value: string;
  hint: string;
  href: string;
}) {
  const toneClass = {
    green: "bg-jaguar-green-50 text-jaguar-green-600",
    turquoise: "bg-jaguar-turquoise-500/10 text-jaguar-turquoise-600",
    gold: "bg-jaguar-gold-500/15 text-jaguar-gold-600",
    maroon: "bg-jaguar-maroon-500/10 text-jaguar-maroon-600",
  }[tone];

  return (
    <Link
      href={href}
      className="flex flex-col gap-3 rounded-[18px] border border-jaguar-ink/8 bg-white p-4 transition-shadow hover:shadow-[0_4px_16px_-8px_rgba(13,18,16,0.18)]"
    >
      <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${toneClass}`}>
        <Icon className="h-4.5 w-4.5" strokeWidth={1.9} aria-hidden />
      </span>
      <div>
        <p className="text-[19px] lg:text-[21px] font-extrabold leading-none text-jaguar-ink">{value}</p>
        <p className="mt-1.5 text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-ink/70">{label}</p>
        <p className="mt-0.5 text-[11.5px] lg:text-[12.5px] text-jaguar-ink/45">{hint}</p>
      </div>
    </Link>
  );
}

/**
 * Resumen ejecutivo — reemplaza la cola de acción del día para coordinador y
 * directivo: seguimiento general del club, no captura operativa diaria (esa
 * es tarea del entrenador). Reutiliza datos que ya existen en otros módulos
 * — no crea una segunda fuente de verdad.
 */
export function ExecutiveSummary({
  totalPlayers,
  nextMatch,
  finance,
}: {
  totalPlayers: number;
  nextMatch: DashboardMatch | null;
  finance: FinanceSummary;
}) {
  return (
    <div>
      <p className="mb-3 text-[13px] lg:text-[14px] font-bold uppercase tracking-[0.03em] text-jaguar-ink/45">Resumen general</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryTile
          icon={Users}
          tone="green"
          label="Jugadores activos"
          value={String(totalPlayers)}
          hint="Plantel Sub-15"
          href="/plataforma/jugadores"
        />
        <SummaryTile
          icon={Trophy}
          tone="turquoise"
          label="Próximo partido"
          value={nextMatch ? `vs. ${nextMatch.rival}` : "Sin partido"}
          hint={nextMatch ? `${nextMatch.date} · ${nextMatch.location}` : "Nada programado"}
          href="/plataforma/partidos"
        />
        <SummaryTile
          icon={Wallet}
          tone="gold"
          label="Por cobrar"
          value={formatCOP(finance.totalPorCobrar)}
          hint={`${finance.pendientesCount} cuenta${finance.pendientesCount === 1 ? "" : "s"} pendiente${finance.pendientesCount === 1 ? "" : "s"}`}
          href="/plataforma/finanzas"
        />
        <SummaryTile
          icon={AlertTriangle}
          tone="maroon"
          label="Cobros vencidos"
          value={String(finance.vencidosCount)}
          hint={finance.vencidosCount > 0 ? formatCOP(finance.vencidosAmount) : "Sin vencidos"}
          href="/plataforma/finanzas/cuentas-por-cobrar"
        />
      </div>
      <Link
        href="/plataforma/configuracion"
        className="mt-3 inline-flex items-center gap-1 text-[12px] lg:text-[13px] font-semibold text-jaguar-green-600 hover:text-jaguar-green-700"
      >
        Ir a Configuración <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
      </Link>
    </div>
  );
}
