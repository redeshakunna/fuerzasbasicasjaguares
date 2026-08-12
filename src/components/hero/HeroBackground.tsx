"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import type { HeroSlide } from "./hero.types";

interface HeroBackgroundProps {
  slides: HeroSlide[];
  activeIndex: number;
}

const accentGradient: Record<HeroSlide["accent"], string> = {
  green: "from-jaguar-green-500/25 via-transparent to-transparent",
  maroon: "from-jaguar-maroon-500/25 via-transparent to-transparent",
  turquoise: "from-jaguar-turquoise-500/25 via-transparent to-transparent",
};

/**
 * Composición cinematográfica del lado derecho.
 *
 * Las fotografías suministradas ya llegan compuestas a pantalla completa
 * (jugador principal + acción secundaria + equipo integrado + pinceladas),
 * con negativo natural sobre la mitad izquierda. Por eso el fondo se
 * renderiza a sangre completa y se refuerza la legibilidad del panel
 * izquierdo con capas de degradado — nunca con fondos negros.
 */
export function HeroBackground({ slides, activeIndex }: HeroBackgroundProps) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-jaguar-white">
      <AnimatePresence initial={false}>
        {slides.map((slide, index) =>
          index === activeIndex ? (
            <motion.div
              key={slide.id}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                className="absolute inset-0"
                initial={{ scale: 1.04 }}
                animate={{ scale: 1.12 }}
                transition={{ duration: 14, ease: "easeOut" }}
              >
                <Image
                  src={slide.image.src}
                  alt={slide.image.alt}
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  className="object-cover object-[68%_center] md:object-[62%_center]"
                />
              </motion.div>

              {/* Acento cromático suave según el slide */}
              <div
                className={`absolute inset-0 bg-gradient-to-tr ${accentGradient[slide.accent]} mix-blend-multiply`}
              />
            </motion.div>
          ) : null,
        )}
      </AnimatePresence>

      {/* Garantiza legibilidad del panel izquierdo sin usar negro */}
      <div className="absolute inset-0 bg-gradient-to-r from-jaguar-white via-jaguar-white/55 to-transparent md:via-jaguar-white/35" />
      <div className="absolute inset-0 bg-gradient-to-t from-jaguar-white/50 via-transparent to-jaguar-white/10" />

      {/* Viñeta perimetral muy sutil — refuerza foco central sin oscurecer */}
      <div className="absolute inset-0 [box-shadow:inset_0_0_180px_60px_rgba(255,255,255,0.35)]" />

      {/* Textura de grano cinematográfico */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Línea diagonal de acento — movimiento y profundidad editorial */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-10 top-0 hidden h-[130%] w-[2px] origin-top rotate-[14deg] bg-gradient-to-b from-jaguar-gold-400/0 via-jaguar-turquoise-400/70 to-jaguar-gold-400/0 md:block"
        animate={{ opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-[18%] top-0 hidden h-[130%] w-px rotate-[14deg] bg-gradient-to-b from-jaguar-ink/0 via-jaguar-ink/10 to-jaguar-ink/0 md:block"
      />
    </div>
  );
}
