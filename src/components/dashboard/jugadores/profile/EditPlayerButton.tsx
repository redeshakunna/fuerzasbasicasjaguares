"use client";

import { useState } from "react";
import { PencilLine } from "lucide-react";
import { EditPlayerDialog } from "./EditPlayerDialog";
import type { Tables } from "@/lib/supabase/database.types";

type PlayerRow = Tables<"players">;

/** Botón "Editar información" — solo se renderiza si el llamador ya confirmó isAdmin. */
export function EditPlayerButton({ player }: { player: PlayerRow }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-xl border border-jaguar-green-500/30 px-3.5 py-2 text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-green-700 transition-colors hover:bg-jaguar-green-50"
      >
        <PencilLine className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        Editar información
      </button>
      {open ? <EditPlayerDialog player={player} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
