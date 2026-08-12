"use client";

import { motion } from "framer-motion";
import { playerJourney } from "./jugadores.data";

/** El camino del jugador — stepper horizontal de 6 etapas. */
export function JourneySection() {
  return (
    <section className="bg-jaguar-white px-4 py-16 md:px-8 md:py-24 lg:px-12">
      <div className="mx-auto max-w-[1600px]">
        <div className="max-w-lg">
          <h2 className="font-display text-3xl uppercase leading-[0.95] tracking-tight text-jaguar-ink md:text-4xl">
            Cada jugador <span className="text-jaguar-green-600">tiene un camino</span>
          </h2>
          <p className="mt-4 text-[14.5px] leading-relaxed text-jaguar-ink/60">
            Seguimos el desarrollo de nuestros jugadores para identificar fortalezas, oportunidades de mejora y
            nuevas metas.
          </p>
        </div>

        <div className="relative mt-14 grid grid-cols-2 gap-y-10 sm:grid-cols-3 lg:grid-cols-6 lg:gap-x-4">
          <div
            aria-hidden
            className="absolute left-0 right-0 top-6 hidden h-px border-t border-dashed border-jaguar-ink/15 lg:block"
          />
          {playerJourney.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="relative flex flex-col items-center text-center"
              >
                <span className="relative flex h-12 w-12 items-center justify-center rounded-full border-2 border-jaguar-green-500 bg-jaguar-white text-jaguar-green-600">
                  <Icon className="h-5 w-5" strokeWidth={1.8} aria-hidden />
                </span>
                <span className="mt-4 text-[11.5px] font-bold uppercase tracking-[0.04em] text-jaguar-ink">
                  {step.title}
                </span>
                <span className="mt-1.5 max-w-[140px] text-[11.5px] leading-snug text-jaguar-ink/50">
                  {step.description}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
