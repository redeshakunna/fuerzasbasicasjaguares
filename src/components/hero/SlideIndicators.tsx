"use client";

import { motion } from "framer-motion";
import type { HeroSlide } from "./hero.types";

interface SlideIndicatorsProps {
  slides: HeroSlide[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

const accentDot: Record<HeroSlide["accent"], string> = {
  green: "bg-jaguar-green-500",
  maroon: "bg-jaguar-maroon-500",
  turquoise: "bg-jaguar-turquoise-500",
};

export function SlideIndicators({
  slides,
  activeIndex,
  onSelect,
}: SlideIndicatorsProps) {
  if (slides.length < 2) return null;

  return (
    <div className="absolute bottom-8 right-6 z-30 flex items-center gap-4 md:bottom-10 md:right-12 lg:right-16">
      <span className="font-display text-sm font-semibold tabular-nums text-jaguar-ink/70">
        {String(activeIndex + 1).padStart(2, "0")}
        <span className="mx-1.5 text-jaguar-ink/30">/</span>
        {String(slides.length).padStart(2, "0")}
      </span>
      <div className="flex items-center gap-2">
        {slides.map((slide, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={slide.id}
              type="button"
              aria-label={`Ir al slide ${index + 1}`}
              aria-current={isActive}
              onClick={() => onSelect(index)}
              className="group relative h-2.5 w-9 overflow-hidden rounded-full bg-jaguar-ink/10"
            >
              {isActive ? (
                <motion.span
                  layoutId="hero-indicator"
                  className={`absolute inset-0 rounded-full ${accentDot[slide.accent]}`}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                />
              ) : (
                <span className="absolute inset-0 rounded-full bg-jaguar-ink/15 transition-colors group-hover:bg-jaguar-ink/25" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
