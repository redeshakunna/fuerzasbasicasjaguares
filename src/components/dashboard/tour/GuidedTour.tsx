"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles, X } from "lucide-react";
import { tourSteps, type TourStep } from "./tour-steps";

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface Placement {
  top: number;
  left: number;
}

const PAD = 8;
const TOOLTIP_WIDTH = 320;
const TOOLTIP_HEIGHT_ESTIMATE = 230;

function measureRect(el: Element): Rect {
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

/** Coloca la tarjeta a la derecha si el elemento vive en el sidebar (columna angosta a la izquierda), si no, abajo o arriba según el espacio disponible. */
function computePlacement(rect: Rect): Placement {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  if (rect.left < vw * 0.3 && rect.width < 280) {
    return {
      top: Math.min(Math.max(rect.top - 8, 16), vh - TOOLTIP_HEIGHT_ESTIMATE - 16),
      left: Math.min(rect.left + rect.width + PAD * 2 + 12, vw - TOOLTIP_WIDTH - 16),
    };
  }

  if (rect.top + rect.height + TOOLTIP_HEIGHT_ESTIMATE + 24 < vh) {
    return {
      top: rect.top + rect.height + PAD * 2 + 12,
      left: Math.min(Math.max(rect.left, 16), vw - TOOLTIP_WIDTH - 16),
    };
  }

  return {
    top: Math.max(rect.top - TOOLTIP_HEIGHT_ESTIMATE - PAD * 2 - 12, 16),
    left: Math.min(Math.max(rect.left, 16), vw - TOOLTIP_WIDTH - 16),
  };
}

/**
 * Recorrido guiado de la plataforma — overlay que oscurece la pantalla,
 * recorta un "spotlight" sobre el elemento activo (técnica de box-shadow,
 * sin dependencias nuevas) y muestra una tarjeta con la explicación.
 *
 * Si un paso no encuentra su elemento (rol sin esa tarjeta, sidebar oculto
 * en mobile, categoría sin plantel) lo salta solo — nunca se queda
 * apuntando al vacío.
 */
export function GuidedTour({ onFinish }: { onFinish: () => void }) {
  const steps = useMemo(() => tourSteps, []);
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);

  const step: TourStep | undefined = steps[stepIndex];

  const advanceOrFinish = useCallback(() => {
    setStepIndex((i) => {
      if (i < steps.length - 1) return i + 1;
      onFinish();
      return i;
    });
  }, [steps.length, onFinish]);

  useEffect(() => {
    if (!step) return;
    const selector = step.selector;
    setRect(null);
    let cancelled = false;

    const target = document.querySelector(selector);
    if (target) target.scrollIntoView({ block: "center", behavior: "smooth" });

    const timer = setTimeout(() => {
      if (cancelled) return;
      const el = document.querySelector(selector);
      if (!el) {
        advanceOrFinish();
        return;
      }
      const r = measureRect(el);
      if (r.width === 0 || r.height === 0) {
        advanceOrFinish();
        return;
      }
      setRect(r);
    }, 260);

    function onResize() {
      const el = document.querySelector(selector);
      if (el) setRect(measureRect(el));
    }
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onFinish();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onFinish]);

  if (!step) return null;

  function goNext() {
    if (stepIndex < steps.length - 1) {
      setStepIndex((i) => i + 1);
    } else {
      onFinish();
    }
  }

  function goPrev() {
    setStepIndex((i) => Math.max(0, i - 1));
  }

  const placement = rect ? computePlacement(rect) : null;
  const isLast = stepIndex === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[200]" role="dialog" aria-modal="true" aria-label="Recorrido guiado de la plataforma">
      <div className="absolute inset-0" />

      {rect ? (
        <motion.div
          initial={false}
          animate={{
            top: rect.top - PAD,
            left: rect.left - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
          }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none absolute rounded-2xl ring-2 ring-jaguar-green-500"
          style={{ boxShadow: "0 0 0 9999px rgba(13,18,16,0.72)" }}
        />
      ) : (
        <div className="pointer-events-none absolute inset-0 bg-jaguar-ink/72" />
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="absolute w-[320px] rounded-2xl bg-white p-5 shadow-2xl"
          style={
            placement
              ? { top: placement.top, left: placement.left }
              : { top: "50%", left: "50%", transform: "translate(-50%, -50%)" }
          }
        >
          <div className="flex items-start justify-between gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-jaguar-green-500/10 text-jaguar-green-600">
              <Sparkles className="h-4 w-4" strokeWidth={2} aria-hidden />
            </span>
            <button
              type="button"
              onClick={onFinish}
              aria-label="Cerrar recorrido"
              className="rounded-lg p-1 text-jaguar-ink/35 transition-colors hover:bg-jaguar-ink/[0.05] hover:text-jaguar-ink"
            >
              <X className="h-4 w-4" strokeWidth={2} aria-hidden />
            </button>
          </div>

          <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.08em] text-jaguar-green-600">
            Paso {stepIndex + 1} de {steps.length}
          </p>
          <h3 className="mt-1 text-[15.5px] font-extrabold text-jaguar-ink">{step.title}</h3>
          <p className="mt-1.5 text-[13px] leading-relaxed text-jaguar-ink/65">{step.description}</p>

          <div className="mt-4 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onFinish}
              className="text-[12px] font-semibold text-jaguar-ink/45 transition-colors hover:text-jaguar-ink/70"
            >
              Saltar recorrido
            </button>
            <div className="flex items-center gap-2">
              {stepIndex > 0 ? (
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Paso anterior"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-jaguar-ink/10 text-jaguar-ink/60 transition-colors hover:bg-jaguar-ink/[0.04]"
                >
                  <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
                </button>
              ) : null}
              <button
                type="button"
                onClick={goNext}
                className="flex items-center gap-1.5 rounded-xl bg-jaguar-green-600 px-4 py-2 text-[12.5px] font-semibold text-white transition-colors hover:bg-jaguar-green-700"
              >
                {isLast ? "Finalizar" : "Siguiente"}
                {!isLast ? <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden /> : null}
              </button>
            </div>
          </div>

          <div className="mt-4 flex gap-1">
            {steps.map((s, i) => (
              <span
                key={s.id}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i <= stepIndex ? "bg-jaguar-green-500" : "bg-jaguar-ink/10"
                }`}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
