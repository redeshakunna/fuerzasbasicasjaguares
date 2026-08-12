"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

/** Apertura — presenta al cuerpo técnico. */
export function EntrenadoresIntro() {
  return (
    <section className="bg-jaguar-white px-4 py-16 md:px-8 md:py-24 lg:px-12">
      <div className="mx-auto grid max-w-[1600px] grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="inline-block text-[13px] font-semibold uppercase tracking-[0.28em] text-jaguar-green-600">
            Nuestro cuerpo técnico
          </span>
          <h2 className="mt-4 font-display text-4xl uppercase leading-[0.95] tracking-tight text-jaguar-ink md:text-5xl">
            Líderes dentro
            <br />
            <span className="text-jaguar-green-600">y fuera de la cancha</span>
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-jaguar-ink/65">
            Detrás de cada jugador hay un cuerpo técnico comprometido con su desarrollo integral. Su experiencia,
            conocimiento y vocación son fundamentales en la formación de campeones.
          </p>

          <Link
            href="#staff"
            className="group mt-9 inline-flex items-center gap-2.5 rounded-full bg-jaguar-green-600 px-6 py-3.5 text-[13px] font-semibold uppercase tracking-[0.14em] text-jaguar-white shadow-[0_10px_30px_-10px_rgba(20,92,44,0.55)] transition-transform hover:scale-[1.03]"
          >
            Conoce nuestro equipo técnico
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.25} aria-hidden />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl shadow-[0_30px_80px_-40px_rgba(13,18,16,0.35)] md:aspect-[16/11]"
        >
          <Image
            src="/hero/slide-02-proposito.jpg"
            alt="Entrenamiento dirigido por el cuerpo técnico de Fuerzas Básicas Jaguares de Córdoba"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-jaguar-ink/30 via-transparent to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}
