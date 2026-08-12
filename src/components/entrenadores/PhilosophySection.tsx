"use client";

import { motion } from "framer-motion";
import { philosophyPillars } from "./entrenadores.data";

/** "Nuestra filosofía" — franja oscura con los 4 pilares del enfoque técnico. */
export function PhilosophySection() {
  return (
    <section className="relative overflow-hidden bg-jaguar-ink px-4 py-16 md:px-8 md:py-20 lg:px-12">
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.05] [background:repeating-linear-gradient(115deg,white_0px,white_2px,transparent_2px,transparent_18px)]"
      />
      <div className="relative mx-auto flex max-w-[1600px] flex-col gap-10 lg:flex-row lg:items-center lg:gap-16">
        <div className="max-w-xs shrink-0">
          <h2 className="font-display text-3xl uppercase leading-[0.95] tracking-tight text-jaguar-white md:text-4xl">
            Nuestra <span className="text-jaguar-green-500">filosofía</span>
          </h2>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {philosophyPillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-jaguar-white/10 text-jaguar-green-500">
                  <Icon className="h-5 w-5" strokeWidth={1.8} aria-hidden />
                </span>
                <h3 className="mt-4 text-[13px] font-bold uppercase tracking-[0.03em] text-jaguar-white">
                  {pillar.title}
                </h3>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-jaguar-white/50">{pillar.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
