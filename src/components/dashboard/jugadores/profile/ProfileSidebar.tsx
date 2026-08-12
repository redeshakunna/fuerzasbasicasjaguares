import Link from "next/link";
import { Cake, CalendarClock, HeartPulse, UserRound } from "lucide-react";
import { Card } from "../../ui/Card";
import { formatLastTraining, daysUntilNextBirthday, formatShortDate } from "@/lib/data/players-stats";
import type { Tables } from "@/lib/supabase/database.types";
import type { TrainingRow } from "@/lib/data/player-profile";

type PlayerRow = Tables<"players">;

const statusDotClass: Record<PlayerRow["status"], string> = {
  Disponible: "bg-jaguar-green-500",
  Suspendido: "bg-jaguar-gold-500",
  Lesionado: "bg-jaguar-maroon-500",
};

function WidgetCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Cake;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 text-jaguar-ink/45">
        <Icon className="h-4 w-4" strokeWidth={1.9} aria-hidden />
        <p className="text-[11.5px] lg:text-[12.5px] font-bold uppercase tracking-[0.03em]">{title}</p>
      </div>
      <div className="mt-3">{children}</div>
    </Card>
  );
}

function formatTrainingTime(time: string | null) {
  if (!time) return "";
  const [h, m] = time.split(":");
  const hour = Number(h);
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${m} ${period}`;
}

function formatSessionDate(sessionDate: string) {
  const [y, m, d] = sessionDate.split("-").map(Number);
  const date = new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
  const monthShort = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  return `${date.getDate()} de ${monthShort[date.getMonth()]}`;
}

export function ProfileSidebar({
  player,
  nextTraining,
  lastTrainingDate,
}: {
  player: PlayerRow;
  nextTraining: TrainingRow | null;
  lastTrainingDate: string | null;
}) {
  const { days, nextDate } = daysUntilNextBirthday(player.birth_date);
  const daysLabel = days === 0 ? "¡Hoy cumple años!" : days === 1 ? "Mañana" : `Faltan ${days} días`;

  const hasGuardian = Boolean(player.guardian_name || player.guardian_phone || player.guardian_email);

  return (
    <div className="space-y-4">
      <WidgetCard icon={HeartPulse} title="Estado Actual">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${statusDotClass[player.status]}`} />
          <span className="text-[14px] lg:text-[15.5px] font-bold text-jaguar-ink">{player.status}</span>
        </div>
        <p className="mt-1.5 text-[12px] lg:text-[13px] text-jaguar-ink/45">
          Último entrenamiento: {formatLastTraining(lastTrainingDate)}
        </p>
      </WidgetCard>

      <WidgetCard icon={CalendarClock} title="Próximo Entrenamiento">
        {nextTraining ? (
          <Link href={`/plataforma/entrenamientos/${nextTraining.id}`} className="block hover:opacity-75">
            <p className="text-[14px] lg:text-[15.5px] font-bold text-jaguar-ink">{nextTraining.title}</p>
            <p className="mt-1 text-[12px] lg:text-[13px] text-jaguar-ink/45">
              {formatSessionDate(nextTraining.session_date)} · {formatTrainingTime(nextTraining.start_time)}
            </p>
            {nextTraining.location ? (
              <p className="text-[12px] lg:text-[13px] text-jaguar-ink/45">{nextTraining.location}</p>
            ) : null}
          </Link>
        ) : (
          <p className="text-[13px] lg:text-[14px] text-jaguar-ink/40">Sin entrenamientos programados.</p>
        )}
      </WidgetCard>

      <WidgetCard icon={Cake} title="Cumpleaños">
        <p className="text-[14px] lg:text-[15.5px] font-bold text-jaguar-ink">{daysLabel}</p>
        <p className="mt-1 text-[12px] lg:text-[13px] text-jaguar-ink/45">{formatShortDate(nextDate)}</p>
      </WidgetCard>

      <WidgetCard icon={UserRound} title="Representante">
        {hasGuardian ? (
          <>
            <p className="text-[14px] lg:text-[15.5px] font-bold text-jaguar-ink">{player.guardian_name ?? "—"}</p>
            <p className="text-[12px] lg:text-[13px] text-jaguar-ink/45">{player.guardian_relationship ?? "Acudiente"}</p>
            {player.guardian_phone ? (
              <p className="mt-1.5 text-[12.5px] lg:text-[13.5px] text-jaguar-ink/70">{player.guardian_phone}</p>
            ) : null}
            {player.guardian_email ? (
              <p className="text-[12.5px] lg:text-[13.5px] text-jaguar-ink/70">{player.guardian_email}</p>
            ) : null}
          </>
        ) : (
          <p className="text-[13px] lg:text-[14px] text-jaguar-ink/40">Sin acudiente registrado.</p>
        )}
      </WidgetCard>
    </div>
  );
}
