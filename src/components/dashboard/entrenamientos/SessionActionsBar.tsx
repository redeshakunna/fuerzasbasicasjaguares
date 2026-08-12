"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, Copy, MessageCircle, PenLine, Printer, Trash2, UserCheck } from "lucide-react";
import { deleteTraining, duplicateTraining } from "@/app/plataforma/(dashboard)/entrenamientos/actions";
import { buildWhatsAppCitation, whatsAppShareUrl } from "@/lib/training/whatsapp";

interface SessionActionsBarProps {
  trainingId: string;
  category: string;
  sessionDate: string;
  startTime: string;
  durationMin: number | null;
  location: string | null;
  objectiveSummary: string;
}

export function SessionActionsBar({
  trainingId,
  category,
  sessionDate,
  startTime,
  durationMin,
  location,
  objectiveSummary,
}: SessionActionsBarProps) {
  const router = useRouter();
  const [showDuplicate, setShowDuplicate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [newDate, setNewDate] = useState(sessionDate);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  const whatsAppMessage = buildWhatsAppCitation({ category, sessionDate, startTime, durationMin, location, objectiveSummary });

  function confirmDuplicate() {
    setDuplicateError(null);
    startTransition(async () => {
      const result = await duplicateTraining(trainingId, newDate);
      if (result.error || !result.id) {
        setDuplicateError(result.error ?? "No se pudo duplicar.");
        return;
      }
      router.push(`/plataforma/entrenamientos/${result.id}`);
    });
  }

  function confirmDelete() {
    setDeleteError(null);
    startDeleteTransition(async () => {
      const result = await deleteTraining(trainingId);
      if (result.error) {
        setDeleteError(result.error);
        return;
      }
      router.push("/plataforma/entrenamientos");
    });
  }

  const buttonClass =
    "inline-flex items-center gap-1.5 rounded-xl border border-jaguar-ink/12 bg-white px-3.5 py-2 text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-ink/70 transition-colors hover:bg-jaguar-ink/[0.03]";

  return (
    <div className="relative flex flex-wrap items-center gap-2.5">
      <Link href={`/plataforma/entrenamientos/${trainingId}/editar`} className={buttonClass}>
        <PenLine className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
        Editar
      </Link>

      <Link href={`/plataforma/entrenamientos/${trainingId}/imprimir`} target="_blank" className={buttonClass}>
        <Printer className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
        Imprimir PDF
      </Link>

      <a
        href={whatsAppShareUrl(whatsAppMessage)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-xl bg-[#25D366] px-3.5 py-2 text-[12.5px] lg:text-[13.5px] font-semibold text-white transition-opacity hover:opacity-90"
      >
        <MessageCircle className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
        Compartir citación
      </a>

      <button type="button" onClick={() => setShowDuplicate((v) => !v)} className={buttonClass}>
        <Copy className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
        Duplicar
      </button>

      <Link href={`/plataforma/asistencia?categoria=${category}&sesion=${trainingId}`} className={buttonClass}>
        <UserCheck className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
        Agregar asistencia
      </Link>

      <Link href={`/plataforma/evaluaciones?categoria=${category}&sesion=${trainingId}`} className={buttonClass}>
        Registrar evaluación
      </Link>

      <button
        type="button"
        onClick={() => setShowDelete((v) => !v)}
        className="ml-auto inline-flex items-center gap-1.5 rounded-xl border border-jaguar-ink/12 bg-white px-3.5 py-2 text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-maroon-600 transition-colors hover:bg-jaguar-maroon-500/8"
      >
        <Trash2 className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
        Eliminar
      </button>

      {showDelete ? (
        <div className="absolute right-0 top-full z-10 mt-2 w-[280px] rounded-2xl border border-jaguar-ink/10 bg-white p-4 shadow-xl">
          <p className="flex items-center gap-1.5 text-[12.5px] lg:text-[13.5px] font-bold text-jaguar-ink">
            <Trash2 className="h-3.5 w-3.5 text-jaguar-maroon-600" strokeWidth={2.25} aria-hidden />
            ¿Eliminar esta sesión?
          </p>
          <p className="mt-1 text-[12px] lg:text-[13px] text-jaguar-ink/50">
            Se borra la asistencia registrada. Las evaluaciones ya guardadas se conservan. Esta acción no se puede deshacer.
          </p>
          {deleteError ? <p className="mt-2 text-[11.5px] lg:text-[12.5px] font-medium text-jaguar-maroon-600">{deleteError}</p> : null}
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowDelete(false)}
              className="rounded-lg px-3 py-1.5 text-[12px] lg:text-[13px] font-semibold text-jaguar-ink/55 hover:bg-jaguar-ink/[0.04]"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              disabled={isDeleting}
              className="rounded-lg bg-jaguar-maroon-600 px-3 py-1.5 text-[12px] lg:text-[13px] font-semibold text-white hover:bg-jaguar-maroon-700 disabled:opacity-60"
            >
              {isDeleting ? "Eliminando…" : "Eliminar sesión"}
            </button>
          </div>
        </div>
      ) : null}

      {showDuplicate ? (
        <div className="absolute left-0 top-full z-10 mt-2 w-[280px] rounded-2xl border border-jaguar-ink/10 bg-white p-4 shadow-xl">
          <p className="flex items-center gap-1.5 text-[12.5px] lg:text-[13.5px] font-bold text-jaguar-ink">
            <Calendar className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
            Duplicar sesión
          </p>
          <p className="mt-1 text-[12px] lg:text-[13px] text-jaguar-ink/50">Elige la fecha para la nueva sesión (misma configuración).</p>
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="mt-2.5 w-full rounded-xl border border-jaguar-ink/10 bg-jaguar-mist/40 px-3 py-2 text-[13px] lg:text-[14px]"
          />
          {duplicateError ? <p className="mt-2 text-[11.5px] lg:text-[12.5px] font-medium text-jaguar-maroon-600">{duplicateError}</p> : null}
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowDuplicate(false)}
              className="rounded-lg px-3 py-1.5 text-[12px] lg:text-[13px] font-semibold text-jaguar-ink/55 hover:bg-jaguar-ink/[0.04]"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmDuplicate}
              disabled={isPending}
              className="rounded-lg bg-jaguar-green-600 px-3 py-1.5 text-[12px] lg:text-[13px] font-semibold text-white hover:bg-jaguar-green-700 disabled:opacity-60"
            >
              {isPending ? "Duplicando…" : "Duplicar"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
