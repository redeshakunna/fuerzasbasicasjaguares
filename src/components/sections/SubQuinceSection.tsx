"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { buildSubQuinceStats, type StatAccent } from "./subquince.data";
import type { PublicHomeStats } from "@/lib/data/public-stats";

const statIconClass: Record<StatAccent, string> = {
  green: "text-jaguar-green-600",
  maroon: "text-jaguar-maroon-500",
  gold: "text-jaguar-gold-500",
};

/**
 * Sección "Sub-15" — única categoría activa del MVP.
 *
 * Usa la foto oficial del plantel (public/brand/Slider Banner.png) como
 * fondo a sangre completa dentro de una tarjeta redondeada; la imagen
 * ya trae su propio negativo en pinceladas verdes a la izquierda, así
 * que el contenido se apoya sobre esa zona igual que en el Hero.
 *
 * Las 4 cifras vienen de `getPublicHomeStats()` (Server Component padre)
 * y se pasan acá como prop — son números planos, no funciones, así que
 * cruzan sin problema el límite servidor→cliente.
 */
export function SubQuinceSection({ stats }: { stats: PublicHomeStats }) {
  const subQuinceStats = buildSubQuinceStats(stats);
  return (
    <section id="sub-15" className="bg-jaguar-white px-4 py-16 md:px-8 md:py-20 lg:px-12">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto max-w-[1600px] overflow-hidden rounded-3xl border border-jaguar-ink/5 shadow-[0_30px_80px_-40px_rgba(13,18,16,0.25)]"
      >
        <div className="relative min-h-[500px] w-full md:min-h-[460px]">
          <Image
            src="/brand/Slider Banner.png"
            alt="Plantel Sub-15 de las Fuerzas Básicas de Jaguares de Córdoba"
            fill
            sizes="100vw"
            className="object-cover object-[78%_center]"
          />

          {/* Refuerzo de legibilidad sobre el negativo de la imagen */}
          <div className="absolute inset-0 bg-gradient-to-r from-jaguar-white via-jaguar-white/70 to-transparent md:via-jaguar-white/45" />

          {/* Watermark "SUB-15" sobre la fotografía, como en la referencia */}
          <span
            aria-hidden
            className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 select-none font-display text-[9rem] leading-none text-transparent [-webkit-text-stroke:1.5px_rgba(13,18,16,0.12)] lg:block xl:text-[11rem]"
          >
            SUB-15
          </span>

          {/* Contenido */}
          <div className="relative flex h-full flex-col justify-center px-6 py-10 md:w-[52%] md:px-10 lg:w-[42%] lg:px-14">
            <h2 className="font-body text-5xl font-extrabold uppercase leading-none tracking-tight text-jaguar-maroon-500 md:text-6xl">
              Sub-15
            </h2>
            <p className="mt-2 text-base font-extrabold uppercase tracking-[0.02em] text-jaguar-green-600 md:text-lg">
              Nuestra categoría actual
            </p>
            <p className="mt-4 max-w-[340px] text-[15px] leading-relaxed text-jaguar-ink/65 md:text-base">
              Un grupo de jóvenes guerreros que entrenan cada día para
              representar con orgullo a{" "}
              <span className="font-semibold text-jaguar-ink">
                Jaguares de Córdoba
              </span>
              .
            </p>

            <div className="mt-7 grid max-w-[380px] grid-cols-4 gap-4">
              {subQuinceStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.id} className="flex flex-col items-start gap-1">
                    <Icon
                      className={`h-8 w-8 md:h-9 md:w-9 ${statIconClass[stat.accent]}`}
                      strokeWidth={1.6}
                      aria-hidden
                    />
                    <span className="mt-1 text-3xl font-extrabold leading-none text-jaguar-ink">
                      {stat.value}
                    </span>
                    <span className="text-[10.5px] font-bold uppercase leading-tight tracking-[0.03em] text-jaguar-ink/50">
                      {stat.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <Link
              href="/jugadores"
              className="group mt-8 inline-flex w-fit items-center gap-2 rounded-full border-2 border-jaguar-green-500 px-6 py-2.5 text-[13px] font-bold uppercase tracking-[0.1em] text-jaguar-green-600 transition-colors hover:bg-jaguar-green-50"
            >
              Ver plantilla
              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                strokeWidth={2.25}
                aria-hidden
              />
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
