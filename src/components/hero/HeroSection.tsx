"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { navLinks } from "./hero.data";
import { HeroBackground } from "./HeroBackground";
import { HeroContent } from "./HeroContent";
import { ScrollCue } from "./ScrollCue";
import { SlideIndicators } from "./SlideIndicators";
import type { HeroSlide } from "./hero.types";

interface HeroSectionProps {
  slides: HeroSlide[];
  /** Intervalo de autoplay en ms. */
  autoPlayInterval?: number;
}

/**
 * Hero — primera pantalla (above the fold).
 *
 * Estructura: fondo cinematográfico a sangre completa (60% derecho
 * conceptual, con negativo natural a la izquierda) + panel izquierdo
 * reservado para logo/título/descripción/CTAs + navbar transparente.
 * Ya funciona como slider para poder alternar entre los fondos
 * suministrados sin refactor futuro.
 */
export function HeroSection({ slides, autoPlayInterval = 7000 }: HeroSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex(((index % slides.length) + slides.length) % slides.length);
    },
    [slides.length],
  );

  useEffect(() => {
    if (slides.length < 2 || isPaused) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion) return;

    timerRef.current = setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, autoPlayInterval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [slides.length, isPaused, autoPlayInterval]);

  const activeSlide = slides[activeIndex] ?? slides[0];
  if (!activeSlide) return null;

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative h-[100svh] min-h-[720px] w-full overflow-hidden bg-jaguar-white lg:h-[960px] lg:max-h-[1000px]"
    >
      <Navbar links={navLinks} />

      <HeroBackground slides={slides} activeIndex={activeIndex} />

      {/* Grid editorial: panel izquierdo reservado (40%) / composición (60%) */}
      <div className="relative z-10 grid h-full w-full grid-cols-1 md:grid-cols-5">
        <div className="md:col-span-2">
          <HeroContent slide={activeSlide} />
        </div>
        <div className="md:col-span-3" aria-hidden />
      </div>

      <SlideIndicators
        slides={slides}
        activeIndex={activeIndex}
        onSelect={goTo}
      />
      <ScrollCue />

      {/* Detalle editorial de marca — texto vertical sobre el borde izquierdo */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-4 top-1/2 hidden -translate-y-1/2 -rotate-180 text-[11px] font-semibold uppercase tracking-[0.4em] text-jaguar-ink/25 [writing-mode:vertical-rl] md:block"
      >
        #SomosJaguares
      </span>
    </section>
  );
}
