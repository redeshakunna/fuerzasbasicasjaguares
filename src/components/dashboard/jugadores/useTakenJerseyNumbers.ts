"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const CATEGORY = "Sub-15";

/**
 * Trae en tiempo real los números de camiseta ya asignados en la categoría
 * (Sub-15), para validar en el formulario antes de que el jugador choque
 * con la restricción única de la base de datos. `excludePlayerId` se usa al
 * editar, para no marcar como "ocupado" el número que el propio jugador ya
 * tiene.
 */
export function useTakenJerseyNumbers(enabled: boolean, excludePlayerId?: string) {
  const [taken, setTaken] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    async function load() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("players")
        .select("id, jersey_number")
        .eq("category", CATEGORY)
        .not("jersey_number", "is", null);

      if (cancelled || error || !data) return;

      const nums = new Set(
        data
          .filter((p) => p.id !== excludePlayerId && p.jersey_number !== null)
          .map((p) => p.jersey_number as number)
      );
      setTaken(nums);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [enabled, excludePlayerId]);

  return taken;
}
