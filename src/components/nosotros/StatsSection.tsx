"use client";

import { motion } from "framer-motion";
import { nosotrosStats } from "./nosotros.data";

/** Franja de cifras — números reales del punto de partida, no aspiracionales. */
export function StatsSection() {
  return (
    <section className="bg-jaguar-white px-4 pb-16 md:px-8 md:pb-24 lg:px-12">
      <div className="mx-auto max-w-[1600px] rounded-[24px] bg-jaguar-mist/60 px-6 py-10 md:px-10">
        <div className="grid grid-cols-2 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
          {nosotrosStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center text-center"
              >
                <Icon className="h-7 w-7 text-jaguar-green-600" strokeWidth={1.7} aria-hidden />
                <span className="mt-2 font-display text-3xl leading-none text-jaguar-ink">{stat.value}</span>
                <span className="mt-1.5 max-w-[120px] text-[11px] font-bold uppercase leading-tight tracking-[0.03em] text-jaguar-ink/50">
                  {stat.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
