import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { CalendarDays, Clock, Eye } from "lucide-react";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";

export interface ActivityMeta {
  icon: ComponentType<{ className?: string; strokeWidth?: number; "aria-hidden"?: boolean }>;
  label: ReactNode;
}

export interface RsvpSummary {
  confirmed: number;
  declined: number;
  pending: number;
}

/** Encabezado protagonista de la actividad seleccionada — versión genérica (entrenamiento o partido) del SessionInfoCard. */
export function ActivityInfoCard({
  icon: Icon,
  iconTone,
  title,
  dateLabel,
  timeLabel,
  category,
  meta,
  viewHref,
  viewLabel,
  rsvpSummary,
}: {
  icon: ComponentType<{ className?: string; strokeWidth?: number; "aria-hidden"?: boolean }>;
  iconTone: "green" | "gold";
  title: string;
  dateLabel: string;
  timeLabel: string | null;
  category: string;
  meta: ActivityMeta[];
  viewHref: string;
  viewLabel: string;
  rsvpSummary?: RsvpSummary;
}) {
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <span
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
              iconTone === "green" ? "bg-jaguar-green-50 text-jaguar-green-600" : "bg-jaguar-gold-500/12 text-jaguar-gold-700"
            }`}
          >
            <Icon className="h-7 w-7" strokeWidth={1.8} aria-hidden />
          </span>
          <div>
            <p className="text-[20px] lg:text-[25px] font-extrabold leading-tight text-jaguar-ink">{title}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] lg:text-[13.5px] text-jaguar-ink/50">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-jaguar-ink/35" strokeWidth={2} aria-hidden />
                {dateLabel}
              </span>
              {timeLabel ? (
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-jaguar-ink/35" strokeWidth={2} aria-hidden />
                  {timeLabel}
                </span>
              ) : null}
              <span>
                <span className="text-jaguar-ink/35">Categoría </span>
                <span className="font-semibold text-jaguar-ink/70">{category}</span>
              </span>
              {meta.map((m, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <m.icon className="h-3.5 w-3.5 text-jaguar-ink/35" strokeWidth={2} aria-hidden />
                  {m.label}
                </span>
              ))}
            </div>
            {rsvpSummary ? (
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <Badge tone="green">{rsvpSummary.confirmed} confirmó asistencia</Badge>
                {rsvpSummary.declined > 0 ? <Badge tone="maroon">{rsvpSummary.declined} avisó que no va</Badge> : null}
                {rsvpSummary.pending > 0 ? <Badge tone="neutral">{rsvpSummary.pending} sin responder</Badge> : null}
              </div>
            ) : null}
          </div>
        </div>
        <Link
          href={viewHref}
          className="flex shrink-0 items-center gap-1.5 rounded-xl border border-jaguar-ink/10 px-3.5 py-2 text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-ink/65 transition-colors hover:bg-jaguar-ink/[0.03]"
        >
          <Eye className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          {viewLabel}
        </Link>
      </div>
    </Card>
  );
}
