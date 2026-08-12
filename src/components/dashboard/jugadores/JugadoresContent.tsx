"use client";

import { useMemo, useState } from "react";
import { SearchX } from "lucide-react";
import type { RosterPlayer } from "../data/jugadores-page.data";
import { defaultPlayersFilters, PlayersFilters, type PlayersFilterState, type PlayersView } from "./PlayersFilters";
import { PlayersGrid } from "./PlayersGrid";
import { PlayersTableView } from "./PlayersTableView";

function norm(s: string) {
  return s.trim().toLowerCase();
}

/** Filtros + selector de vista + listado del plantel (tarjetas o tabla) — filtrado real sobre datos del plantel. */
export function JugadoresContent({ players }: { players: RosterPlayer[] }) {
  const [view, setView] = useState<PlayersView>("tarjetas");
  const [filters, setFilters] = useState<PlayersFilterState>(defaultPlayersFilters);

  const categories = useMemo(() => Array.from(new Set(players.map((p) => p.category))).sort(), [players]);
  const positions = useMemo(() => Array.from(new Set(players.map((p) => p.position))).sort(), [players]);
  const feet = useMemo(
    () => Array.from(new Set(players.map((p) => p.dominantFoot).filter((f): f is string => Boolean(f)))).sort(),
    [players],
  );
  const ages = useMemo(() => Array.from(new Set(players.map((p) => p.age))).sort((a, b) => a - b), [players]);

  const filteredPlayers = useMemo(() => {
    const query = norm(filters.search);
    return players.filter((p) => {
      if (query && !norm(p.name).includes(query) && !norm(p.nickname ?? "").includes(query)) return false;
      if (filters.category !== "Todas" && p.category !== filters.category) return false;
      if (filters.position !== "Todas" && p.position !== filters.position) return false;
      if (filters.status !== "Todos" && p.status !== filters.status) return false;
      if (filters.foot !== "Todos" && p.dominantFoot !== filters.foot) return false;
      if (filters.age !== "Todas" && String(p.age) !== filters.age) return false;
      return true;
    });
  }, [players, filters]);

  const noResultsFromFilters = players.length > 0 && filteredPlayers.length === 0;

  return (
    <div className="space-y-5">
      <PlayersFilters
        view={view}
        onViewChange={setView}
        total={filteredPlayers.length}
        filters={filters}
        onFiltersChange={setFilters}
        categories={categories}
        positions={positions}
        feet={feet}
        ages={ages}
      />

      {noResultsFromFilters ? (
        <div className="flex flex-col items-center justify-center rounded-[18px] border border-dashed border-jaguar-ink/12 bg-white py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-jaguar-mist text-jaguar-ink/40">
            <SearchX className="h-6 w-6" strokeWidth={1.75} aria-hidden />
          </span>
          <p className="mt-4 text-[14px] lg:text-[15.5px] font-bold text-jaguar-ink">Ningún jugador coincide con estos filtros</p>
          <p className="mt-1 max-w-xs text-[13px] lg:text-[14px] text-jaguar-ink/50">
            Prueba a ajustar la búsqueda o limpiar los filtros para ver el resto del plantel.
          </p>
          <button
            type="button"
            onClick={() => setFilters(defaultPlayersFilters)}
            className="mt-4 rounded-xl bg-jaguar-green-600 px-4 py-2 text-[13px] lg:text-[14px] font-semibold text-white hover:bg-jaguar-green-700"
          >
            Limpiar filtros
          </button>
        </div>
      ) : view === "tarjetas" ? (
        <PlayersGrid players={filteredPlayers} />
      ) : (
        <PlayersTableView players={filteredPlayers} />
      )}
    </div>
  );
}
