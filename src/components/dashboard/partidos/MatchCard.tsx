import Link from "next/link";
import { CalendarDays, Clock, MapPin, Trophy } from "lucide-react";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import type { MatchRow } from "@/lib/data/matches";

const monthShort = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function formatMatchDate(value: string) {
  const parts = value.split("-");
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  return `${d} de ${monthShort[m - 1]} · ${y}`;
}

function formatTime(value: string | null) {
  if (!value) return "Hora por definir";
  return value.slice(0, 5);
}

/** Tarjeta de un partido en el listado de Partidos. */
export function MatchCard({ match }: { match: MatchRow }) {
  return (
    <Link href={`/plataforma/partidos/${match.id}`}>
      <Card className="p-5 transition-shadow hover:shadow-[0_4px_16px_-8px_rgba(13,18,16,0.18)]">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[14.5px] lg:text-[16px] font-bold text-jaguar-ink">
            {match.is_home ? "Jaguares vs. " : "vs. "}
            {match.opponent}
            {!match.is_home ? " (Jaguares)" : ""}
          </h3>
          <Badge tone={match.status === "Confirmado" ? "green" : "gold"}>{match.status}</Badge>
        </div>

        <div className="mt-3 space-y-1.5 text-[12.5px] lg:text-[13.5px] text-jaguar-ink/55">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-3.5 w-3.5 text-jaguar-ink/35" strokeWidth={2} aria-hidden />
            {formatMatchDate(match.match_date)}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-jaguar-ink/35" strokeWidth={2} aria-hidden />
            {formatTime(match.match_time)}
          </div>
          {match.location ? (
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-jaguar-ink/35" strokeWidth={2} aria-hidden />
              {match.location}
            </div>
          ) : null}
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-jaguar-ink/6 pt-3">
          <Badge tone="turquoise">{match.category}</Badge>
          {match.result ? (
            <span className="flex items-center gap-1.5 text-[13px] lg:text-[14px] font-extrabold text-jaguar-ink">
              <Trophy className="h-3.5 w-3.5 text-jaguar-gold-500" strokeWidth={2} aria-hidden />
              {match.result}
            </span>
          ) : (
            <span className="text-[12px] lg:text-[13px] text-jaguar-ink/35">{match.is_home ? "Local" : "Visitante"}</span>
          )}
        </div>
      </Card>
    </Link>
  );
}
