"use client";

import { Star } from "lucide-react";

/** Control de calificación por estrellas (0-5, clics enteros) — para evaluaciones rápidas. */
export function StarRatingInput({
  value,
  onChange,
  size = 22,
}: {
  value: number;
  onChange: (value: number) => void;
  size?: number;
}) {
  return (
    <div className="flex items-center gap-1" role="radiogroup">
      {Array.from({ length: 5 }).map((_, i) => {
        const starValue = i + 1;
        const filled = value >= starValue;
        return (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={filled}
            aria-label={`${starValue} de 5`}
            onClick={() => onChange(value === starValue ? starValue - 1 : starValue)}
            className="flex min-h-[44px] min-w-[36px] items-center justify-center transition-transform hover:scale-110"
          >
            <Star
              style={{ width: size, height: size }}
              className={filled ? "text-jaguar-gold-500" : "text-jaguar-ink/15"}
              strokeWidth={0}
              fill="currentColor"
              aria-hidden
            />
          </button>
        );
      })}
    </div>
  );
}
