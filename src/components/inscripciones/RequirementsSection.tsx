"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { requirementItems } from "./inscripciones.data";

/** Requisitos — lo que se necesita para completar la inscripción. */
export function RequirementsSection() {
  return (
    <section className="bg-jaguar-white px-4 py-16 md:px-8 md:py-24 lg:px-12">
      <div className="mx-auto max-w-[900px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-[24px] bg-jaguar-mist/60 p-8 md:p-12"
        >
          <h2 className="text-center font-display text-2xl uppercase leading-none tracking-tight text-jaguar-ink md:text-3xl">
            ¿Qué necesitas?
          </h2>
          <ul className="mt-9 space-y-4">
            {requirementItems.map((item) => (
              <li key={item.id} className="flex items-start gap-3 text-[14px] leading-relaxed text-jaguar-ink/75">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-jaguar-green-600" strokeWidth={1.8} aria-hidden />
                {item.text}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
