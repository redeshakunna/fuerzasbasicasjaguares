"use client";

import { motion } from "framer-motion";
import { CalendarDays, Shirt, Trophy, Users } from "lucide-react";
import type { PublicHomeStats } from "@/lib/data/public-stats";

/** "Nuestro impacto" — cifras reales del club, no aspiracionales. */
export function ImpactStatsSection({ stats }: { stats: PublicHomeStats }) {
  const items = [
    { id: "jugadores", icon: Users, value: stats.jugadoresActivos, label: "Jugadores en formación" },
    { id: "cuerpo-tecnico", icon: Shirt, value: stats.cuerpoTecnico, label: "Cuerpo técnico" },
    { id: "entrenamientos", icon: CalendarDays, value: stats.entrenamientosRecientes, label: "Entrenamientos recientes" },
    { id: "partidos", icon: Trophy, value: stats.partidosProgramados, label: "Partidos programados" },
  ];

  return (
    <section className="bg-jaguar-white px-4 py-16 md:px-8 md:py-20 lg:px-12">
      <div className="mx-auto max-w-[1600px]">
        <h2 className="text-center font-display text-2xl uppercase leading-none tracking-tight text-jaguar-ink md:text-3xl">
          Nuestro <span className="text-jaguar-green-600">impacto</span>
        </h2>

        <div className="mt-12 grid grid-cols-2 gap-y-10 sm:grid-cols-4">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center text-center"
              >
                <Icon className="h-7 w-7 text-jaguar-green-600" strokeWidth={1.7} aria-hidden />
                <span className="mt-2 font-display text-3xl leading-none text-jaguar-ink">{item.value}</span>
                <span className="mt-1.5 max-w-[130px] text-[11px] font-bold uppercase leading-tight tracking-[0.03em] text-jaguar-ink/50">
                  {item.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
