import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { kpiCards, type KpiCard } from "./data/kpis.data";
import { Card } from "./ui/Card";

/** Cuadros de icono en color sólido — vibrante, alto contraste. */
const accentClass = {
  green: "bg-jaguar-green-600 text-white",
  turquoise: "bg-jaguar-turquoise-500 text-white",
  violet: "bg-violet-500 text-white",
  gold: "bg-jaguar-gold-500 text-jaguar-ink",
  maroon: "bg-jaguar-maroon-500 text-white",
  blue: "bg-sky-500 text-white",
};

const trendIcon = { up: ArrowUpRight, down: ArrowDownRight, flat: Minus };
const trendClass = { up: "text-jaguar-green-600", down: "text-jaguar-maroon-500", flat: "text-jaguar-ink/40" };
const trendToneClass = { green: "text-jaguar-green-600", maroon: "text-jaguar-maroon-500", neutral: "text-jaguar-ink/40" };

interface KpiGridProps {
  /** Set de KPIs a mostrar — por defecto, los del dashboard principal. */
  items?: KpiCard[];
}

export function KpiGrid({ items = kpiCards }: KpiGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
      {items.map((kpi) => {
        const Icon = kpi.icon;
        const TrendIcon = trendIcon[kpi.trend];
        const deltaClass = kpi.trendTone ? trendToneClass[kpi.trendTone] : trendClass[kpi.trend];
        return (
          <Card key={kpi.id} className="p-5">
            <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${accentClass[kpi.accent]}`}>
              <Icon className="h-5 w-5" strokeWidth={1.9} aria-hidden />
            </span>
            <p className="mt-4 text-2xl font-extrabold text-jaguar-ink">{kpi.value}</p>
            <p className="mt-0.5 text-[12.5px] lg:text-[13.5px] font-medium text-jaguar-ink/55">{kpi.label}</p>
            <p className={`mt-2 flex items-center gap-1 text-[11.5px] lg:text-[12.5px] font-semibold ${deltaClass}`}>
              <TrendIcon className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
              {kpi.delta}
            </p>
          </Card>
        );
      })}
    </div>
  );
}
