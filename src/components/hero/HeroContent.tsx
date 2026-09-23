"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ShieldCheck, Trophy, UserRound, Users } from "lucide-react";
import type { HeroAccent, HeroSlide } from "./hero.types";

interface HeroContentProps {
  slide: HeroSlide;
}

const titleAccentClass: Record<HeroAccent, string> = {
  green: "from-jaguar-turquoise-400 to-jaguar-green-400",
  maroon: "from-jaguar-gold-400 to-jaguar-maroon-400",
  turquoise: "from-jaguar-turquoise-300 to-jaguar-turquoise-500",
};

const primaryCtaClass: Record<HeroAccent, string> = {
  green: "bg-gradient-to-r from-jaguar-green-500 to-jaguar-turquoise-500 shadow-[0_10px_30px_-8px_rgba(23,184,189,0.5)]",
  maroon: "bg-jaguar-maroon-500 shadow-[0_10px_30px_-10px_rgba(110,27,43,0.55)]",
  turquoise: "bg-jaguar-turquoise-500 shadow-[0_10px_30px_-10px_rgba(23,184,189,0.55)]",
};

/**
 * Franja de valores institucionales — estática (no cambia por slide), a
 * imagen de las academias de referencia (Ajax/City/Bayern Campus): cuatro
 * puntos cortos que refuerzan "formamos personas, no solo futbolistas"
 * antes del CTA, sin agregar una sección nueva a la página.
 */
const highlights = [
  { icon: UserRound, label: "Más que fútbol" },
  { icon: ShieldCheck, label: "Disciplina y valores" },
  { icon: Users, label: "Talento regional" },
  { icon: Trophy, label: "Un mejor futuro" },
];

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
      aria-hidden
    >
      <path
        d="M2 8h11M8.5 3.5 13 8l-4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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

export function HeroContent({ slide }: HeroContentProps) {
  const hasCopy = Boolean(slide.title || slide.description || slide.eyebrow);

  if (!hasCopy) {
    // Espacio reservado, intencionalmente vacío.
    return <div className="h-full w-full" aria-hidden />;
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-8 pt-28 md:px-12 lg:px-14 lg:pt-32 xl:px-16">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -18 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-lg"
        >
          {slide.eyebrow ? (
            <span className="mb-5 inline-block text-[13px] font-semibold uppercase tracking-[0.28em] text-jaguar-turquoise-300">
              {slide.eyebrow}
            </span>
          ) : null}

          {slide.title ? (
            <h1 className="font-display text-6xl font-normal uppercase leading-[0.9] tracking-tight text-jaguar-white [text-shadow:0_4px_24px_rgba(0,0,0,0.45)] lg:text-7xl xl:text-8xl">
              <span className="block">{slide.title.lead}</span>
              <span
                className={`block bg-gradient-to-r bg-clip-text text-transparent ${titleAccentClass[slide.accent]}`}
              >
                {slide.title.accent}
              </span>
            </h1>
          ) : null}

          {slide.description ? (
            <p className="mt-6 max-w-md text-base leading-relaxed text-jaguar-white/75 lg:text-lg">
              {slide.description}
            </p>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3">
            {highlights.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className={`flex items-center gap-2 pl-5 first:pl-0 ${
                    index > 0 ? "border-l border-jaguar-white/15" : ""
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0 text-jaguar-turquoise-300" strokeWidth={1.9} aria-hidden />
                  <span className="text-[11px] font-bold uppercase leading-tight tracking-[0.03em] text-jaguar-white/80">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>

          {slide.ctas?.length ? (
            <div className="mt-9 flex flex-wrap items-center gap-4">
              {slide.ctas.map((cta) => (
                <Link
                  key={cta.label}
                  href={cta.href}
                  className={
                    cta.variant === "secondary"
                      ? "group inline-flex items-center gap-2.5 rounded-full border border-jaguar-white/25 px-6 py-3.5 text-[13px] font-semibold uppercase tracking-[0.14em] text-jaguar-white transition-colors hover:bg-jaguar-white/10"
                      : `group inline-flex items-center gap-2.5 rounded-full px-6 py-3.5 text-[13px] font-semibold uppercase tracking-[0.14em] text-jaguar-white transition-transform hover:scale-[1.03] ${primaryCtaClass[slide.accent]}`
                  }
                >
                  {cta.icon === "play" ? (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-jaguar-white/15">
                      <PlayIcon />
                    </span>
                  ) : null}
                  {cta.label}
                  {cta.icon === "arrow" ? <ArrowIcon /> : null}
                </Link>
              ))}
            </div>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
