"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

function ArrowIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden>
      <path d="M2 8h11M8.5 3.5 13 8l-4.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" aria-hidden>
      <path d="M4 2.5v11l10-5.5-10-5.5Z" fill="currentColor" />
    </svg>
  );
}

/** "Somos Jaguares" — presentación institucional, primer bloque de la página. */
export function IntroSection() {
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
            Somos Jaguares
          </span>
          <h2 className="mt-4 font-display text-4xl uppercase leading-[0.95] tracking-tight text-jaguar-ink md:text-5xl">
            Formamos talento,
            <br />
            <span className="text-jaguar-green-600">construimos sueños</span>
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-jaguar-ink/65">
            En las Fuerzas Básicas de Jaguares de Córdoba formamos personas íntegras y futbolistas con disciplina,
            pasión y propósito. Trabajamos cada día para abrir caminos, crear oportunidades y transformar vidas a
            través del fútbol.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="#historia"
              className="group inline-flex items-center gap-2.5 rounded-full bg-jaguar-green-600 px-6 py-3.5 text-[13px] font-semibold uppercase tracking-[0.14em] text-jaguar-white shadow-[0_10px_30px_-10px_rgba(20,92,44,0.55)] transition-transform hover:scale-[1.03]"
            >
              Conoce nuestra historia
              <ArrowIcon />
            </Link>
            <Link
              href="#video"
              className="group inline-flex items-center gap-2.5 rounded-full border border-jaguar-ink/20 px-6 py-3.5 text-[13px] font-semibold uppercase tracking-[0.14em] text-jaguar-ink transition-colors hover:bg-jaguar-ink/5"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-jaguar-ink/10">
                <PlayIcon />
              </span>
              Ver video
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl shadow-[0_30px_80px_-40px_rgba(13,18,16,0.35)] md:aspect-[16/11]"
        >
          <Image
            src="/hero/slide-01-origen.jpg"
            alt="Jugadores de las Fuerzas Básicas Jaguares de Córdoba en plena acción"
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
