"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Clock, MapPin, Trash2 } from "lucide-react";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { deleteTraining } from "@/app/plataforma/(dashboard)/entrenamientos/actions";
import type { TrainingRow } from "@/lib/data/trainings";

const monthShort = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function formatSessionDate(value: string) {
  const parts = value.split("-");
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  return `${d} de ${monthShort[m - 1]} · ${y}`;
}

function formatTime(value: string | null) {
  if (!value) return null;
  return value.slice(0, 5);
}

/** Tarjeta de una sesión de entrenamiento en el listado de Entrenamientos. */
export function TrainingCard({ training }: { training: TrainingRow }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const today = new Date().toISOString().slice(0, 10);
  const isPast = training.session_date < today;
  const timeRange = training.end_time
    ? `${formatTime(training.start_time)} – ${formatTime(training.end_time)}`
    : formatTime(training.start_time);

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteTraining(training.id);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="relative">
      <Link href={`/plataforma/entrenamientos/${training.id}`}>
        <Card className="p-5 transition-shadow hover:shadow-[0_4px_16px_-8px_rgba(13,18,16,0.18)]">
          <div className="flex items-start justify-between gap-3 pr-8">
            <h3 className="text-[14.5px] lg:text-[16px] font-bold text-jaguar-ink">{training.title}</h3>
            <Badge tone={isPast ? "neutral" : "green"}>{isPast ? "Realizada" : "Próxima"}</Badge>
          </div>

          <div className="mt-3 space-y-1.5 text-[12.5px] lg:text-[13.5px] text-jaguar-ink/55">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-3.5 w-3.5 text-jaguar-ink/35" strokeWidth={2} aria-hidden />
              {formatSessionDate(training.session_date)}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-jaguar-ink/35" strokeWidth={2} aria-hidden />
              {timeRange}
            </div>
            {training.location ? (
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-jaguar-ink/35" strokeWidth={2} aria-hidden />
                {training.location}
              </div>
            ) : null}
          </div>

          {training.notes ? (
            <p className="mt-3 line-clamp-2 text-[12px] lg:text-[13px] text-jaguar-ink/45">{training.notes}</p>
          ) : null}
        </Card>
      </Link>

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setConfirming((v) => !v);
        }}
        aria-label="Eliminar sesión"
        className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-lg text-jaguar-ink/30 transition-colors hover:bg-jaguar-maroon-500/10 hover:text-jaguar-maroon-600"
      >
        <Trash2 className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
      </button>

      {confirming ? (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-4 top-12 z-20 w-[240px] rounded-2xl border border-jaguar-ink/10 bg-white p-4 shadow-xl"
        >
          <p className="text-[12.5px] lg:text-[13.5px] font-bold text-jaguar-ink">¿Eliminar esta sesión?</p>
          <p className="mt-1 text-[11.5px] lg:text-[12.5px] text-jaguar-ink/50">
            Se borra la asistencia registrada. Las evaluaciones ya guardadas se conservan.
          </p>
          {error ? <p className="mt-2 text-[11px] lg:text-[12px] font-medium text-jaguar-maroon-600">{error}</p> : null}
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setConfirming(false);
              }}
              className="rounded-lg px-3 py-1.5 text-[12px] lg:text-[13px] font-semibold text-jaguar-ink/55 hover:bg-jaguar-ink/[0.04]"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDelete();
              }}
              disabled={isPending}
              className="rounded-lg bg-jaguar-maroon-600 px-3 py-1.5 text-[12px] lg:text-[13px] font-semibold text-white hover:bg-jaguar-maroon-700 disabled:opacity-60"
            >
              {isPending ? "Eliminando…" : "Eliminar"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
