import Link from "next/link";
import type { ComponentType } from "react";
import { CheckCircle2, ClipboardCheck, ClipboardList, Trophy, Wallet } from "lucide-react";
import { Card } from "./ui/Card";
import type { ActionQueue } from "@/lib/data/action-queue";

function QueueCard({
  icon: Icon,
  title,
  description,
  href,
  pending,
  doneLabel,
}: {
  icon: ComponentType<{ className?: string; strokeWidth?: number; "aria-hidden"?: boolean }>;
  title: string;
  description: string;
  href: string;
  pending: boolean;
  doneLabel: string;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col gap-3 rounded-[18px] border p-4 transition-shadow hover:shadow-[0_4px_16px_-8px_rgba(13,18,16,0.18)] ${
        pending ? "border-jaguar-gold-500/30 bg-jaguar-gold-500/[0.04]" : "border-jaguar-ink/8 bg-white"
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${
            pending ? "bg-jaguar-gold-500/15 text-jaguar-gold-600" : "bg-jaguar-green-50 text-jaguar-green-600"
          }`}
        >
          {pending ? <Icon className="h-4.5 w-4.5" strokeWidth={1.9} aria-hidden /> : <CheckCircle2 className="h-4.5 w-4.5" strokeWidth={1.9} aria-hidden />}
        </span>
      </div>
      <div>
        <p className="text-[13.5px] lg:text-[15px] font-bold text-jaguar-ink">{title}</p>
        <p className="mt-0.5 text-[12px] lg:text-[13px] text-jaguar-ink/50">{pending ? description : doneLabel}</p>
      </div>
    </Link>
  );
}

/** Cola de acción del día — lo primero que ve el entrenador, antes que cualquier KPI. */
export function TodayActionQueue({ queue }: { queue: ActionQueue }) {
  const anyPending =
    queue.attendance.pending || queue.evaluations.pendingCount > 0 || queue.callups.pending || queue.finance.overdueCount > 0;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[13px] lg:text-[14px] font-bold uppercase tracking-[0.03em] text-jaguar-ink/45">Qué necesito hacer hoy</p>
        {!anyPending ? <p className="text-[12px] lg:text-[13px] font-semibold text-jaguar-green-600">Todo al día ✓</p> : null}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <QueueCard
          icon={ClipboardCheck}
          title="Asistencia"
          description={queue.attendance.trainingLabel ? `Falta registrar: ${queue.attendance.trainingLabel}` : "Sin sesión próxima"}
          doneLabel="Asistencia al día"
          pending={queue.attendance.pending}
          href={
            queue.attendance.trainingId
              ? `/plataforma/asistencia?categoria=${queue.attendance.category}&sesion=${queue.attendance.trainingId}`
              : "/plataforma/asistencia"
          }
        />
        <QueueCard
          icon={ClipboardList}
          title="Evaluaciones"
          description={
            queue.evaluations.pendingCount > 0
              ? `${queue.evaluations.pendingCount} de ${queue.evaluations.totalCount} jugadores sin evaluar`
              : "Sin evaluaciones pendientes"
          }
          doneLabel="Evaluaciones al día"
          pending={queue.evaluations.pendingCount > 0}
          href={
            queue.evaluations.trainingId
              ? `/plataforma/evaluaciones?categoria=${queue.evaluations.category}&sesion=${queue.evaluations.trainingId}`
              : "/plataforma/evaluaciones"
          }
        />
        <QueueCard
          icon={Trophy}
          title="Convocatoria"
          description={queue.callups.matchLabel ? `${queue.callups.matchLabel} sin confirmar` : "Sin partido próximo"}
          doneLabel={queue.callups.matchLabel ? `${queue.callups.confirmedCount} confirmados — ${queue.callups.matchLabel}` : "Sin partido próximo"}
          pending={queue.callups.pending}
          href={queue.callups.matchId ? `/plataforma/partidos/${queue.callups.matchId}` : "/plataforma/partidos"}
        />
        <QueueCard
          icon={Wallet}
          title="Cobros"
          description={
            queue.finance.overdueCount > 0
              ? `${queue.finance.overdueCount} vencido${queue.finance.overdueCount === 1 ? "" : "s"}`
              : queue.finance.pendingCount > 0
                ? `${queue.finance.pendingCount} pendiente${queue.finance.pendingCount === 1 ? "" : "s"} — próximo vence ${queue.finance.nearestDueLabel}`
                : "Sin cobros pendientes"
          }
          doneLabel={
            queue.finance.pendingCount > 0
              ? `${queue.finance.pendingCount} pendiente${queue.finance.pendingCount === 1 ? "" : "s"} — próximo vence ${queue.finance.nearestDueLabel}`
              : "Cobros al día"
          }
          pending={queue.finance.overdueCount > 0}
          href="/plataforma/finanzas/cuentas-por-cobrar"
        />
      </div>
    </div>
  );
}
