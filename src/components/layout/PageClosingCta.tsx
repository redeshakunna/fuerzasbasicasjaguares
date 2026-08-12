"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, LucideIcon, Trophy } from "lucide-react";

interface PageClosingCtaProps {
  icon?: LucideIcon;
  title: React.ReactNode;
  description: string;
  ctaLabel: string;
  ctaHref: string;
}

/** Cierre de página reutilizable — mismo tratamiento que Nosotros, con contenido por props. */
export function PageClosingCta({ icon: Icon = Trophy, title, description, ctaLabel, ctaHref }: PageClosingCtaProps) {
  return (
    <section className="px-4 pb-20 md:px-8 lg:px-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto flex max-w-[1600px] flex-col items-start gap-6 overflow-hidden rounded-[24px] bg-gradient-to-br from-jaguar-green-900 via-jaguar-green-600 to-jaguar-green-500 px-8 py-12 md:flex-row md:items-center md:justify-between md:px-14 md:py-14"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-jaguar-white/10 blur-2xl"
        />
        <div className="relative flex items-start gap-5">
          <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-jaguar-white/15 text-jaguar-white sm:flex">
            <Icon className="h-6 w-6" strokeWidth={1.7} aria-hidden />
          </span>
          <div>
            <h2 className="font-display text-3xl uppercase leading-none tracking-tight text-jaguar-white md:text-4xl">
              {title}
            </h2>
            <p className="mt-4 max-w-md text-[14.5px] leading-relaxed text-jaguar-white/75">{description}</p>
          </div>
        </div>

        <Link
          href={ctaHref}
          className="group relative inline-flex shrink-0 items-center gap-2.5 rounded-full bg-jaguar-white px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.14em] text-jaguar-green-600 shadow-lg transition-transform hover:scale-[1.03]"
        >
          {ctaLabel}
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.25} aria-hidden />
        </Link>
      </motion.div>
    </section>
  );
}
