"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight, Clock, MapPin, Shield } from "lucide-react";
import { newsCategoryClass, newsItems } from "./news.data";
import type { MatchRow } from "@/lib/data/matches";

const weekdayFormatter = new Intl.DateTimeFormat("es-CO", { weekday: "long", timeZone: "UTC" });
const monthFormatter = new Intl.DateTimeFormat("es-CO", { month: "long", timeZone: "UTC" });

/**
 * `match_date` viene como "YYYY-MM-DD" (input type=date). Se parsea forzando
 * UTC para que la fecha mostrada no se corra un día por el timezone del
 * navegador/servidor — es un simple calendario, no un instante con hora.
 */
function formatMatchDateLong(matchDate: string): string {
  const date = new Date(`${matchDate}T00:00:00Z`);
  const weekday = weekdayFormatter.format(date);
  const month = monthFormatter.format(date);
  const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  return `${capitalizedWeekday} ${date.getUTCDate()} de ${month}, ${date.getUTCFullYear()}`;
}

/** `match_time` viene como "HH:MM" (24h, input type=time) → "10:00 AM". */
function formatMatchTime(matchTime: string | null): string {
  if (!matchTime) return "Hora por confirmar";
  const [hourStr, minuteStr] = matchTime.split(":");
  const hour = Number(hourStr);
  const minute = Number(minuteStr ?? "0");
  if (Number.isNaN(hour) || Number.isNaN(minute)) return "Hora por confirmar";
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${String(minute).padStart(2, "0")} ${period}`;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="relative inline-block text-lg font-extrabold uppercase tracking-tight text-jaguar-ink md:text-xl">
      {children}
      <span
        aria-hidden
        className="absolute -bottom-1.5 left-0 h-[3px] w-9 rounded-full bg-jaguar-green-500"
      />
    </h2>
  );
}

const JAGUARES_NAME = "Jaguares de Córdoba";
const JAGUARES_LOGO = "/brand/logo-fuerzas-basicas.png";
const CALENDAR_HREF = "#calendario";

interface NextMatchCardProps {
  matches: MatchRow[];
}

/**
 * Tarjeta "Próximo partido" — si hay un solo partido confirmado se muestra
 * fijo, si hay varios se convierte en un slide corto (flechas + puntos,
 * con autoplay pausable) para no ocupar más espacio del que ya tenía.
 */
function NextMatchCard({ matches }: NextMatchCardProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex(((index % matches.length) + matches.length) % matches.length);
    },
    [matches.length],
  );

  useEffect(() => {
    if (matches.length < 2 || isPaused) return;
    timerRef.current = setInterval(() => {
      setActiveIndex((current) => (current + 1) % matches.length);
    }, 6000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [matches.length, isPaused]);

  const match = matches[activeIndex] ?? matches[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="flex h-full flex-col rounded-3xl border border-jaguar-ink/5 bg-jaguar-white p-7 shadow-[0_20px_60px_-35px_rgba(13,18,16,0.25)] md:p-8"
    >
      <div className="flex items-center justify-between">
        <SectionHeading>Próximo partido</SectionHeading>
        {matches.length > 1 ? (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label="Partido anterior"
              onClick={() => goTo(activeIndex - 1)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-jaguar-ink/15 text-jaguar-ink/50 transition-colors hover:bg-jaguar-ink/5"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Siguiente partido"
              onClick={() => goTo(activeIndex + 1)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-jaguar-ink/15 text-jaguar-ink/50 transition-colors hover:bg-jaguar-ink/5"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={2} aria-hidden />
            </button>
          </div>
        ) : null}
      </div>

      {!match ? (
        <div className="mt-7 flex flex-1 flex-col items-center justify-center text-center">
          <CalendarDays className="h-7 w-7 text-jaguar-ink/20" strokeWidth={1.6} aria-hidden />
          <p className="mt-3 text-[13.5px] text-jaguar-ink/50">
            Todavía no hay partidos confirmados. Vuelve pronto para ver la próxima fecha.
          </p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={match.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="mt-7 flex flex-1 flex-col"
          >
            {/* Escudos + VS */}
            <div className="flex items-center gap-5">
              <div className="flex flex-col items-center gap-2">
                <Image
                  src={JAGUARES_LOGO}
                  alt={JAGUARES_NAME}
                  width={64}
                  height={64}
                  className="h-14 w-14 object-contain md:h-16 md:w-16"
                />
              </div>
              <span className="font-display text-base font-normal text-jaguar-ink/35">VS</span>
              {/* Todavía no manejamos escudos de rivales — placeholder genérico */}
              <span
                title={match.opponent}
                className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-jaguar-ink/20 text-jaguar-ink/30 md:h-16 md:w-16"
              >
                <Shield className="h-6 w-6" strokeWidth={1.6} aria-hidden />
              </span>
            </div>

            {/* Datos del partido */}
            <div className="mt-6 min-w-0">
              <p className="text-[13px] font-extrabold uppercase leading-snug tracking-[0.04em] text-jaguar-green-600">
                {match.competition || "Torneo por confirmar"}
              </p>
              <dl className="mt-3 space-y-2.5 text-[13.5px] text-jaguar-ink/70">
                <div className="flex items-center gap-2.5">
                  <CalendarDays className="h-4 w-4 shrink-0 text-jaguar-ink/45" strokeWidth={1.8} aria-hidden />
                  <dd>{formatMatchDateLong(match.match_date)}</dd>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="h-4 w-4 shrink-0 text-jaguar-ink/45" strokeWidth={1.8} aria-hidden />
                  <dd>{formatMatchTime(match.match_time)}</dd>
                </div>
                <div className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-jaguar-ink/45" strokeWidth={1.8} aria-hidden />
                  <dd className="leading-relaxed">{match.location || "Sede por confirmar"}</dd>
                </div>
              </dl>

              <Link
                href={CALENDAR_HREF}
                className="group mt-6 inline-flex w-fit items-center gap-2 whitespace-nowrap rounded-full border-2 border-jaguar-green-500 px-5 py-2.5 text-[12px] font-bold uppercase tracking-[0.08em] text-jaguar-green-600 transition-colors hover:bg-jaguar-green-50"
              >
                Ver calendario
                <ArrowRight
                  className="h-3.5 w-3.5 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5"
                  strokeWidth={2.25}
                  aria-hidden
                />
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {matches.length > 1 ? (
        <div className="mt-6 flex items-center justify-center gap-1.5" role="tablist" aria-label="Partidos próximos">
          {matches.map((m, index) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`Ver partido ${index + 1} de ${matches.length}`}
              onClick={() => goTo(index)}
              className={`h-1.5 rounded-full transition-all ${
                index === activeIndex ? "w-6 bg-jaguar-green-500" : "w-1.5 bg-jaguar-ink/15 hover:bg-jaguar-ink/25"
              }`}
            />
          ))}
        </div>
      ) : null}
    </motion.div>
  );
}

function NewsCard({ item }: { item: (typeof newsItems)[number] }) {
  return (
    <Link
      href={item.href}
      className="group flex w-[240px] shrink-0 snap-start flex-col gap-3 sm:w-[260px]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
        <Image
          src={item.image.src}
          alt={item.image.alt}
          fill
          sizes="260px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span
          className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.06em] text-jaguar-white ${newsCategoryClass(item.category)}`}
        >
          {item.category}
        </span>
      </div>
      <div>
        <h3 className="text-[14px] font-bold leading-snug text-jaguar-ink transition-colors group-hover:text-jaguar-green-600">
          {item.title}
        </h3>
        <p className="mt-1.5 text-[12px] text-jaguar-ink/50">{item.date}</p>
      </div>
    </Link>
  );
}

function NewsCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollByCard = (direction: 1 | -1) => {
    trackRef.current?.scrollBy({ left: direction * 280, behavior: "smooth" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="flex h-full flex-col rounded-3xl border border-jaguar-ink/5 bg-jaguar-white p-7 shadow-[0_20px_60px_-35px_rgba(13,18,16,0.25)] md:p-8"
    >
      <div className="flex items-center justify-between">
        <SectionHeading>Noticias destacadas</SectionHeading>
        <Link
          href="/noticias"
          className="group flex items-center gap-1 text-[12px] font-bold uppercase tracking-[0.08em] text-jaguar-green-600"
        >
          Ver todas
          <ArrowRight
            className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
            strokeWidth={2.25}
            aria-hidden
          />
        </Link>
      </div>

      <div className="relative mt-7 flex flex-1 items-center gap-3">
        <button
          type="button"
          aria-label="Noticia anterior"
          onClick={() => scrollByCard(-1)}
          className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border border-jaguar-ink/15 text-jaguar-ink/50 transition-colors hover:bg-jaguar-ink/5 sm:flex"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
        </button>

        <div
          ref={trackRef}
          className="flex flex-1 snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {newsItems.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>

        <button
          type="button"
          aria-label="Siguiente noticia"
          onClick={() => scrollByCard(1)}
          className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border border-jaguar-ink/15 text-jaguar-ink/50 transition-colors hover:bg-jaguar-ink/5 sm:flex"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={2} aria-hidden />
        </button>
      </div>
    </motion.div>
  );
}

interface MatchAndNewsSectionProps {
  /** Partidos confirmados y próximos, más cercano primero — ver `getUpcomingConfirmedMatches()`. */
  matches: MatchRow[];
}

/**
 * Sección "Próximo partido" + "Noticias destacadas".
 *
 * El partido usa datos reales de Supabase (solo partidos con estado
 * "Confirmado" llegan aquí, ver `getUpcomingConfirmedMatches()`); si hay
 * más de uno se muestra como slide corto. Las noticias siguen siendo
 * contenido de ejemplo — ver comentarios en `news.data.ts`.
 */
export function MatchAndNewsSection({ matches }: MatchAndNewsSectionProps) {
  return (
    <section id="proximo-partido" className="bg-jaguar-mist/40 px-4 py-16 md:px-8 md:py-20 lg:px-12">
      <div id="noticias" className="mx-auto grid max-w-[1600px] gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
        <NextMatchCard matches={matches} />
        <NewsCarousel />
      </div>
    </section>
  );
}
