"use client";

import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Card, CardHeader } from "../ui/Card";

interface StatSlice {
  id: string;
  label: string;
  value: number;
  color: string;
}

interface QuickStatsProps {
  footHandedness: StatSlice[];
  byPosition: StatSlice[];
  byAge: { age: string; value: number }[];
  totalPlayers: number;
}

/** Estadísticas rápidas del plantel: pie hábil, posición y distribución de edad. */
export function QuickStats({ footHandedness, byPosition, byAge, totalPlayers }: QuickStatsProps) {
  return (
    <Card className="pb-6">
      <CardHeader title="Estadísticas Rápidas" />

      {totalPlayers === 0 ? (
        <p className="px-6 py-8 text-center text-[12.5px] lg:text-[13.5px] text-jaguar-ink/45">
          Las estadísticas aparecerán aquí cuando registres jugadores.
        </p>
      ) : (
        <>
          <div className="mt-4 px-6">
            <p className="text-[11.5px] lg:text-[12.5px] font-bold uppercase tracking-[0.04em] text-jaguar-ink/40">Pie Hábil</p>
            <div className="mt-3 flex items-center gap-4">
              <div className="h-[92px] w-[92px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={footHandedness}
                      dataKey="value"
                      nameKey="label"
                      innerRadius={26}
                      outerRadius={44}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {footHandedness.map((slice) => (
                        <Cell key={slice.id} fill={slice.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #0d12101a", fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="space-y-1.5">
                {footHandedness.map((slice) => (
                  <li key={slice.id} className="flex items-center gap-2 text-[12px] lg:text-[13px]">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: slice.color }} />
                    <span className="text-jaguar-ink/60">{slice.label}</span>
                    <span className="font-semibold text-jaguar-ink">{slice.value}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 border-t border-jaguar-ink/6 px-6 pt-5">
            <p className="text-[11.5px] lg:text-[12.5px] font-bold uppercase tracking-[0.04em] text-jaguar-ink/40">Por Posición</p>
            <ul className="mt-3 space-y-2">
              {byPosition.map((pos) => (
                <li key={pos.id} className="flex items-center gap-2.5 text-[12.5px] lg:text-[13.5px]">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: pos.color }} />
                  <span className="flex-1 text-jaguar-ink/65">{pos.label}</span>
                  <span className="font-semibold text-jaguar-ink">{pos.value}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 border-t border-jaguar-ink/6 px-6 pt-5">
            <p className="text-[11.5px] lg:text-[12.5px] font-bold uppercase tracking-[0.04em] text-jaguar-ink/40">Por Edad</p>
            <div className="mt-3 h-[100px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byAge} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                  <XAxis
                    dataKey="age"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#0d121066" }}
                  />
                  <Tooltip
                    cursor={{ fill: "#0d121008" }}
                    contentStyle={{ borderRadius: 12, border: "1px solid #0d12101a", fontSize: 12 }}
                  />
                  <Bar dataKey="value" fill="#1f7a3d" radius={[6, 6, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
