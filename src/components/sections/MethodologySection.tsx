"use client";

import { motion } from "framer-motion";
import { methodologyPillars } from "./methodology.data";

type IconAccent = "green" | "maroon" | "turquoise" | "gold";

const iconColorClass: Record<IconAccent, string> = {
  green: "text-jaguar-green-600",
  maroon: "text-jaguar-maroon-500",
  turquoise: "text-jaguar-turquoise-500",
  gold: "text-jaguar-gold-500",
};

/**
 * Sección "Nuestra Metodología".
 *
 * Vive como bloque independiente DESPUÉS del Hero — ya no se superpone
 * ni queda visualmente "dentro" del slider (sin negative margin, sin
 * tarjeta flotante). Fondo plano, mismo blanco de la página.
 */
export function MethodologySection() {
  return (
    <section id="metodologia" className="bg-jaguar-white px-4 py-20 md:px-8 md:py-24 lg:px-12">
      <div className="mx-auto max-w-[1600px]">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center text-2xl font-extrabold uppercase tracking-tight text-jaguar-ink md:text-3xl"
        >
          Nuestra{" "}
          <span className="relative text-jaguar-green-600">
            Metodología
            <span
              aria-hidden
              className="absolute inset-x-0 -bottom-1.5 h-[3px] rounded-full bg-jaguar-green-500"
            />
          </span>
        </motion.h2>

        <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-14 sm:grid-cols-3 lg:grid-cols-5 lg:divide-x lg:divide-jaguar-ink/8 lg:gap-y-0">
          {methodologyPillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="flex flex-col items-center px-2 text-center lg:px-8"
              >
                <Icon
                  className={`h-16 w-16 md:h-[72px] md:w-[72px] ${iconColorClass[pillar.accent as IconAccent]}`}
                  strokeWidth={1.4}
                  aria-hidden
                />
                <h3 className="mt-5 text-[13px] font-bold uppercase tracking-[0.06em] text-jaguar-ink">
                  {pillar.title}
                </h3>
                <p className="mt-2 max-w-[220px] text-[13px] leading-relaxed text-jaguar-ink/60">
                  {pillar.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
