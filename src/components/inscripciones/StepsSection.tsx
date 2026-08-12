"use client";

import { motion } from "framer-motion";
import { inscriptionSteps } from "./inscripciones.data";

/** Los 4 pasos del proceso de inscripción. */
export function StepsSection() {
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
          El{" "}
          <span className="relative text-jaguar-green-600">
            proceso
            <span aria-hidden className="absolute inset-x-0 -bottom-1.5 h-[3px] rounded-full bg-jaguar-green-500" />
          </span>
        </motion.h2>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {inscriptionSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="relative rounded-2xl bg-jaguar-white p-7 shadow-[0_1px_2px_rgba(13,18,16,0.04)]"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute right-5 top-4 select-none font-display text-4xl leading-none text-jaguar-green-50"
                >
                  0{index + 1}
                </span>
                <span className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-jaguar-green-50 text-jaguar-green-600">
                  <Icon className="h-5 w-5" strokeWidth={1.8} aria-hidden />
                </span>
                <h3 className="relative mt-5 text-[13.5px] font-bold uppercase tracking-[0.03em] text-jaguar-ink">
                  {step.title}
                </h3>
                <p className="relative mt-2 text-[13px] leading-relaxed text-jaguar-ink/55">{step.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
