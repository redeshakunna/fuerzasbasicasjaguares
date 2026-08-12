import type { ComponentType } from "react";
import { CalendarClock, CheckCircle2, ShieldCheck, XCircle } from "lucide-react";
import { Card } from "../ui/Card";

function StatCard({
  icon: Icon,
  iconClass,
  value,
  label,
  pct,
}: {
  icon: ComponentType<{ className?: string; strokeWidth?: number; "aria-hidden"?: boolean }>;
  iconClass: string;
  value: number;
  label: string;
  pct: number;
}) {
  return (
    <Card className="p-4">
      <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconClass}`}>
        <Icon className="h-4.5 w-4.5" strokeWidth={1.9} aria-hidden />
      </span>
      <p className="mt-3 text-[22px] lg:text-[24px] font-extrabold text-jaguar-ink">{value}</p>
      <p className="mt-0.5 text-[12px] lg:text-[13px] font-medium text-jaguar-ink/50">{label}</p>
      <p className="mt-1 text-[11px] lg:text-[12px] text-jaguar-ink/35">{pct}%</p>
    </Card>
  );
}

/** Únicamente los 4 conteos de asistencia — sin gráficos, sin reportes. */
export function AttendanceSummaryCards({
  presentes,
  tarde,
  justificados,
  ausentes,
  total,
}: {
  presentes: number;
  tarde: number;
  justificados: number;
  ausentes: number;
  total: number;
}) {
  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <StatCard icon={CheckCircle2} iconClass="bg-jaguar-green-50 text-jaguar-green-600" value={presentes} label="Presentes" pct={pct(presentes)} />
      <StatCard icon={CalendarClock} iconClass="bg-jaguar-gold-500/15 text-jaguar-gold-600" value={tarde} label="Tarde" pct={pct(tarde)} />
      <StatCard
        icon={ShieldCheck}
        iconClass="bg-jaguar-turquoise-500/10 text-jaguar-turquoise-600"
        value={justificados}
        label="Justificados"
        pct={pct(justificados)}
      />
      <StatCard icon={XCircle} iconClass="bg-jaguar-maroon-500/10 text-jaguar-maroon-600" value={ausentes} label="Ausentes" pct={pct(ausentes)} />
    </div>
  );
}
