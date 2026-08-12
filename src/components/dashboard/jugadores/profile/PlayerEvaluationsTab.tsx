import { ClipboardList, Compass, Dumbbell, HandMetal, ShieldCheck, Star, Trophy, Zap } from "lucide-react";
import { Card } from "../../ui/Card";
import { Badge } from "../../ui/Badge";
import type { Tables } from "@/lib/supabase/database.types";

type EvaluationRow = Tables<"evaluations">;

const indicators = [
  { key: "technical_score", label: "Técnica", icon: Zap },
  { key: "tactical_score", label: "Táctica", icon: Compass },
  { key: "physical_score", label: "Física", icon: Dumbbell },
  { key: "discipline_score", label: "Disciplina", icon: ShieldCheck },
  { key: "attitude_score", label: "Actitud", icon: HandMetal },
] as const;

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-");
  const monthNames = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ];
  return `${Number(d)} de ${monthNames[Number(m) - 1]} de ${y}`;
}

function scoreTone(score: number | null) {
  if (score === null) return { text: "text-jaguar-ink/30", bg: "bg-jaguar-mist", ring: "ring-jaguar-ink/10" };
  if (score >= 8.5) return { text: "text-jaguar-green-600", bg: "bg-jaguar-green-50", ring: "ring-jaguar-green-500/25" };
  if (score >= 6.5) return { text: "text-jaguar-turquoise-600", bg: "bg-jaguar-turquoise-500/10", ring: "ring-jaguar-turquoise-500/25" };
  if (score >= 4.5) return { text: "text-jaguar-gold-600", bg: "bg-jaguar-gold-500/10", ring: "ring-jaguar-gold-500/25" };
  return { text: "text-jaguar-maroon-600", bg: "bg-jaguar-maroon-500/10", ring: "ring-jaguar-maroon-500/25" };
}

function EvaluationCard({ evaluation }: { evaluation: EvaluationRow }) {
  const tone = scoreTone(evaluation.overall_score);
  const isMatch = evaluation.match_id !== null;

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl ring-2 ${tone.bg} ${tone.ring}`}>
            <span className={`text-[16px] lg:text-[17.5px] font-extrabold leading-none ${tone.text}`}>
              {evaluation.overall_score !== null ? Number(evaluation.overall_score).toFixed(1) : "—"}
            </span>
            <span className="mt-0.5 text-[8px] lg:text-[9px] font-bold uppercase tracking-wide text-jaguar-ink/35">/ 10</span>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <p className="text-[13.5px] lg:text-[15px] font-bold capitalize text-jaguar-ink">{formatDate(evaluation.evaluation_date)}</p>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] lg:text-[11px] font-bold uppercase tracking-[0.02em] ${
                  isMatch ? "bg-jaguar-gold-500/15 text-jaguar-gold-700" : "bg-jaguar-green-500/10 text-jaguar-green-700"
                }`}
              >
                {isMatch ? <Trophy className="h-2.5 w-2.5" strokeWidth={2.2} aria-hidden /> : <ClipboardList className="h-2.5 w-2.5" strokeWidth={2.2} aria-hidden />}
                {isMatch ? "Partido" : "Entrenamiento"}
              </span>
            </div>
            {evaluation.is_standout ? (
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-jaguar-gold-500/15 px-2 py-0.5 text-[10.5px] lg:text-[11.5px] font-bold text-jaguar-gold-700">
                <Star className="h-2.5 w-2.5" strokeWidth={0} fill="currentColor" aria-hidden />
                Destacado de la práctica
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-5">
        {indicators.map((ind) => {
          const Icon = ind.icon;
          const raw = evaluation[ind.key];
          const value = raw !== null ? Number(raw) : null;
          return (
            <div key={ind.key} className="rounded-xl bg-jaguar-mist/50 px-2.5 py-2 text-center">
              <Icon className="mx-auto h-3.5 w-3.5 text-jaguar-ink/35" strokeWidth={1.9} aria-hidden />
              <p className="mt-1 text-[10px] lg:text-[11px] font-semibold uppercase tracking-[0.02em] text-jaguar-ink/40">{ind.label}</p>
              <p className="text-[13px] lg:text-[14px] font-bold text-jaguar-ink">{value !== null ? value.toFixed(1) : "—"}</p>
            </div>
          );
        })}
      </div>

      {evaluation.notes ? (
        <div className="mt-4 rounded-xl bg-jaguar-green-50/60 p-3.5">
          <p className="text-[11px] lg:text-[12px] font-semibold uppercase tracking-[0.03em] text-jaguar-green-700/70">Informe del entrenador</p>
          <p className="mt-1.5 text-[13px] lg:text-[14px] leading-relaxed text-jaguar-ink/80">{evaluation.notes}</p>
        </div>
      ) : null}
    </Card>
  );
}

/** Pestaña Evaluaciones del perfil — historial completo, más reciente primero. */
export function PlayerEvaluationsTab({ evaluations }: { evaluations: EvaluationRow[] }) {
  if (evaluations.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-2 px-6 py-16 text-center">
        <ClipboardList className="h-6 w-6 text-jaguar-ink/20" strokeWidth={1.6} aria-hidden />
        <p className="text-[13.5px] lg:text-[15px] font-bold text-jaguar-ink">Aún no hay evaluaciones registradas.</p>
        <p className="max-w-md text-[13px] lg:text-[14px] text-jaguar-ink/45">
          Cuando el entrenador evalúe a este jugador en una sesión, el historial aparecerá aquí.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Badge tone="neutral">{evaluations.length} evaluación{evaluations.length === 1 ? "" : "es"}</Badge>
      </div>
      <div className="space-y-3">
        {evaluations.map((evaluation) => (
          <EvaluationCard key={evaluation.id} evaluation={evaluation} />
        ))}
      </div>
    </div>
  );
}
