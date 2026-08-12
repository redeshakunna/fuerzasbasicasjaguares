"use client";

import { useState } from "react";
import { Info, Users } from "lucide-react";
import { PlayersTable } from "./PlayersTable";
import { Card, CardHeader } from "./ui/Card";
import { categories, activeCategories, type Category } from "@/lib/data/categories";
import type { RosterPlayer } from "./data/jugadores-page.data";

/**
 * Jugadores destacados del Home — con tabs propias de categoría (Sub-13/15/17) para no depender
 * del selector de categoría de toda la página. Cada tab trae su propio plantel real; las categorías
 * sin plantel activo muestran un estado "próximamente" en vez de una tabla vacía.
 */
export function PlayersTableWidget({ rostersByCategory }: { rostersByCategory: Record<Category, RosterPlayer[]> }) {
  const [active, setActive] = useState<Category>(
    activeCategories[0] ?? categories[0] ?? "Sub-15",
  );

  const hasData = activeCategories.includes(active);
  const players = rostersByCategory[active] ?? [];

  return (
    <Card className="overflow-hidden pb-2">
      <CardHeader
        title="Jugadores destacados"
        subtitle="Ordenado por nivel"
        action={
          <div className="inline-flex items-center gap-1 rounded-full border border-jaguar-ink/10 bg-jaguar-mist/50 p-1">
            {categories.map((cat) => {
              const isActive = cat === active;
              const catHasData = activeCategories.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActive(cat)}
                  className={`relative rounded-full px-3 py-1.5 text-[12px] lg:text-[13px] font-bold transition-colors ${
                    isActive ? "bg-jaguar-green-600 text-white" : "text-jaguar-ink/50 hover:bg-white"
                  }`}
                >
                  {cat}
                  {!catHasData ? (
                    <span
                      className={`ml-1.5 inline-block h-1.5 w-1.5 rounded-full ${isActive ? "bg-white/70" : "bg-jaguar-gold-500"}`}
                      title="Próximamente"
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
        }
      />

      {!hasData ? (
        <div className="mt-2 flex flex-col items-center gap-2 px-6 py-10 text-center">
          <Info className="h-6 w-6 text-jaguar-ink/20" strokeWidth={1.6} aria-hidden />
          <p className="text-[12.5px] lg:text-[13.5px] text-jaguar-ink/45">
            {active} aún no tiene plantel activo — llegará próximamente.
          </p>
        </div>
      ) : players.length === 0 ? (
        <div className="mt-2 flex flex-col items-center gap-2 px-6 py-10 text-center">
          <Users className="h-6 w-6 text-jaguar-ink/20" strokeWidth={1.6} aria-hidden />
          <p className="text-[12.5px] lg:text-[13.5px] text-jaguar-ink/45">Aún no hay jugadores registrados en {active}.</p>
        </div>
      ) : (
        <div className="mt-2">
          <PlayersTableBody players={players} />
        </div>
      )}
    </Card>
  );
}

/** Solo la tabla interna (sin el Card/CardHeader que ya puso PlayersTableWidget). */
function PlayersTableBody({ players }: { players: RosterPlayer[] }) {
  return <PlayersTable players={players} embedded />;
}
