"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

/**
 * Indicador de scroll — tratamiento HUD/tech: anillo punteado giratorio,
 * punto de acento orbitando (efecto "radar") y chevron con micro-rebote.
 * Reemplaza la línea estática original por algo con más movimiento.
 */
export function ScrollCue() {
  return (
    <div className="absolute inset-x-0 bottom-8 z-30 hidden justify-center md:flex">
      <div className="flex flex-col items-center gap-3">
        <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.35em] text-jaguar-ink/55">
          <motion.span
            className="h-1 w-1 rounded-full bg-jaguar-turquoise-500"
            animate={{ opacity: [1, 0.25, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
          Descubrí más
        </span>

        <div className="relative h-12 w-12">
          {/* Anillo punteado, estático — marco tipo HUD */}
          <div className="absolute inset-0 rounded-full border border-dashed border-jaguar-ink/20" />

          {/* Punto de acento orbitando alrededor del anillo */}
          <motion.div
            className="absolute inset-0"
            animate={{ rotate: 360 }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          >
            <span className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-jaguar-turquoise-500 shadow-[0_0_10px_2px_rgba(23,184,189,0.55)]" />
          </motion.div>

          {/* Chevron con micro-rebote */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <ChevronDown
                className="h-4 w-4 text-jaguar-ink/70"
                strokeWidth={2.25}
                aria-hidden
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
