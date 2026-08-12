"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardHeader } from "../ui/Card";
import { formatCOP } from "@/lib/finance/format";

const palette = ["#145c2c", "#17b8bd", "#e0a723", "#6e1b2b"];

/** Desglose de métodos de pago usados en la temporada — derivado de los pagos reales. */
export function PaymentMethodsDonut({ breakdown }: { breakdown: { method: string; amount: number; pct: number }[] }) {
  const total = breakdown.reduce((sum, b) => sum + b.amount, 0);

  return (
    <Card className="pb-6">
      <CardHeader title="Métodos de pago" subtitle="Distribución de lo recaudado" />
      {total === 0 ? (
        <p className="px-6 py-10 text-center text-[12.5px] lg:text-[13.5px] text-jaguar-ink/45">
          Aún no hay pagos registrados para mostrar la distribución.
        </p>
      ) : (
        <div className="mt-2 flex flex-col items-center gap-5 px-6">
          <div className="relative h-[150px] w-[150px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={breakdown} dataKey="amount" nameKey="method" innerRadius={48} outerRadius={68} paddingAngle={3} stroke="none">
                  {breakdown.map((slice, i) => (
                    <Cell key={slice.method} fill={palette[i % palette.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCOP(Number(value))}
                  contentStyle={{ borderRadius: 12, border: "1px solid #0d12101a", fontSize: 12.5 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[15px] lg:text-[16.5px] font-extrabold text-jaguar-ink">{formatCOP(total)}</span>
              <span className="text-[10px] lg:text-[11px] font-medium text-jaguar-ink/45">recaudado</span>
            </div>
          </div>

          <div className="grid w-full grid-cols-1 gap-2">
            {breakdown.map((slice, i) => (
              <div key={slice.method} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: palette[i % palette.length] }} />
                <p className="flex-1 text-[12.5px] lg:text-[13.5px] font-medium text-jaguar-ink/70">{slice.method}</p>
                <p className="text-[12.5px] lg:text-[13.5px] font-bold text-jaguar-ink">{slice.pct}%</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
