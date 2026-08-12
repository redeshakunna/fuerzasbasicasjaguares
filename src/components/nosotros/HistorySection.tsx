"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

/** "Nuestra historia" — texto + grilla de 3 fotos (1 grande, 2 apiladas). */
export function HistorySection() {
  return (
    <section id="historia" className="bg-jaguar-white px-4 py-16 md:px-8 md:py-24 lg:px-12">
      <div className="mx-auto grid max-w-[1600px] grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="order-2 lg:order-1"
        >
          <span className="inline-block text-[13px] font-semibold uppercase tracking-[0.28em] text-jaguar-green-600">
            Nuestra historia
          </span>
          <h2 className="mt-4 font-display text-3xl uppercase leading-[0.95] tracking-tight text-jaguar-ink md:text-4xl">
            Un sueño que nació
            <br />
            <span className="text-jaguar-green-600">en Córdoba</span>
          </h2>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-jaguar-ink/65">
            Fuerzas Básicas Jaguares de Córdoba nació del amor por el fútbol y el compromiso con la formación
            integral de niños y jóvenes. Creemos en el talento local y trabajamos cada día para abrir caminos dentro
            y fuera de la cancha.
          </p>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-jaguar-ink/65">
            Arrancamos con la categoría Sub-15 y una convicción clara: crecer junto a las familias que confían en
            este proyecto, compartiendo la misma pasión por formar campeones — en el juego y en la vida.
          </p>

          <Link
            href="/#metodologia"
            className="group mt-8 inline-flex w-fit items-center gap-2 rounded-full border-2 border-jaguar-green-500 px-6 py-2.5 text-[13px] font-bold uppercase tracking-[0.1em] text-jaguar-green-600 transition-colors hover:bg-jaguar-green-50"
          >
            Conoce nuestra metodología
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.25} aria-hidden />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="order-1 grid grid-cols-2 gap-4 lg:order-2"
        >
          <div className="relative row-span-2 aspect-[3/4] overflow-hidden rounded-2xl shadow-[0_20px_50px_-30px_rgba(13,18,16,0.35)]">
            <Image
              src="/hero/slide-02-proposito.jpg"
              alt="Jugador de Fuerzas Básicas Jaguares de Córdoba en entrenamiento"
              fill
              sizes="(min-width: 1024px) 25vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="relative aspect-square overflow-hidden rounded-2xl shadow-[0_20px_50px_-30px_rgba(13,18,16,0.35)]">
            <Image
              src="/brand/Slider Banner.png"
              alt="Plantel Sub-15 de Fuerzas Básicas Jaguares de Córdoba"
              fill
              sizes="(min-width: 1024px) 25vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="relative aspect-square overflow-hidden rounded-2xl shadow-[0_20px_50px_-30px_rgba(13,18,16,0.35)]">
            <Image
              src="/brand/stadium-stock.jpg"
              alt="Instalaciones deportivas"
              fill
              sizes="(min-width: 1024px) 25vw, 50vw"
              className="object-cover"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
