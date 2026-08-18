"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Download } from "lucide-react";
import { DashboardButton } from "../ui/Button";
import type { Category } from "@/lib/data/categories";

const options: { estado: string; label: string }[] = [
  { estado: "todos", label: "Todos los jugadores" },
  { estado: "disponibles", label: "Disponibles" },
  { estado: "lesionados", label: "Lesionados" },
  { estado: "suspendidos", label: "Suspendidos" },
];

/** Botón "Exportar" — despliega la lista de jugadores a descargar (Disponibles/Lesionados/Suspendidos/Todos). */
export function ExportPlayersMenu({ category }: { category: Category }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <DashboardButton
        variant="secondary"
        icon={<Download className="h-4 w-4" strokeWidth={2} />}
        onClick={() => setOpen((v) => !v)}
      >
        Exportar
        <ChevronDown className="h-3.5 w-3.5" strokeWidth={2.5} />
      </DashboardButton>

      {open ? (
        <div className="absolute left-0 top-[calc(100%+6px)] z-20 w-64 overflow-hidden rounded-xl border border-jaguar-ink/10 bg-white shadow-lg">
          <div className="border-b border-jaguar-ink/8 px-3.5 py-2.5 text-[12px] font-semibold text-jaguar-ink/50">
            Elige qué lista descargar
          </div>
          {options.map((option) => (
            <a
              key={option.estado}
              href={`/plataforma/jugadores/export?estado=${option.estado}&categoria=${encodeURIComponent(category)}`}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between px-3.5 py-2.5 text-[13.5px] font-medium text-jaguar-ink hover:bg-jaguar-ink/[0.04]"
            >
              {option.label}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}
