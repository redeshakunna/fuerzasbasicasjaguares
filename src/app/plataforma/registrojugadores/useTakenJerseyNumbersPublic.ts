"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Variante pública (sin sesión) de `useTakenJerseyNumbers` — en vez de leer
 * directamente la tabla `players` (bloqueada por RLS para `anon`), llama a
 * la función `get_taken_jersey_numbers_sub15()`, que expone únicamente el
 * arreglo de números ya asignados en Sub-15, sin datos de jugadores.
 */
export function useTakenJerseyNumbersPublic() {
  const [taken, setTaken] = useState<Set<number>>(new Set());

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("get_taken_jersey_numbers_sub15");
      if (cancelled || error || !data) return;
      setTaken(new Set(data));
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return taken;
}
