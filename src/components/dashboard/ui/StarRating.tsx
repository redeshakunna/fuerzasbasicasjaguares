import { Star } from "lucide-react";

/**
 * Calificación por estrellas (0-5, admite medios puntos) — usada en las
 * tarjetas de jugadores como resumen visual rápido de nivel/potencial.
 */
export function StarRating({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${value} de 5 estrellas`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Star
              className="absolute inset-0 text-jaguar-ink/15"
              style={{ width: size, height: size }}
              strokeWidth={0}
              fill="currentColor"
              aria-hidden
            />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star
                className="text-jaguar-gold-500"
                style={{ width: size, height: size }}
                strokeWidth={0}
                fill="currentColor"
                aria-hidden
              />
            </span>
          </span>
        );
      })}
    </div>
  );
}
