import Link from "next/link";
import { CalendarPlus, ClipboardCheck, Dumbbell, Trophy } from "lucide-react";
import { Card } from "../ui/Card";
import type { ActivityRef } from "@/lib/data/activities";

const monthShort = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function formatDate(value: string) {
  const parts = value.split("-");
  return `${Number(parts[2])} ${monthShort[(Number(parts[1]) || 1) - 1]}`;
}

function formatTime(value: string | null) {
  if (!value) return null;
  const [h, m] = value.split(":");
  const hour = Number(h);
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${m} ${period}`;
}

function activityHref(basePath: string, category: string, activity: ActivityRef) {
  const param = activity.kind === "entrenamiento" ? "sesion" : "partido";
  return `${basePath}?categoria=${category}&${param}=${activity.id}`;
}

function ActivityCard({ activity, category, basePath }: { activity: ActivityRef; category: string; basePath: string }) {
  const Icon = activity.kind === "entrenamiento" ? Dumbbell : Trophy;
  const time = formatTime(activity.time);
  return (
    <Link
      href={activityHref(basePath, category, activity)}
      className="flex items-center gap-3 rounded-2xl border border-jaguar-ink/8 bg-white px-4 py-3.5 transition-all hover:border-jaguar-green-500/30 hover:shadow-[0_4px_16px_-8px_rgba(13,18,16,0.18)]"
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          activity.kind === "entrenamiento" ? "bg-jaguar-green-50 text-jaguar-green-600" : "bg-jaguar-gold-500/12 text-jaguar-gold-700"
        }`}
      >
        <Icon className="h-4.5 w-4.5" strokeWidth={1.9} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] lg:text-[15px] font-bold text-jaguar-ink">{activity.title}</p>
        <p className="mt-0.5 text-[12px] lg:text-[13px] text-jaguar-ink/50">
          {formatDate(activity.date)}
          {time ? ` · ${time}` : ""}
          {activity.subtitle ? ` · ${activity.subtitle}` : ""}
        </p>
      </div>
      <span
        className={`shrink-0 rounded-full px-2.5 py-1 text-[10.5px] lg:text-[11.5px] font-bold uppercase tracking-[0.02em] ${
          activity.kind === "entrenamiento" ? "bg-jaguar-green-500/10 text-jaguar-green-700" : "bg-jaguar-gold-500/15 text-jaguar-gold-700"
        }`}
      >
        {activity.kind === "entrenamiento" ? "Entrenamiento" : "Partido"}
      </span>
    </Link>
  );
}

function Section({
  title,
  activities,
  category,
  basePath,
}: {
  title: string;
  activities: ActivityRef[];
  category: string;
  basePath: string;
}) {
  if (activities.length === 0) return null;
  return (
    <div>
      <p className="mb-2.5 text-[11.5px] lg:text-[12.5px] font-bold uppercase tracking-[0.05em] text-jaguar-ink/40">{title}</p>
      <div className="space-y-2">
        {activities.map((a) => (
          <ActivityCard key={`${a.kind}-${a.id}`} activity={a} category={category} basePath={basePath} />
        ))}
      </div>
    </div>
  );
}

/**
 * Punto de entrada compartido por Asistencia y Evaluaciones — primero la actividad, después
 * la lista de jugadores. Nunca asume en silencio para qué sesión es: el profesor elige
 * explícitamente un entrenamiento o un partido antes de poder marcar presencia o evaluar.
 * `basePath` decide a qué módulo navega cada tarjeta (antes estaba fijo a Asistencia, lo
 * que mandaba mal a quien lo usaba desde Evaluaciones).
 */
export function ActivityPicker({
  category,
  today,
  upcoming,
  recent,
  basePath = "/plataforma/asistencia",
  title = "¿Para qué actividad vas a tomar asistencia?",
  subtitle = "Elige un entrenamiento o un partido — la asistencia siempre es de algo puntual.",
}: {
  category: string;
  today: ActivityRef[];
  upcoming: ActivityRef[];
  recent: ActivityRef[];
  basePath?: string;
  title?: string;
  subtitle?: string;
}) {
  const hasAny = today.length + upcoming.length + recent.length > 0;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-jaguar-green-50 text-jaguar-green-600">
          <ClipboardCheck className="h-4.5 w-4.5" strokeWidth={1.9} aria-hidden />
        </span>
        <div>
          <p className="text-[14.5px] lg:text-[16px] font-bold text-jaguar-ink">{title}</p>
          <p className="text-[12.5px] lg:text-[13.5px] text-jaguar-ink/50">{subtitle}</p>
        </div>
      </div>

      {!hasAny ? (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl bg-jaguar-mist/40 px-6 py-12 text-center">
          <p className="text-[13.5px] lg:text-[15px] font-semibold text-jaguar-ink/55">Todavía no hay entrenamientos ni partidos programados.</p>
          <Link
            href="/plataforma/entrenamientos"
            className="flex items-center gap-1.5 rounded-xl bg-jaguar-green-600 px-4 py-2.5 text-[12.5px] lg:text-[13.5px] font-semibold text-white hover:bg-jaguar-green-700"
          >
            <CalendarPlus className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            Crear un entrenamiento
          </Link>
        </div>
      ) : (
        <div className="mt-5 space-y-5">
          <Section title="Hoy" activities={today} category={category} basePath={basePath} />
          <Section title="Próximas" activities={upcoming} category={category} basePath={basePath} />
          <Section title="Recientes" activities={recent} category={category} basePath={basePath} />
        </div>
      )}
    </Card>
  );
}
