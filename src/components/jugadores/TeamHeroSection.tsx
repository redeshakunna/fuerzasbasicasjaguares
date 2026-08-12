"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CalendarDays, Shirt, Trophy, Users } from "lucide-react";
import type { PublicHomeStats } from "@/lib/data/public-stats";

/** Apertura — texto institucional + tarjeta oscura con foto y cifras reales. */
export function TeamHeroSection({ stats }: { stats: PublicHomeStats }) {
  const heroStats = [
    { id: "jugadores", icon: Users, value: stats.jugadoresActivos, label: "Jugadores" },
    { id: "entrenadores", icon: Shirt, value: stats.cuerpoTecnico, label: "Entrenadores" },
    { id: "entrenamientos", icon: CalendarDays, value: stats.entrenamientosRecientes, label: "Entrenamientos recientes" },
    { id: "partidos", icon: Trophy, value: stats.partidosProgramados, label: "Partidos programados" },
  ];

  return (
    <section className="bg-jaguar-white px-4 py-16 md:px-8 md:py-24 lg:px-12">
      <div className="mx-auto grid max-w-[1600px] grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,420px)_1fr] lg:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="inline-block text-[13px] font-semibold uppercase tracking-[0.28em] text-jaguar-green-600">
            Nuestro plantel
          </span>
          <h2 className="mt-4 font-display text-4xl uppercase leading-[0.95] tracking-tight text-jaguar-ink md:text-5xl">
            El corazón
            <br />
            <span className="text-jaguar-green-600">del equipo</span>
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-jaguar-ink/65">
            Nuestra Sub-15 representa el presente y el futuro de las Fuerzas Básicas Jaguares de Córdoba. Un grupo de
            jóvenes que crece a través del entrenamiento, la disciplina y la competencia.
          </p>

          <Link
            href="#plantel"
            className="group mt-9 inline-flex items-center gap-2.5 rounded-full bg-jaguar-green-600 px-6 py-3.5 text-[13px] font-semibold uppercase tracking-[0.14em] text-jaguar-white shadow-[0_10px_30px_-10px_rgba(20,92,44,0.55)] transition-transform hover:scale-[1.03]"
          >
            Conoce nuestra Sub-15
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.25} aria-hidden />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden rounded-3xl bg-jaguar-ink shadow-[0_30px_80px_-40px_rgba(13,18,16,0.4)]"
        >
          <div className="relative aspect-[16/10] w-full">
            <Image
              src="/brand/Slider Banner.png"
              alt="Plantel Sub-15 de Fuerzas Básicas Jaguares de Córdoba"
              fill
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-jaguar-ink via-jaguar-ink/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
              <h3 className="font-display text-3xl uppercase leading-none tracking-tight text-jaguar-white md:text-4xl">
                Sub-15
              </h3>
              <p className="mt-2 max-w-xs text-[12.5px] font-semibold uppercase leading-snug tracking-[0.04em] text-jaguar-white/75">
                Una generación. Un escudo. Un mismo propósito.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-4 divide-x divide-jaguar-white/10 border-t border-jaguar-white/10 px-2 py-6">
            {heroStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.id} className="flex flex-col items-center gap-1.5 px-1 text-center">
                  <Icon className="h-6 w-6 text-jaguar-green-500" strokeWidth={1.7} aria-hidden />
                  <span className="text-2xl font-extrabold leading-none text-jaguar-white">{stat.value}</span>
                  <span className="text-[9.5px] font-bold uppercase leading-tight tracking-[0.03em] text-jaguar-white/50">
                    {stat.label}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
