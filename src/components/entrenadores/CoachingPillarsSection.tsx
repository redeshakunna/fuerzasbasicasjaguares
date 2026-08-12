"use client";

import { motion } from "framer-motion";
import { philosophyPillars as coachingPillars } from "./entrenadores.data";

/** Enfoque del cuerpo técnico — 5 pilares del método de entrenamiento. */
export function CoachingPillarsSection() {
  return (
    <section className="bg-jaguar-white px-4 py-16 md:px-8 md:py-24 lg:px-12">
      <div className="mx-auto max-w-[1600px]">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center text-2xl font-extrabold uppercase tracking-tight text-jaguar-ink md:text-3xl"
        >
          Nuestro enfoque de{" "}
          <span className="relative text-jaguar-green-600">
            trabajo
            <span aria-hidden className="absolute inset-x-0 -bottom-1.5 h-[3px] rounded-full bg-jaguar-green-500" />
          </span>
        </motion.h2>

        <div className="mt-14 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-5">
          {coachingPillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: (index % 5) * 0.07, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-start"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-jaguar-green-50 text-jaguar-green-600">
                  <Icon className="h-5 w-5" strokeWidth={1.8} aria-hidden />
                </span>
                <h3 className="mt-4 text-[13px] font-bold uppercase tracking-[0.03em] text-jaguar-ink">
                  {pillar.title}
                </h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-jaguar-ink/55">{pillar.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
