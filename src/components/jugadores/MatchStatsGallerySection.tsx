"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CalendarCheck, CalendarDays, ClipboardCheck, MapPin, Trophy, Users } from "lucide-react";
import type { PublicJugadoresStats, PublicNextMatch } from "@/lib/data/public-jugadores";

const galleryPreview = ["/brand/Slider Banner.png", "/hero/slide-02-proposito.jpg", "/hero/slide-01-origen.jpg", "/brand/stadium-stock.jpg"];

const monthNames = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

function formatMatchDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const monthName = monthNames[(month ?? 1) - 1] ?? "";
  return `${day} de ${monthName} de ${year}`;
}

/** Fila de 3 columnas: cifras reales, próximo partido y adelanto de galería. */
export function MatchStatsGallerySection({
  stats,
  nextMatch,
}: {
  stats: PublicJugadoresStats;
  nextMatch: PublicNextMatch | null;
}) {
  const numberStats = [
    { id: "asistencia", icon: ClipboardCheck, value: `${stats.asistenciaPromedioPct}%`, label: "Asistencia promedio" },
    { id: "jugadores", icon: Users, value: stats.jugadoresActivos, label: "Jugadores activos" },
    { id: "entrenamientos", icon: CalendarDays, value: stats.entrenamientosRecientes, label: "Entrenamientos recientes" },
    { id: "partidos", icon: Trophy, value: stats.partidosProgramados, label: "Partidos programados" },
  ];

  return (
    <section className="bg-jaguar-mist/40 px-4 py-16 md:px-8 md:py-24 lg:px-12">
      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl bg-jaguar-ink p-7"
        >
          <h3 className="text-[13px] font-bold uppercase tracking-[0.08em] text-jaguar-white">
            La Sub-15 en números
          </h3>
          <div className="mt-6 grid grid-cols-2 gap-6">
            {numberStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.id} className="flex flex-col gap-1.5">
                  <Icon className="h-5 w-5 text-jaguar-green-500" strokeWidth={1.8} aria-hidden />
                  <span className="text-xl font-extrabold leading-none text-jaguar-white">{stat.value}</span>
                  <span className="text-[10px] font-bold uppercase leading-tight tracking-[0.03em] text-jaguar-white/45">
                    {stat.label}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col rounded-2xl bg-jaguar-white p-7 shadow-[0_1px_2px_rgba(13,18,16,0.04)]"
        >
          <h3 className="text-[13px] font-bold uppercase tracking-[0.08em] text-jaguar-ink">Próximo partido</h3>

          {nextMatch ? (
            <div className="mt-6 flex flex-1 flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-jaguar-green-50 font-display text-lg text-jaguar-green-600">
                    J
                  </span>
                  <p className="mt-2 text-[11px] font-bold uppercase text-jaguar-ink/60">Jaguares</p>
                </div>
                <span className="text-sm font-bold uppercase text-jaguar-ink/30">vs</span>
                <div className="text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-jaguar-mist font-display text-lg text-jaguar-ink/50">
                    ?
                  </span>
                  <p className="mt-2 max-w-[90px] text-[11px] font-bold uppercase text-jaguar-ink/60">
                    {nextMatch.opponent}
                  </p>
                </div>
              </div>
              <div className="mt-6 space-y-2 text-[12.5px] text-jaguar-ink/60">
                <div className="flex items-center gap-2">
                  <CalendarCheck className="h-4 w-4 text-jaguar-green-600" strokeWidth={1.8} aria-hidden />
                  {formatMatchDate(nextMatch.matchDate)}
                  {nextMatch.matchTime ? ` — ${nextMatch.matchTime.slice(0, 5)}` : ""}
                </div>
                {nextMatch.location ? (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-jaguar-green-600" strokeWidth={1.8} aria-hidden />
                    {nextMatch.location}
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="mt-6 flex flex-1 flex-col items-start justify-center gap-2 rounded-xl bg-jaguar-mist/70 px-4 py-6 text-[12.5px] leading-relaxed text-jaguar-ink/55">
              <Trophy className="h-5 w-5 text-jaguar-gold-600" strokeWidth={1.8} aria-hidden />
              Todavía no hay un próximo partido confirmado. Vuelve pronto.
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl bg-jaguar-white p-7 shadow-[0_1px_2px_rgba(13,18,16,0.04)]"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-bold uppercase tracking-[0.08em] text-jaguar-ink">Galería</h3>
            <Link
              href="/galeria"
              className="group flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.06em] text-jaguar-green-600"
            >
              Ver más
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.25} aria-hidden />
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-2.5">
            {galleryPreview.map((src) => (
              <div key={src} className="relative aspect-square overflow-hidden rounded-xl">
                <Image src={src} alt="Fuerzas Básicas Jaguares de Córdoba" fill sizes="140px" className="object-cover" />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
