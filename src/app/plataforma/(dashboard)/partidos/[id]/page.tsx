import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Badge } from "@/components/dashboard/ui/Badge";
import { MatchDetailForm } from "@/components/dashboard/partidos/MatchDetailForm";
import { CallupList } from "@/components/dashboard/partidos/CallupList";
import { getMatchById } from "@/lib/data/matches";
import { getPlayers } from "@/lib/data/players";
import { getCallupsForMatch } from "@/lib/data/match-callups";
import { getRsvpStatusForMatch } from "@/lib/data/match-rsvp";
import { matchOutcome, outcomeBadgeTone } from "@/lib/data/match-stats";

export const dynamic = "force-dynamic";

interface MatchDetailPageProps {
  params: Promise<{ id: string }>;
}

/** Detalle completo de un partido — edición de datos/resultado + convocatoria de la categoría. */
export default async function MatchDetailPage({ params }: MatchDetailPageProps) {
  const { id } = await params;
  const match = await getMatchById(id);
  if (!match) notFound();

  const [players, callups, rsvpByPlayerMap] = await Promise.all([
    getPlayers(match.category),
    getCallupsForMatch(match.id),
    getRsvpStatusForMatch(match.id),
  ]);
  const roster = [...players].sort((a, b) => (a.jersey_number ?? 99) - (b.jersey_number ?? 99));
  const outcome = matchOutcome(match);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-[13px] lg:text-[14px] text-jaguar-ink/50">
        <Link
          href="/plataforma/partidos"
          className="flex items-center gap-1 font-semibold text-jaguar-ink/60 hover:text-jaguar-green-600"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2.25} aria-hidden />
          Partidos
        </Link>
        <span className="text-jaguar-ink/25">/</span>
        <span className="font-semibold text-jaguar-ink">
          {match.is_home ? "Jaguares vs. " : "vs. "}{match.opponent}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <h1 className="text-[22px] lg:text-[24px] font-extrabold text-jaguar-ink">
          {match.is_home ? "Jaguares vs. " : "vs. "}{match.opponent}
        </h1>
        <Badge tone={match.status === "Confirmado" ? "green" : "gold"}>{match.status}</Badge>
        <Badge tone="turquoise">{match.category}</Badge>
        {outcome !== "Programado" ? <Badge tone={outcomeBadgeTone[outcome]}>{outcome}</Badge> : null}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_480px]">
        <MatchDetailForm match={match} />
        <CallupList
          matchId={match.id}
          category={match.category}
          players={roster}
          initialCallups={callups}
          rsvpByPlayer={Object.fromEntries(rsvpByPlayerMap)}
        />
      </div>
    </div>
  );
}
