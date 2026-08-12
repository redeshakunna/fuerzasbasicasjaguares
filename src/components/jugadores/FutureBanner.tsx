"use client";

import { motion } from "framer-motion";

/** Franja de cierre — mismo tratamiento oscuro que el resto del sitio interior. */
export function FutureBanner() {
  return (
    <section className="bg-jaguar-ink px-4 py-14 md:px-8 lg:px-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto flex max-w-[1600px] flex-col items-start justify-between gap-8 md:flex-row md:items-center"
      >
        <h2 className="font-display text-3xl uppercase leading-none tracking-tight text-jaguar-white md:text-4xl">
          El futuro <span className="text-jaguar-green-500">comienza hoy</span>
        </h2>
        <div className="text-left md:text-right">
          <p className="text-[13px] leading-relaxed text-jaguar-white/55">
            Cada entrenamiento construye una historia.
            <br />
            Cada partido deja una experiencia.
            <br />
            Cada jugador tiene un camino.
          </p>
          <p className="mt-3 font-display text-lg uppercase tracking-tight text-jaguar-green-500">#SomosJaguares</p>
        </div>
      </motion.div>
    </section>
  );
}
