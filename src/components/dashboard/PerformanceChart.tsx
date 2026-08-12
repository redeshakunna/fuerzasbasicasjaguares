"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Percent, Target, Trophy, TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type {
  MatchPoint,
  PerformancePeriod,
  TeamPerformancePoint,
  TeamPerformanceSummary,
} from "@/lib/data/team-performance";
import { Card, CardHeader } from "./ui/Card";

const periods: PerformancePeriod[] = ["semana", "mes", "temporada"];

const performancePeriodLabel: Record<PerformancePeriod, string> = {
  semana: "Semana",
  mes: "Mes",
  temporada: "Temporada",
};

const outcomeHex: Record<MatchPoint["outcome"], string> = {
  Programado: "#17b8bd",
  Ganado: "#145c2c",
  Perdido: "#6e1b2b",
  Empatado: "#e0a723",
};

const outcomeTextClass: Record<MatchPoint["outcome"], string> = {
  Programado: "text-jaguar-turquoise-600",
  Ganado: "text-jaguar-green-700",
  Perdido: "text-jaguar-maroon-600",
  Empatado: "text-jaguar-gold-700",
};

function StatPill({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-2xl border border-jaguar-ink/8 bg-jaguar-mist/50 px-3.5 py-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-jaguar-turquoise-400 to-jaguar-green-600 text-white">
        <Icon className="h-4 w-4" strokeWidth={2.2} aria-hidden />
      </div>
      <div>
        <p className="text-[13.5px] lg:text-[15px] font-extrabold leading-none text-jaguar-ink">{value}</p>
        <p className="mt-1 text-[10.5px] lg:text-[11.5px] font-semibold uppercase tracking-[0.03em] text-jaguar-ink/40">{label}</p>
      </div>
    </div>
  );
}

/** Punto con datos reales → círculo con anillo blanco; si hubo un partido ese día, un anillo dorado extra. */
function ChartDot(props: { cx?: number; cy?: number; payload?: TeamPerformancePoint }) {
  const { cx, cy, payload } = props;
  if (cx == null || cy == null || !payload || payload.value === null) return null;
  const hasMatch = payload.matches.length > 0;
  return (
    <g>
      {hasMatch ? <circle cx={cx} cy={cy} r={8} fill="none" stroke="#e0a723" strokeWidth={2} /> : null}
      <circle cx={cx} cy={cy} r={4.5} fill="#ffffff" stroke="#145c2c" strokeWidth={2.5} />
    </g>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { payload: TeamPerformancePoint }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <div className="rounded-xl border border-jaguar-ink/10 bg-white px-3.5 py-3 shadow-[0_10px_28px_-12px_rgba(13,18,16,0.28)]">
      <p className="text-[10.5px] lg:text-[11.5px] font-bold uppercase tracking-[0.04em] text-jaguar-ink/40">{label}</p>
      {point.value !== null ? (
        <p className="mt-1 text-[16px] lg:text-[17.5px] font-extrabold leading-none text-jaguar-green-700">
          {point.value.toFixed(1)}
          <span className="ml-1 text-[11px] lg:text-[12px] font-semibold text-jaguar-ink/40">
            / 10 · {point.sampleSize} evaluación{point.sampleSize === 1 ? "" : "es"}
          </span>
        </p>
      ) : (
        <p className="mt-1 text-[12.5px] lg:text-[13.5px] font-medium text-jaguar-ink/35">Sin evaluaciones registradas</p>
      )}
      {point.matches.map((m) => (
        <div key={m.id} className={`mt-1.5 flex items-center gap-1.5 text-[12px] lg:text-[13px] font-bold ${outcomeTextClass[m.outcome]}`}>
          <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: outcomeHex[m.outcome] }} />
          vs. {m.opponent} · {m.ourScore}-{m.opponentScore}
        </div>
      ))}
    </div>
  );
}

