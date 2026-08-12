"use client";

import { motion } from "framer-motion";
import { nosotrosPillars } from "./nosotros.data";

/** Franja de 5 tarjetas — Misión, Visión, Valores, Enfoque, Propósito. */
export function PillarsSection() {
  return (
    <section className="bg-jaguar-mist/60 px-4 py-14 md:px-8 md:py-16 lg:px-12">
      <div className="mx-auto max-w-[1600px] rounded-[24px] border border-jaguar-ink/6 bg-jaguar-white p-8 shadow-[0_20px_60px_-40px_rgba(13,18,16,0.15)] md:p-10">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
          {nosotrosPillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="text-center"
              >
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-jaguar-green-600 text-jaguar-white">
                  <Icon className="h-6 w-6" strokeWidth={1.7} aria-hidden />
                </span>
                <h3 className="mt-4 text-[13px] font-bold uppercase tracking-[0.05em] text-jaguar-ink">
                  {pillar.title}
                </h3>
                <p className="mt-2 text-[12.5px] leading-relaxed text-jaguar-ink/55">{pillar.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
