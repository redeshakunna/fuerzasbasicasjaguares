import Link from "next/link";
import { Trophy } from "lucide-react";
import type { DashboardMatch } from "./data/matches.data";
import { Badge } from "./ui/Badge";
import { Card, CardHeader } from "./ui/Card";

/** Próximos partidos — formato compacto de lista, desde la tabla `matches`. */
export function UpcomingMatches({ matches }: { matches: DashboardMatch[] }) {
  return (
    <Card className="flex h-full flex-col pb-5">
      <CardHeader title="Próximos partidos" subtitle="Categoría Sub-15" />
      {matches.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-6 text-center">
          <Trophy className="h-6 w-6 text-jaguar-ink/20" strokeWidth={1.6} aria-hidden />
          <p className="mt-2 text-[12.5px] lg:text-[13.5px] text-jaguar-ink/45">Aún no hay partidos programados.</p>
        </div>
      ) : (
        <div className="mt-3 flex flex-1 flex-col gap-1 px-4">
          {matches.map((match) => (
            <Link
              key={match.id}
              href={`/plataforma/partidos/${match.id}`}
              className="flex items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-jaguar-ink/[0.03]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-jaguar-turquoise-500/10 text-jaguar-turquoise-600">
                <Trophy className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] lg:text-[15px] font-bold text-jaguar-ink">{match.rival}</p>
                <p className="mt-0.5 truncate text-[12px] lg:text-[13px] text-jaguar-ink/50">{match.location}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[12px] lg:text-[13px] font-semibold text-jaguar-ink">{match.date}</p>
                <p className="mt-0.5 text-[11px] lg:text-[12px] text-jaguar-ink/45">{match.time}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
      <div className="mt-2 flex items-center justify-between px-6 text-[12px] lg:text-[13px]">
        <span className="text-jaguar-ink/45">{matches.length} partidos programados</span>
        <Badge tone="green">Sub-15</Badge>
      </div>
    </Card>
  );
}