/** Chips de resultados reales de partidos dentro del período seleccionado — visibilidad directa de goles y marcador. */
function MatchChips({ data }: { data: TeamPerformancePoint[] }) {
  const matches = data.flatMap((p) => p.matches);
  if (matches.length === 0) return null;

  return (
    <div className="mt-4 flex flex-wrap gap-2 border-t border-jaguar-ink/6 pt-4">
      {matches.map((m) => (
        <div
          key={m.id}
          className="flex items-center gap-2 rounded-xl border border-jaguar-ink/8 bg-white px-3 py-1.5 text-[12px] lg:text-[13px] font-semibold text-jaguar-ink/70"
        >
          <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: outcomeHex[m.outcome] }} />
          <span>{m.isHome ? "vs." : "@"} {m.opponent}</span>
          <span className={`font-extrabold ${outcomeTextClass[m.outcome]}`}>
            {m.ourScore}-{m.opponentScore}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Rendimiento del equipo — promedio real de evaluaciones del plantel + partidos reales superpuestos. */
export function PerformanceChart({ series, summary }: { series: Record<PerformancePeriod, TeamPerformancePoint[]>; summary: TeamPerformanceSummary }) {
  const [period, setPeriod] = useState<PerformancePeriod>("semana");
  const data = series[period];
  const hasData = useMemo(() => data.some((p) => p.value !== null), [data]);

  return (
    <Card className="pb-6">
      <CardHeader
        title="Rendimiento del equipo"
        subtitle="Promedio real de evaluaciones del plantel Sub-15"
        action={
          <div className="flex items-center gap-1 rounded-xl bg-jaguar-mist/60 p-1">
            {periods.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`rounded-lg px-3 py-1.5 text-[12px] lg:text-[13px] font-semibold transition-colors ${
                  period === p ? "bg-white text-jaguar-ink shadow-sm" : "text-jaguar-ink/45 hover:text-jaguar-ink/70"
                }`}
              >
                {performancePeriodLabel[p]}
              </button>
            ))}
          </div>
        }
      />

      <div className="mt-4 flex flex-wrap gap-2.5 px-6">
        <StatPill icon={TrendingUp} label="Promedio equipo" value={summary.averageScore !== null ? `${summary.averageScore.toFixed(1)} / 10` : "Sin datos"} />
        <StatPill icon={Trophy} label="Partidos jugados" value={String(summary.played)} />
        <StatPill icon={Target} label="Goles a favor" value={String(summary.goalsFor)} />
        <StatPill icon={Percent} label="Efectividad" value={summary.effectiveness !== null ? `${summary.effectiveness}%` : "—"} />
      </div>

      {hasData ? (
        <motion.div
          key={period}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="mt-5 h-[240px] px-2 pr-6"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="performanceFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#17b8bd" stopOpacity={0.28} />
                  <stop offset="55%" stopColor="#1f7a3d" stopOpacity={0.14} />
                  <stop offset="100%" stopColor="#1f7a3d" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="performanceStroke" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#17b8bd" />
                  <stop offset="100%" stopColor="#145c2c" />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#0d12100f" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#0d121066" }} />
              <YAxis domain={[0, 10]} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#0d121066" }} width={26} />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="url(#performanceStroke)"
                strokeWidth={3}
                fill="url(#performanceFill)"
                dot={<ChartDot />}
                connectNulls={false}
                activeDot={{ r: 6, stroke: "#145c2c", strokeWidth: 2, fill: "#ffffff" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      ) : (
        <div className="mx-6 mt-5 flex h-[240px] flex-col items-center justify-center rounded-2xl bg-jaguar-mist/40 text-center">
          <p className="text-[13.5px] lg:text-[15px] font-bold text-jaguar-ink/50">Aún no hay evaluaciones para este período.</p>
          <p className="mt-1 max-w-xs text-[12px] lg:text-[13px] text-jaguar-ink/35">
            En cuanto el cuerpo técnico evalúe entrenamientos o partidos, la tendencia real aparecerá aquí.
          </p>
        </div>
      )}

      <div className="px-6">
        <MatchChips data={data} />
      </div>
    </Card>
  );
}
