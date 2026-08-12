"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import type { Category } from "@/lib/data/categories";

/**
 * Estado "próximamente" para /jugadores?categoria=Sub-13|Sub-17 — mismo
 * tratamiento visual (numeral en watermark) que las filas sin plantel en
 * /categorias, para que el sitio se sienta consistente entre ambas páginas.
 */
export function ComingSoonCategorySection({ category }: { category: Category }) {
  const number = category.replace("Sub-", "");

  return (
    <section className="bg-jaguar-white px-4 py-20 md:px-8 lg:px-12">
      <div className="mx-auto grid max-w-[1600px] grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-display text-4xl uppercase leading-none tracking-tight text-jaguar-ink md:text-5xl">
              {category}
            </h2>
            <span className="rounded-full bg-jaguar-gold-500/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-jaguar-gold-700">
              Próximamente
            </span>
          </div>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-jaguar-ink/65">
            Esta categoría aún no tiene plantel activo — es parte del camino de crecimiento de las Fuerzas Básicas
            Jaguares de Córdoba. Hoy nuestra categoría en formación competitiva es la Sub-15.
          </p>

          <div className="mt-6 inline-flex items-start gap-2.5 rounded-xl bg-jaguar-mist/70 px-4 py-3.5 text-[12.5px] leading-relaxed text-jaguar-ink/55">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-jaguar-gold-600" strokeWidth={1.8} aria-hidden />
            Esta categoría se abrirá en una próxima fase de crecimiento del club.
          </div>

          <Link
            href="/jugadores?categoria=Sub-15"
            className="group mt-8 inline-flex w-fit items-center gap-2 rounded-full border-2 border-jaguar-green-500 px-6 py-2.5 text-[13px] font-bold uppercase tracking-[0.1em] text-jaguar-green-600 transition-colors hover:bg-jaguar-green-50"
          >
            Ver plantel Sub-15
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
              strokeWidth={2.25}
              aria-hidden
            />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex aspect-[16/11] w-full items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-jaguar-mist to-jaguar-white shadow-[0_30px_80px_-40px_rgba(13,18,16,0.3)]"
        >
          <span
            aria-hidden
            className="select-none font-display text-[9rem] leading-none text-transparent [-webkit-text-stroke:2px_rgba(13,18,16,0.1)] md:text-[12rem]"
          >
            {number}
          </span>
        </motion.div>
      </div>
    </section>
  );
}
