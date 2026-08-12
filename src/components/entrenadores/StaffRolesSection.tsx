"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { staffRoles } from "./entrenadores.data";

/** Tarjetas de rol — sin nombres/fotos inventados, iniciales como placeholder visual. */
export function StaffRolesSection() {
  return (
    <section id="confirmados" className="bg-jaguar-mist/40 px-4 py-16 md:px-8 md:py-24 lg:px-12">
      <div className="mx-auto max-w-[1600px]">
        <div className="mx-auto mb-12 max-w-lg text-center">
          <span className="text-[13px] font-semibold uppercase tracking-[0.28em] text-jaguar-green-600">
            Hoy en Jaguares
          </span>
          <h2 className="mt-3 font-display text-2xl uppercase leading-none tracking-tight text-jaguar-ink md:text-3xl">
            Nuestro equipo confirmado
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
          {staffRoles.map((staff, index) => (
            <motion.div
              key={staff.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl bg-jaguar-white p-8 shadow-[0_1px_2px_rgba(13,18,16,0.04)]"
            >
              <div className="flex items-center gap-4">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-jaguar-green-50 font-display text-2xl text-jaguar-green-600">
                  {staff.role
                    .split(" ")
                    .map((word) => word[0])
                    .join("")
                    .slice(0, 2)}
                </span>
                <div>
                  <span className="inline-block rounded-full bg-jaguar-green-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-jaguar-green-600">
                    Sub-15
                  </span>
                  <h3 className="mt-1.5 font-display text-2xl uppercase leading-none tracking-tight text-jaguar-ink">
                    {staff.role}
                  </h3>
                </div>
              </div>

              <p className="mt-6 text-[14px] leading-relaxed text-jaguar-ink/65">{staff.summary}</p>

              <ul className="mt-6 space-y-3">
                {staff.responsibilities.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-jaguar-ink/70">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-jaguar-green-600" strokeWidth={1.8} aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
