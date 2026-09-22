"use client";

/** Submenú de entrenadores de la categoría activa — filtra el plantel por el entrenador elegido. "Todos" muestra todo el plantel de la categoría, igual que hoy. */
export function CoachSubmenu({
  coaches,
  active,
  onChange,
}: {
  coaches: string[];
  active: string;
  onChange: (coach: string) => void;
}) {
  if (coaches.length === 0) return null;

  const options = ["Todos", ...coaches];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[11px] lg:text-[12px] font-bold uppercase tracking-[0.03em] text-jaguar-ink/35">Entrenador</span>
      <div className="inline-flex flex-wrap items-center gap-1 rounded-full border border-jaguar-ink/10 bg-white p-1">
        {options.map((coach) => {
          const isActive = coach === active;
          return (
            <button
              key={coach}
              type="button"
              onClick={() => onChange(coach)}
              className={`rounded-full px-3.5 py-1.5 text-[12.5px] lg:text-[13.5px] font-bold transition-colors ${
                isActive ? "bg-jaguar-green-600 text-white" : "text-jaguar-ink/50 hover:bg-jaguar-mist/60"
              }`}
            >
              {coach}
            </button>
          );
        })}
      </div>
    </div>
  );
}
