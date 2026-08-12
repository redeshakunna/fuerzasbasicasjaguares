"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { staffCards } from "./entrenadores.data";

/**
 * "Nuestros entrenadores" — 4 tarjetas de ejemplo que muestran cómo se
 * verá la sección completa. El club hoy solo tiene 2 roles confirmados
 * (ver sección siguiente); estas van claramente marcadas "Perfil de
 * ejemplo" — sin nombre, foto ni credenciales inventadas, para no
 * hacerlas pasar por personas reales.
 */
export function StaffCardsSection() {
  return (
    <section id="staff" className="bg-jaguar-white px-4 py-16 md:px-8 md:py-24 lg:px-12">
      <div className="mx-auto max-w-[1600px]">
        <h2 className="text-center font-display text-3xl uppercase leading-none tracking-tight text-jaguar-ink md:text-4xl">
          Nuestros <span className="text-jaguar-green-600">entrenadores</span>
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {staffCards.map((staff, index) => {
            const Icon = staff.icon;
            return (
              <motion.div
                key={staff.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col overflow-hidden rounded-2xl bg-jaguar-ink"
              >
                <div className="relative flex aspect-[4/3] items-center justify-center bg-jaguar-green-900/60">
                  <Icon className="h-12 w-12 text-jaguar-white/25" strokeWidth={1.3} aria-hidden />
                  <span className="absolute left-3 top-3 rounded-full bg-jaguar-white/10 px-3 py-1 text-[9.5px] font-bold uppercase tracking-[0.06em] text-jaguar-white/70">
                    Perfil de ejemplo
                  </span>
                </div>
                <div className="flex flex-1 flex-col px-5 py-5">
                  <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-jaguar-green-500">
                    {staff.role}
                  </span>
                  <p className="mt-2 text-[12px] leading-relaxed text-jaguar-white/50">
                    Este perfil se completará cuando el club confirme y autorice publicar la información real de esta
                    persona.
                  </p>
                  <Link
                    href="/contacto"
                    className="group mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-jaguar-green-600 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.06em] text-jaguar-white transition-transform hover:scale-[1.03]"
                  >
                    Ver perfil
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.25} aria-hidden />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="#confirmados"
            className="group inline-flex items-center gap-2 rounded-full border-2 border-jaguar-green-500 px-6 py-2.5 text-[13px] font-bold uppercase tracking-[0.1em] text-jaguar-green-600 transition-colors hover:bg-jaguar-green-50"
          >
            Ver todo el cuerpo técnico
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.25} aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
