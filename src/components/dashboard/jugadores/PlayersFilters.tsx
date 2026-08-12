"use client";

import { LayoutGrid, List, Search, X } from "lucide-react";
import { Card } from "../ui/Card";

export type PlayersView = "tarjetas" | "tabla";

export interface PlayersFilterState {
  search: string;
  category: string;
  position: string;
  status: string;
  foot: string;
  age: string;
}

export const defaultPlayersFilters: PlayersFilterState = {
  search: "",
  category: "Todas",
  position: "Todas",
  status: "Todos",
  foot: "Todos",
  age: "Todas",
};

export function hasActiveFilters(filters: PlayersFilterState): boolean {
  return (
    filters.search.trim() !== "" ||
    filters.category !== defaultPlayersFilters.category ||
    filters.position !== defaultPlayersFilters.position ||
    filters.status !== defaultPlayersFilters.status ||
    filters.foot !== defaultPlayersFilters.foot ||
    filters.age !== defaultPlayersFilters.age
  );
}

function FilterSelect({
  label,
  value,
  options,
  allLabel,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  allLabel: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex min-w-[128px] flex-col gap-1">
      <span className="text-[10.5px] lg:text-[11.5px] font-bold uppercase tracking-[0.03em] text-jaguar-ink/40">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-jaguar-ink/10 bg-white py-2.5 pl-3 pr-8 text-[13px] lg:text-[14px] font-medium text-jaguar-ink/75 focus:border-jaguar-green-500/40 focus:outline-none focus:ring-2 focus:ring-jaguar-green-500/10"
      >
        <option value={allLabel}>{allLabel}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}

interface PlayersFiltersProps {
  view: PlayersView;
  onViewChange: (view: PlayersView) => void;
  total: number;
  filters: PlayersFilterState;
  onFiltersChange: (filters: PlayersFilterState) => void;
  categories: string[];
  positions: string[];
  feet: string[];
  ages: number[];
}

/** Barra de búsqueda + filtros reales del plantel (categoría, posición, estado, pie hábil, edad) + selector de vista. */
export function PlayersFilters({
  view,
  onViewChange,
  total,
  filters,
  onFiltersChange,
  categories,
  positions,
  feet,
  ages,
}: PlayersFiltersProps) {
  const active = hasActiveFilters(filters);

  function update<K extends keyof PlayersFilterState>(key: K, value: PlayersFilterState[K]) {
    onFiltersChange({ ...filters, [key]: value });
  }

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2.5">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-jaguar-ink/35"
            strokeWidth={1.8}
            aria-hidden
          />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => update("search", e.target.value)}
            placeholder="Buscar jugador por nombre o apodo…"
            className="w-full rounded-xl border border-jaguar-ink/10 bg-jaguar-mist/50 py-2.5 pl-10 pr-4 text-[13.5px] lg:text-[15px] text-jaguar-ink placeholder:text-jaguar-ink/35 focus:border-jaguar-green-500/40 focus:outline-none focus:ring-2 focus:ring-jaguar-green-500/10"
          />
          {filters.search ? (
            <button
              type="button"
              onClick={() => update("search", "")}
              aria-label="Borrar búsqueda"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-jaguar-ink/30 hover:text-jaguar-ink/60"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            </button>
          ) : null}
        </div>

        <div className="flex items-center gap-1 rounded-xl bg-jaguar-mist/60 p-1">
          <button
            type="button"
            onClick={() => onViewChange("tarjetas")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] lg:text-[13.5px] font-semibold transition-colors ${
              view === "tarjetas" ? "bg-jaguar-green-600 text-white" : "text-jaguar-ink/55 hover:text-jaguar-ink"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            Tarjetas
          </button>
          <button
            type="button"
            onClick={() => onViewChange("tabla")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] lg:text-[13.5px] font-semibold transition-colors ${
              view === "tabla" ? "bg-jaguar-green-600 text-white" : "text-jaguar-ink/55 hover:text-jaguar-ink"
            }`}
          >
            <List className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            Tabla
          </button>
        </div>
      </div>

      <div className="mt-3.5 flex flex-wrap items-end gap-2.5 border-t border-jaguar-ink/6 pt-3.5">
        <FilterSelect label="Categoría" allLabel="Todas" value={filters.category} options={categories} onChange={(v) => update("category", v)} />
        <FilterSelect label="Posición" allLabel="Todas" value={filters.position} options={positions} onChange={(v) => update("position", v)} />
        <FilterSelect label="Estado" allLabel="Todos" value={filters.status} options={["Disponible", "Suspendido", "Lesionado"]} onChange={(v) => update("status", v)} />
        <FilterSelect label="Pie hábil" allLabel="Todos" value={filters.foot} options={feet} onChange={(v) => update("foot", v)} />
        <FilterSelect
          label="Edad"
          allLabel="Todas"
          value={filters.age}
          options={ages.map(String)}
          onChange={(v) => update("age", v)}
        />

        {active ? (
          <button
            type="button"
            onClick={() => onFiltersChange(defaultPlayersFilters)}
            className="mb-0.5 inline-flex items-center gap-1 text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-green-600 transition-colors hover:text-jaguar-green-700"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden />
            Limpiar filtros
          </button>
        ) : null}
      </div>

      <div className="mt-3.5 border-t border-jaguar-ink/6 pt-3.5">
        <p className="text-[12.5px] lg:text-[13.5px] text-jaguar-ink/45">
          {total} {total === 1 ? "jugador encontrado" : "jugadores encontrados"}
        </p>
      </div>
    </Card>
  );
}
