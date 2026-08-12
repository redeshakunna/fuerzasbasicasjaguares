import type { ComponentType, ReactNode } from "react";
import { CheckCircle2, Clock, Star, Trophy } from "lucide-react";
import { Card } from "../ui/Card";

function StatCard({
  icon: Icon,
  iconClass,
  value,
  label,
  sub,
}: {
  icon: ComponentType<{ className?: string; strokeWidth?: number; "aria-hidden"?: boolean }>;
  iconClass: string;
  value: ReactNode;
  label: string;
  sub?: string;
}) {
  return (
    <Card className="p-4">
      <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconClass}`}>
        <Icon className="h-4.5 w-4.5" strokeWidth={1.9} aria-hidden />
      </span>
      <p className="mt-3 text-[22px] lg:text-[24px] font-extrabold text-jaguar-ink">{value}</p>
      <p className="mt-0.5 text-[12px] lg:text-[13px] font-medium text-jaguar-ink/50">{label}</p>
      {sub ? <p className="mt-1 text-[11px] lg:text-[12px] text-jaguar-ink/35">{sub}</p> : null}
    </Card>
  );
}

/** Resumen operativo de la sesión — solo lo esencial para que el técnico sepa qué falta. */
export function EvaluationSummaryCards({
  pending,
  done,
  total,
  average,
  featured,
}: {
  pending: number;
  done: number;
  total: number;
  average: number | null;
  featured: number;
}) {
  const pct = (n: number) => (total > 0 ? `${Math.round((n / total) * 100)}% del plantel` : "Sin plantel");

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <StatCard icon={Clock} iconClass="bg-violet-500/10 text-violet-600" value={pending} label="Pendientes" sub={pct(pending)} />
      <StatCard
        icon={CheckCircle2}
        iconClass="bg-jaguar-green-50 text-jaguar-green-600"
        value={done}
        label="Realizadas"
        sub={pct(done)}
      />
      <StatCard
        icon={Star}
        iconClass="bg-jaguar-gold-500/15 text-jaguar-gold-600"
        value={average !== null ? `${average.toFixed(1)} / 5` : "—"}
        label="Promedio general"
        sub={average === null ? "Sin datos disponibles" : undefined}
      />
      <StatCard
        icon={Trophy}
        iconClass="bg-jaguar-turquoise-500/10 text-jaguar-turquoise-600"
        value={featured}
        label="Jugadores destacados"
        sub="Marcados en la práctica"
      />
    </div>
  );
}
