"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { TrainingRow } from "@/lib/data/trainings";

const monthShort = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function formatShort(value: string) {
  const parts = value.split("-");
  return `${Number(parts[2])} ${monthShort[(Number(parts[1]) || 1) - 1]}`;
}

/** Selector de sesión — "el entrenador selecciona la sesión" del flujo de Asistencia/Evaluaciones. */
export function SessionSelector({
  trainings,
  selectedId,
  basePath,
  category,
}: {
  trainings: TrainingRow[];
  selectedId: string;
  basePath: string;
  category: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleChange(id: string) {
    startTransition(() => {
      router.push(`${basePath}?categoria=${category}&sesion=${id}`);
    });
  }

  if (trainings.length === 0) return null;

  return (
    <select
      value={selectedId}
      onChange={(e) => handleChange(e.target.value)}
      disabled={isPending}
      className={`w-full min-w-0 rounded-xl border border-jaguar-ink/10 bg-white px-3.5 py-2.5 text-[13px] lg:text-[14px] font-semibold text-jaguar-ink focus:border-jaguar-green-500/40 focus:outline-none sm:w-auto sm:max-w-[240px] ${isPending ? "opacity-60" : ""}`}
    >
      {trainings.map((t) => (
        <option key={t.id} value={t.id}>
          {formatShort(t.session_date)} · {t.title}
        </option>
      ))}
    </select>
  );
}
