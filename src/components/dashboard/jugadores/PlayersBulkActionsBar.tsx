"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, UserRound, X } from "lucide-react";
import { bulkAssignCoach, bulkDeletePlayers } from "@/app/plataforma/(dashboard)/jugadores/actions";
import type { StaffProfile } from "@/lib/data/staff";

const UNASSIGN = "__unassign__";

/** Barra flotante de acciones en bloque — aparece con la selección múltiple de la tabla de jugadores. */
export function PlayersBulkActionsBar({
  selectedIds,
  coaches,
  canAssignCoach,
  canDelete,
  onClear,
}: {
  selectedIds: string[];
  coaches: StaffProfile[];
  canAssignCoach: boolean;
  canDelete: boolean;
  onClear: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assignValue, setAssignValue] = useState("");

  const count = selectedIds.length;
  if (count === 0) return null;

  function runAssign(value: string) {
    setError(null);
    setAssignValue(value);
    startTransition(async () => {
      const result = await bulkAssignCoach(selectedIds, value === UNASSIGN ? null : value);
      setAssignValue("");
      router.refresh();
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.failedCount) {
        // Éxito parcial — dejamos la selección puesta para que el mensaje no
        // desaparezca solo, así el admin ve a cuántos no se les pudo asignar.
        setError(`Se asignó a ${count - result.failedCount} de ${count} — ${result.failedCount} no se pudieron actualizar.`);
        return;
      }
      onClear();
    });
  }

  function runDelete() {
    setError(null);
    startTransition(async () => {
      const result = await bulkDeletePlayers(selectedIds);
      setConfirmDeleteOpen(false);
      router.refresh();
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.failedCount) {
        setError(`Se eliminó a ${count - result.failedCount} de ${count} — ${result.failedCount} no se pudieron eliminar (probablemente tienen historial vinculado).`);
        return;
      }
      onClear();
    });
  }

  return (
    <div className="sticky top-2 z-20 flex flex-col gap-2 rounded-2xl border border-jaguar-green-500/25 bg-white px-4 py-3 shadow-[0_8px_24px_-12px_rgba(13,18,16,0.22)]">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[13px] lg:text-[14px] font-bold text-jaguar-ink">
          {count} {count === 1 ? "jugador seleccionado" : "jugadores seleccionados"}
        </span>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          {canAssignCoach ? (
            <label className="flex items-center gap-1.5 rounded-xl border border-jaguar-ink/10 px-2.5 py-1.5 hover:bg-jaguar-ink/[0.02]">
              <UserRound className="h-3.5 w-3.5 shrink-0 text-jaguar-ink/40" strokeWidth={2} aria-hidden />
              <select
                value={assignValue}
                disabled={isPending}
                onChange={(e) => e.target.value && runAssign(e.target.value)}
                className="max-w-[180px] bg-transparent text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-ink/70 focus:outline-none"
              >
                <option value="">Asignar a entrenador…</option>
                {coaches.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name}
                  </option>
                ))}
                <option value={UNASSIGN}>Sin asignar</option>
              </select>
            </label>
          ) : null}

          {canDelete ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setConfirmDeleteOpen((v) => !v)}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 rounded-xl border border-jaguar-maroon-500/20 px-2.5 py-1.5 text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-maroon-600 hover:bg-jaguar-maroon-500/8 disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                Eliminar
              </button>
              {confirmDeleteOpen ? (
                <div className="absolute right-0 top-full z-30 mt-2 w-[260px] rounded-2xl border border-jaguar-ink/10 bg-white p-3.5 shadow-xl">
                  <p className="text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-ink">
                    ¿Eliminar {count} {count === 1 ? "jugador" : "jugadores"}?
                  </p>
                  <p className="mt-1 text-[11.5px] lg:text-[12.5px] text-jaguar-ink/50">Esta acción no se puede deshacer.</p>
                  <div className="mt-2.5 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteOpen(false)}
                      className="rounded-lg px-2.5 py-1.5 text-[11.5px] lg:text-[12.5px] font-semibold text-jaguar-ink/55 hover:bg-jaguar-ink/[0.04]"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={runDelete}
                      disabled={isPending}
                      className="rounded-lg bg-jaguar-maroon-600 px-2.5 py-1.5 text-[11.5px] lg:text-[12.5px] font-semibold text-white hover:bg-jaguar-maroon-700 disabled:opacity-60"
                    >
                      {isPending ? "Eliminando…" : "Eliminar"}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          <button
            type="button"
            onClick={onClear}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-jaguar-ink/40 hover:bg-jaguar-ink/[0.05]"
            aria-label="Cancelar selección"
          >
            <X className="h-4 w-4" strokeWidth={2} aria-hidden />
          </button>
        </div>
      </div>
      {error ? <p className="text-[11.5px] lg:text-[12.5px] font-medium text-jaguar-maroon-600">{error}</p> : null}
    </div>
  );
}
