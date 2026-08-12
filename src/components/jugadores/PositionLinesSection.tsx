"use client";

import { motion } from "framer-motion";
import { positionLines } from "./jugadores.data";

/** Las 4 líneas de formación — qué se trabaja en cada posición. */
export function PositionLinesSection() {
  return (
    <section className="bg-jaguar-mist/40 px-4 py-16 md:px-8 md:py-24 lg:px-12">
      <div className="mx-auto max-w-[1600px]">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center text-2xl font-extrabold uppercase tracking-tight text-jaguar-ink md:text-3xl"
        >
          Formación por{" "}
          <span className="relative text-jaguar-green-600">
            línea
            <span aria-hidden className="absolute inset-x-0 -bottom-1.5 h-[3px] rounded-full bg-jaguar-green-500" />
          </span>
        </motion.h2>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {positionLines.map((line, index) => {
            const Icon = line.icon;
            return (
              <motion.div
                key={line.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-2xl bg-jaguar-white p-7 shadow-[0_1px_2px_rgba(13,18,16,0.04)]"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-jaguar-green-50 text-jaguar-green-600">
                  <Icon className="h-6 w-6" strokeWidth={1.7} aria-hidden />
                </span>
                <h3 className="mt-5 font-display text-xl uppercase leading-none tracking-tight text-jaguar-ink">
                  {line.name}
                </h3>
                <p className="mt-3 text-[13.5px] leading-relaxed text-jaguar-ink/60">{line.focus}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
