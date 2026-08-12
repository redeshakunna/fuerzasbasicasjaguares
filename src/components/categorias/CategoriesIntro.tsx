"use client";

import { motion } from "framer-motion";

/** Apertura de la página — encuadra las 3 categorías como un mismo camino formativo. */
export function CategoriesIntro() {
  return (
    <section className="bg-jaguar-white px-4 pb-4 pt-16 md:px-8 md:pt-20 lg:px-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-[760px] text-center"
      >
        <span className="inline-block text-[13px] font-semibold uppercase tracking-[0.28em] text-jaguar-green-600">
          Formación por etapas
        </span>
        <h2 className="mt-4 font-display text-3xl uppercase leading-[0.95] tracking-tight text-jaguar-ink md:text-4xl">
          Tres categorías, <span className="text-jaguar-green-600">un mismo camino</span>
        </h2>
        <p className="mt-6 text-[15px] leading-relaxed text-jaguar-ink/65">
          Sub-13, Sub-15 y Sub-17 son las tres etapas formativas de Jaguares de Córdoba. Hoy arrancamos con la Sub-15
          como categoría activa — Sub-13 y Sub-17 se irán abriendo a medida que crece el proyecto.
        </p>
      </motion.div>
    </section>
  );
}
