"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardHeader } from "../ui/Card";
import { matchOutcome, outcomeDotClass } from "@/lib/data/match-stats";
import type { MatchRow } from "@/lib/data/matches";

const monthNames = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const weekDayLetters = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];

function parseYmd(value: string) {
  const parts = value.split("-");
  return { y: Number(parts[0]) || 1970, m: (Number(parts[1]) || 1) - 1, d: Number(parts[2]) || 1 };
}

/** Calendario mensual con estado color-codificado por partido — Verde/Rojo/Amarillo/Azul. */
export function MatchesCalendarMonth({ matches, onSelect }: { matches: MatchRow[]; onSelect: (matchId: string) => void }) {
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const matchesByDay = useMemo(() => {
    const map = new Map<number, MatchRow[]>();
    for (const match of matches) {
      const { y, m, d } = parseYmd(match.match_date);
      if (y === cursor.getFullYear() && m === cursor.getMonth()) {
        const arr = map.get(d) ?? [];
        arr.push(match);
        map.set(d, arr);
      }
    }
    return map;
  }, [matches, cursor]);

  const firstDayOfMonth = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const leadingBlank = (firstDayOfMonth.getDay() + 6) % 7;

  const cells: (number | null)[] = [
    ...Array.from({ length: leadingBlank }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function isToday(day: number) {
    return day === today.getDate() && cursor.getMonth() === today.getMonth() && cursor.getFullYear() === today.getFullYear();
  }

  return (
    <Card className="pb-5">
      <CardHeader
        title="Calendario"
        action={
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-jaguar-ink/40 hover:bg-jaguar-mist/60"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => setCursor(new Date(today.getFullYear(), today.getMonth(), 1))}
              className="rounded-lg px-2 py-1 text-[11.5px] lg:text-[12.5px] font-semibold text-jaguar-ink/50 hover:bg-jaguar-mist/60"
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-jaguar-ink/40 hover:bg-jaguar-mist/60"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={2} aria-hidden />
            </button>
          </div>
        }
      />
      <p className="mt-1 px-6 text-[13px] lg:text-[14px] font-bold text-jaguar-ink">
        {monthNames[cursor.getMonth()]} {cursor.getFullYear()}
      </p>

      <div className="mt-4 grid grid-cols-7 gap-1 px-4">
        {weekDayLetters.map((w) => (
          <p key={w} className="text-center text-[10px] lg:text-[11px] font-bold uppercase text-jaguar-ink/35">
            {w}
          </p>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={`blank-${i}`} />;
          const dayMatches = matchesByDay.get(day) ?? [];
          return (
            <button
              type="button"
              key={day}
              disabled={dayMatches.length === 0}
              onClick={() => dayMatches[0] && onSelect(dayMatches[0].id)}
              className={`flex h-10 flex-col items-center justify-center gap-0.5 rounded-lg text-[12px] lg:text-[13px] font-semibold transition-colors ${
                isToday(day)
                  ? "bg-jaguar-green-600 text-white"
                  : dayMatches.length > 0
                    ? "text-jaguar-ink hover:bg-jaguar-mist/60"
                    : "text-jaguar-ink/40"
              }`}
            >
              {day}
              {dayMatches.length > 0 ? (
                <span className="flex gap-0.5">
                  {dayMatches.slice(0, 3).map((m) => (
                    <span key={m.id} className={`h-1.5 w-1.5 rounded-full ${isToday(day) ? "bg-white" : outcomeDotClass[matchOutcome(m)]}`} />
                  ))}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 px-6 text-[11px] lg:text-[12px] text-jaguar-ink/50">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-jaguar-green-600" />
          Ganado
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-jaguar-gold-500" />
          Empatado
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-jaguar-maroon-500" />
          Perdido
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-jaguar-turquoise-500" />
          Programado
        </span>
      </div>
    </Card>
  );
}
