"use client";

import { useState } from "react";
import { Shirt } from "lucide-react";
import { GenerateJerseyPhotoDialog } from "./GenerateJerseyPhotoDialog";
import type { Tables } from "@/lib/supabase/database.types";

type PlayerRow = Tables<"players">;

/** Botón "Generar foto con camiseta" — ícono superpuesto en el avatar, solo súper admin. */
export function GenerateJerseyPhotoButton({ player }: { player: PlayerRow }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Generar foto con camiseta"
        aria-label="Generar foto con camiseta"
        className="absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-jaguar-green-600 text-white shadow-[0_4px_10px_-2px_rgba(20,92,44,0.55)] ring-2 ring-white transition-transform hover:scale-105"
      >
        <Shirt className="h-3 w-3" strokeWidth={2.2} aria-hidden />
      </button>
      {open ? <GenerateJerseyPhotoDialog player={player} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
