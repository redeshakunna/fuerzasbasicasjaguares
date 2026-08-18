"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import type { HeroAccent, HeroSlide } from "./hero.types";

interface HeroContentProps {
  slide: HeroSlide;
}

const titleAccentClass: Record<HeroAccent, string> = {
  green: "from-jaguar-turquoise-500 to-jaguar-green-500",
  maroon: "from-jaguar-gold-500 to-jaguar-maroon-500",
  turquoise: "from-jaguar-turquoise-400 to-jaguar-turquoise-500",
};

const primaryCtaClass: Record<HeroAccent, string> = {
  green: "bg-jaguar-green-600 shadow-[0_10px_30px_-10px_rgba(20,92,44,0.55)]",
  maroon: "bg-jaguar-maroon-500 shadow-[0_10px_30px_-10px_rgba(110,27,43,0.55)]",
  turquoise: "bg-jaguar-turquoise-500 shadow-[0_10px_30px_-10px_rgba(23,184,189,0.55)]",
};

/**
 * Panel izquierdo (~40%).
 *
 * Por requerimiento de diseño, esta entrega NO incluye copy: el espacio
 * debe permanecer limpio y "respirar". El componente ya está preparado
 * para recibir eyebrow/title/description/ctas por slide (ver
 * `hero.types.ts`) sin requerir cambios de layout — apenas se complete
 * `hero.data.ts`, el contenido aparecerá con la misma coreografía de
 * entrada que el resto del Hero.
 */
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
          className="w-full max-w-md"
        >
          {slide.eyebrow ? (
            <span className="mb-4 inline-block text-[12px] font-semibold uppercase tracking-[0.28em] text-jaguar-green-600">
              {slide.eyebrow}
            </span>
          ) : null}

          {slide.title ? (
            <h1 className="font-display text-5xl font-normal uppercase leading-[0.92] tracking-tight text-jaguar-ink lg:text-6xl xl:text-7xl">
              <span className="block">{slide.title.lead}</span>
              <span
                className={`block bg-gradient-to-r bg-clip-text text-transparent ${titleAccentClass[slide.accent]}`}
              >
                {slide.title.accent}
              </span>
            </h1>
          ) : null}

          {slide.description ? (
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-jaguar-ink/70 lg:text-base">
              {slide.description}
            </p>
          ) : null}

          {slide.ctas?.length ? (
            <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
              {slide.ctas.map((cta) => (
                <Link
                  key={cta.label}
                  href={cta.href}
                  className={
                    cta.variant === "secondary"
                      ? "group inline-flex items-center gap-2.5 rounded-full border border-jaguar-ink/20 px-6 py-3.5 text-[13px] font-semibold uppercase tracking-[0.14em] text-jaguar-ink transition-colors hover:bg-jaguar-ink/5"
                      : `group inline-flex items-center gap-2.5 rounded-full px-6 py-3.5 text-[13px] font-semibold uppercase tracking-[0.14em] text-jaguar-white transition-transform hover:scale-[1.03] ${primaryCtaClass[slide.accent]}`
                  }
                >
                  {cta.icon === "play" ? (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-jaguar-ink/10">
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
