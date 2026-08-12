"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardHeader } from "../../ui/Card";

export interface EvaluationPoint {
  label: string;
  value: number;
}

/** Evolución del puntaje general (overall_score) a través de las evaluaciones reales del jugador. */
export function EvolucionRendimientoChart({ data }: { data: EvaluationPoint[] }) {
  return (
    <Card className="pb-6">
      <CardHeader title="Evolución de Rendimiento" subtitle="Puntaje general por evaluación" />
      {data.length >= 2 ? (
        <div className="mt-4 h-[220px] px-2 pr-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="evalFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1f7a3d" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#1f7a3d" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#0d12100f" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#0d121066" }} />
              <YAxis
                domain={[0, 10]}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#0d121066" }}
                width={28}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #0d12101a",
                  fontSize: 12.5,
                  boxShadow: "0 8px 24px -12px rgba(13,18,16,0.2)",
                }}
              />
              <Area type="monotone" dataKey="value" stroke="#1f7a3d" strokeWidth={2.5} fill="url(#evalFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-[160px] items-center justify-center px-6">
          <p className="text-center text-[13px] lg:text-[14px] text-jaguar-ink/40">
            Se necesitan al menos 2 evaluaciones para mostrar la evolución.
          </p>
        </div>
      )}
    </Card>
  );
}
