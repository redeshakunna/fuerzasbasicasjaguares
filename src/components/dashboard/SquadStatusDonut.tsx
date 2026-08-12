"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { SquadStatusSlice } from "./data/squad.data";
import { Card, CardHeader } from "./ui/Card";

/** Estado general del plantel — donut disponibles/suspendidos/lesionados. */
export function SquadStatusDonut({ slices }: { slices: SquadStatusSlice[] }) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);

  return (
    <Card className="pb-6">
      <CardHeader title="Estado del plantel" subtitle={`${total} jugadores en total`} />
      {total === 0 ? (
        <p className="px-6 py-10 text-center text-[12.5px] lg:text-[13.5px] text-jaguar-ink/45">
          El estado del plantel aparecerá aquí cuando registres jugadores.
        </p>
      ) : (
        <div className="mt-2 flex flex-col items-center gap-6 px-6 sm:flex-row">
          <div className="relative h-[180px] w-[180px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={slices}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={58}
                  outerRadius={80}
                  paddingAngle={3}
                  stroke="none"
                >
                  {slices.map((slice) => (
                    <Cell key={slice.id} fill={slice.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #0d12101a",
                    fontSize: 12.5,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold text-jaguar-ink">{total}</span>
              <span className="text-[10.5px] lg:text-[11.5px] font-medium text-jaguar-ink/45">jugadores</span>
            </div>
          </div>

          <div className="grid flex-1 grid-cols-2 gap-3">
            {slices.map((slice) => (
              <div key={slice.id} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: slice.color }}
                />
                <div>
                  <p className="text-[13px] lg:text-[14px] font-bold text-jaguar-ink">{slice.value}</p>
                  <p className="text-[11.5px] lg:text-[12.5px] text-jaguar-ink/50">{slice.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
