"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy, Loader2, PenLine, Plus, Trash2, X } from "lucide-react";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Field, inputClass, labelClass } from "../jugadores/FormField";
import { conceptIcon, conceptIconClass } from "./shared";
import {
  actualizarConcepto,
  alternarEstadoConcepto,
  crearConcepto,
  eliminarConcepto,
  type ConceptInput,
} from "@/app/plataforma/(dashboard)/finanzas/actions";
import type { ConceptRow } from "@/lib/data/finance";
import { formatCOP } from "@/lib/finance/format";

const emptyForm: ConceptInput = { name: "", description: "", suggestedAmount: 0, isRecurring: false };

function ConceptDialog({
  concept,
  onClose,
}: {
  concept: ConceptRow | null; // null = crear nuevo
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<ConceptInput>(
    concept
      ? {
          name: concept.name,
          description: concept.description ?? "",
          suggestedAmount: concept.suggestedAmount,
          isRecurring: concept.isRecurring,
        }
      : emptyForm,
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = concept ? await actualizarConcepto(concept.id, form) : await crearConcepto(form);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-jaguar-ink/40 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-[440px] flex-col rounded-[18px] bg-white shadow-2xl">
        <div className="flex items-center justify-between px-6 pt-6">
          <h2 className="text-[17px] lg:text-[18.5px] font-extrabold text-jaguar-ink">
            {concept ? "Editar concepto" : "Nuevo concepto"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-jaguar-ink/40 hover:bg-jaguar-ink/[0.05]"
          >
            <X className="h-4 w-4" strokeWidth={2} aria-hidden />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 flex-1 overflow-y-auto px-6 pb-2">
          <div className="space-y-4">
            <Field label="Nombre *">
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Ej. Mensualidad"
                className={inputClass}
                autoFocus
              />
            </Field>
            <Field label="Descripción">
              <input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Ej. Cuota mensual de formación deportiva."
                className={inputClass}
              />
            </Field>
            <Field label="Valor sugerido (COP)">
              <input
                type="number"
                min={0}
                step={1000}
                value={form.suggestedAmount}
                onChange={(e) => setForm((f) => ({ ...f, suggestedAmount: Number(e.target.value) }))}
                className={inputClass}
              />
            </Field>
            <label className="flex items-center gap-2.5 text-[13px] lg:text-[14px] font-semibold text-jaguar-ink/70">
              <input
                type="checkbox"
                checked={form.isRecurring}
                onChange={(e) => setForm((f) => ({ ...f, isRecurring: e.target.checked }))}
                className="h-4 w-4 rounded border-jaguar-ink/20 accent-jaguar-green-600"
              />
              Es un cobro recurrente (mensual)
            </label>
          </div>

          {error ? (
            <p className="mt-4 rounded-xl bg-jaguar-maroon-500/8 px-3.5 py-2.5 text-[13px] lg:text-[14px] font-medium text-jaguar-maroon-600">
              {error}
            </p>
          ) : null}

          <div className="sticky bottom-0 -mx-6 mt-6 flex items-center justify-between border-t border-jaguar-ink/6 bg-white px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className={`${labelClass} rounded-xl px-4 py-2.5 transition-colors hover:bg-jaguar-ink/[0.04]`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 rounded-xl bg-jaguar-green-600 px-4 py-2.5 text-[13.5px] lg:text-[15px] font-semibold text-white transition-colors hover:bg-jaguar-green-700 disabled:opacity-60"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} aria-hidden /> : null}
              {isPending ? "Guardando…" : concept ? "Guardar cambios" : "Crear concepto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ConceptCard({ c }: { c: ConceptRow }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const Icon = conceptIcon(c.name);

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await eliminarConcepto(c.id);
      if (result.error) {
        setError(result.error);
        setConfirmingDelete(false);
        return;
      }
      router.refresh();
    });
  }

  function handleToggleStatus() {
    setError(null);
    startTransition(async () => {
      const result = await alternarEstadoConcepto(c.id, c.status !== "Activo");
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleDuplicate() {
    setError(null);
    startTransition(async () => {
      const result = await crearConcepto({
        name: `${c.name} (copia)`,
        description: c.description ?? "",
        suggestedAmount: c.suggestedAmount,
        isRecurring: c.isRecurring,
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <>
      <Card className="p-5">
        <div className="flex items-start justify-between">
          <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${conceptIconClass(c.name)}`}>
            <Icon className="h-4.5 w-4.5" strokeWidth={1.9} aria-hidden />
          </span>
          <button type="button" onClick={handleToggleStatus} disabled={isPending}>
            <Badge tone={c.status === "Activo" ? "green" : "neutral"}>{c.status}</Badge>
          </button>
        </div>
        <p className="mt-3 text-[14.5px] lg:text-[16px] font-bold text-jaguar-ink">{c.name}</p>
        <p className="mt-1 text-[12.5px] lg:text-[13.5px] leading-relaxed text-jaguar-ink/50">{c.description}</p>
        <div className="mt-3 flex items-center justify-between border-t border-jaguar-ink/6 pt-3">
          <p className="text-[12px] lg:text-[13px] text-jaguar-ink/40">Valor sugerido</p>
          <p className="text-[13.5px] lg:text-[15px] font-bold text-jaguar-ink">
            {c.suggestedAmount > 0 ? formatCOP(c.suggestedAmount) : "Variable"}
          </p>
        </div>

        {error ? <p className="mt-3 text-[11.5px] font-medium text-jaguar-maroon-600">{error}</p> : null}

        {confirmingDelete ? (
          <div className="mt-4 flex items-center gap-1.5">
            <p className="flex-1 text-[12px] lg:text-[12.5px] font-semibold text-jaguar-maroon-600">
              {c.activeCount > 0 ? `Tiene ${c.activeCount} cobro(s) — no se puede borrar.` : "¿Eliminar este concepto?"}
            </p>
            {c.activeCount === 0 ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="rounded-lg bg-jaguar-maroon-600 px-2.5 py-1.5 text-[12px] font-semibold text-white hover:bg-jaguar-maroon-700 disabled:opacity-60"
              >
                {isPending ? "…" : "Sí, borrar"}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              className="rounded-lg border border-jaguar-ink/10 px-2.5 py-1.5 text-[12px] font-semibold text-jaguar-ink/60 hover:bg-jaguar-ink/[0.03]"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <div className="mt-4 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-jaguar-ink/10 px-3 py-1.5 text-[12px] lg:text-[13px] font-semibold text-jaguar-ink/70 transition-colors hover:bg-jaguar-ink/[0.03]"
            >
              <PenLine className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              Editar
            </button>
            <button
              type="button"
              onClick={handleDuplicate}
              disabled={isPending}
              className="inline-flex items-center justify-center rounded-lg border border-jaguar-ink/10 p-1.5 text-jaguar-ink/50 transition-colors hover:bg-jaguar-ink/[0.03] disabled:opacity-50"
              aria-label="Duplicar concepto"
            >
              <Copy className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="inline-flex items-center justify-center rounded-lg border border-jaguar-ink/10 p-1.5 text-jaguar-maroon-600/70 transition-colors hover:bg-jaguar-maroon-500/5"
              aria-label="Eliminar concepto"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            </button>
          </div>
        )}
      </Card>

      {editing ? <ConceptDialog concept={c} onClose={() => setEditing(false)} /> : null}
    </>
  );
}

/** Conceptos de cobro — catálogo real conectado a Supabase (crear, editar, activar/inactivar, eliminar). */
export function ConceptsGrid({ concepts }: { concepts: ConceptRow[] }) {
  const [creating, setCreating] = useState(false);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {concepts.map((c) => (
        <ConceptCard key={c.id} c={c} />
      ))}

      <button
        type="button"
        onClick={() => setCreating(true)}
        className="flex min-h-[210px] flex-col items-center justify-center gap-2 rounded-[18px] border-2 border-dashed border-jaguar-ink/12 text-jaguar-ink/35 transition-colors hover:border-jaguar-green-500/40 hover:text-jaguar-green-600"
      >
        <Plus className="h-6 w-6" strokeWidth={1.8} aria-hidden />
        <span className="text-[13px] lg:text-[14px] font-semibold">Nuevo concepto</span>
      </button>

      {creating ? <ConceptDialog concept={null} onClose={() => setCreating(false)} /> : null}
    </div>
  );
}
