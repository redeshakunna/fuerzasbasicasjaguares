"use client";

import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Shirt } from "lucide-react";
import Link from "next/link";
import type { PublicRosterEntry } from "@/lib/data/public-jugadores";
import { filterForPositionGroup, rosterCardAccent, rosterFilters, type RosterFilter } from "./roster.data";

/**
 * "Conoce al plantel" — tarjetas con dorsal y posición, sin nombre ni
 * foto (los jugadores son menores de edad y todavía no tenemos
 * autorización de imagen individual cargada). Datos reales desde
 * `get_public_roster()`.
 */
export function RosterSection({ roster }: { roster: PublicRosterEntry[] }) {
  const [filter, setFilter] = useState<RosterFilter>("Todos");
  const scrollerRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (filter === "Todos") return roster;
    return roster.filter((entry) => filterForPositionGroup(entry.positionGroup) === filter);
  }, [roster, filter]);

  function scroll(direction: "left" | "right") {
    scrollerRef.current?.scrollBy({ left: direction === "left" ? -320 : 320, behavior: "smooth" });
  }

  return (
    <section id="plantel" className="bg-jaguar-white px-4 py-16 md:px-8 md:py-24 lg:px-12">
      <div className="mx-auto max-w-[1600px]">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <h2 className="font-display text-3xl uppercase leading-none tracking-tight text-jaguar-ink md:text-4xl">
            Conoce <span className="text-jaguar-green-600">al plantel</span>
          </h2>

          <div className="flex flex-wrap items-center gap-2">
            {rosterFilters.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setFilter(option)}
                className={`rounded-full px-4 py-2 text-[12px] font-bold uppercase tracking-[0.06em] transition-colors ${
                  filter === option
                    ? "bg-jaguar-green-600 text-jaguar-white"
                    : "bg-jaguar-mist text-jaguar-ink/60 hover:bg-jaguar-mist/70"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="mt-10 text-[14px] text-jaguar-ink/55">Todavía no hay jugadores cargados en esta línea.</p>
        ) : (
          <div className="relative mt-10">
            <div
              ref={scrollerRef}
              className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {filtered.map((entry, index) => {
                const bucket = filterForPositionGroup(entry.positionGroup);
                return (
                  <motion.div
                    key={`${entry.jerseyNumber ?? "s-n"}-${index}`}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.5, delay: (index % 6) * 0.06, ease: [0.22, 1, 0.36, 1] }}
                    className={`relative flex w-[160px] shrink-0 snap-start flex-col items-center justify-end overflow-hidden rounded-2xl ${rosterCardAccent[bucket]} px-4 pb-5 pt-10 text-center shadow-[0_20px_50px_-30px_rgba(13,18,16,0.4)]`}
                  >
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 top-2 select-none font-display text-[4.5rem] leading-none text-jaguar-white/15"
                    >
                      {entry.jerseyNumber ?? "-"}
                    </span>
                    <Shirt className="relative h-7 w-7 text-jaguar-white/80" strokeWidth={1.5} aria-hidden />
                    <span className="relative mt-3 text-2xl font-extrabold leading-none text-jaguar-white">
                      #{entry.jerseyNumber ?? "-"}
                    </span>
                    <span className="relative mt-2 text-[11px] font-bold uppercase leading-tight tracking-[0.04em] text-jaguar-white/90">
                      {entry.position}
                    </span>
                    <span className="relative mt-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-jaguar-white/55">
                      Sub-15
                    </span>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scroll("left")}
                  aria-label="Anterior"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-jaguar-ink/15 text-jaguar-ink/60 transition-colors hover:bg-jaguar-mist"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => scroll("right")}
                  aria-label="Siguiente"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-jaguar-ink/15 text-jaguar-ink/60 transition-colors hover:bg-jaguar-mist"
                >
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </button>
              </div>

              <Link
                href="/inscripciones"
                className="group inline-flex items-center gap-2 rounded-full border-2 border-jaguar-green-500 px-6 py-2.5 text-[13px] font-bold uppercase tracking-[0.1em] text-jaguar-green-600 transition-colors hover:bg-jaguar-green-50"
              >
                Ver todo el plantel
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.25} aria-hidden />
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
