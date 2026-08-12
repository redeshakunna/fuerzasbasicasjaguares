"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import type { CategoryContent } from "./categorias.data";

/**
 * Fila de categoría — foto/placeholder a un lado, contenido al otro,
 * alternando el lado en cada fila para dar ritmo editorial. Las categorías
 * sin plantel activo usan un panel con el numeral en watermark en vez de
 * una foto de jugadores que todavía no existen.
 */
export function CategoryRow({ category, reverse = false }: { category: CategoryContent; reverse?: boolean }) {
  const number = category.id.replace("Sub-", "");

  return (
    <section id={category.id.toLowerCase()} className="bg-jaguar-white px-4 py-14 md:px-8 lg:px-12">
      <div className="mx-auto grid max-w-[1600px] grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className={reverse ? "lg:order-2" : undefined}
        >
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-display text-4xl uppercase leading-none tracking-tight text-jaguar-ink md:text-5xl">
              {category.id}
            </h2>
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ${
                category.active
                  ? "bg-jaguar-green-50 text-jaguar-green-600"
                  : "bg-jaguar-gold-500/15 text-jaguar-gold-700"
              }`}
            >
              {category.active ? "Categoría activa" : "Próximamente"}
            </span>
          </div>
          <p className="mt-2 text-[13px] font-semibold uppercase tracking-[0.1em] text-jaguar-ink/45">
            {category.ageRange}
          </p>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-jaguar-ink/65">{category.description}</p>

          {category.stats ? (
            <div className="mt-7 grid max-w-sm grid-cols-3 gap-4">
              {category.stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.id} className="flex flex-col items-start gap-1">
                    <Icon className="h-6 w-6 text-jaguar-green-600" strokeWidth={1.7} aria-hidden />
                    <span className="mt-1 text-2xl font-extrabold leading-none text-jaguar-ink">{stat.value}</span>
                    <span className="text-[10px] font-bold uppercase leading-tight tracking-[0.03em] text-jaguar-ink/50">
                      {stat.label}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-6 inline-flex items-start gap-2.5 rounded-xl bg-jaguar-mist/70 px-4 py-3.5 text-[12.5px] leading-relaxed text-jaguar-ink/55">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-jaguar-gold-600" strokeWidth={1.8} aria-hidden />
              Esta categoría se abrirá en una próxima fase de crecimiento del club.
            </div>
          )}

          {category.ctaHref && category.ctaLabel ? (
            <Link
              href={category.ctaHref}
              className="group mt-8 inline-flex w-fit items-center gap-2 rounded-full border-2 border-jaguar-green-500 px-6 py-2.5 text-[13px] font-bold uppercase tracking-[0.1em] text-jaguar-green-600 transition-colors hover:bg-jaguar-green-50"
            >
              {category.ctaLabel}
              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                strokeWidth={2.25}
                aria-hidden
              />
            </Link>
          ) : null}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className={`relative aspect-[16/11] w-full overflow-hidden rounded-3xl shadow-[0_30px_80px_-40px_rgba(13,18,16,0.3)] ${
            reverse ? "lg:order-1" : ""
          }`}
        >
          {category.photoSrc ? (
            <>
              <Image
                src={category.photoSrc}
                alt={`Plantel ${category.id} de Fuerzas Básicas Jaguares de Córdoba`}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-jaguar-ink/25 via-transparent to-transparent" />
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-jaguar-mist to-jaguar-white">
              <span
                aria-hidden
                className="select-none font-display text-[9rem] leading-none text-transparent [-webkit-text-stroke:2px_rgba(13,18,16,0.1)] md:text-[12rem]"
              >
                {number}
              </span>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
