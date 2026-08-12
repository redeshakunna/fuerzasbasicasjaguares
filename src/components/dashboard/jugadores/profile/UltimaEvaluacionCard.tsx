import { Card, CardHeader } from "../../ui/Card";
import type { EvaluationRow } from "@/lib/data/player-profile";

function formatDate(value: string) {
  const [y, m, d] = value.split("-");
  return `${d}/${m}/${y}`;
}

function ScoreBlock({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="rounded-xl bg-jaguar-mist/60 px-3 py-2.5 text-center">
      <p className="text-[10.5px] lg:text-[11.5px] font-medium uppercase tracking-[0.03em] text-jaguar-ink/40">{label}</p>
      <p className="mt-1 text-[15px] lg:text-[16.5px] font-extrabold text-jaguar-ink">{value !== null ? value.toFixed(1) : "—"}</p>
    </div>
  );
}

export function UltimaEvaluacionCard({ evaluation }: { evaluation: EvaluationRow | null }) {
  return (
    <Card>
      <CardHeader title="Última Evaluación" />
      <div className="px-6 pb-6 pt-3">
        {evaluation ? (
          <>
            <p className="text-[12px] lg:text-[13px] text-jaguar-ink/45">{formatDate(evaluation.evaluation_date)}</p>
            <div className="mt-3 grid grid-cols-3 gap-2.5">
              <ScoreBlock label="Técnica" value={evaluation.technical_score} />
              <ScoreBlock label="Táctica" value={evaluation.tactical_score} />
              <ScoreBlock label="Física" value={evaluation.physical_score} />
              <ScoreBlock label="Disciplina" value={evaluation.discipline_score} />
              <ScoreBlock label="Actitud" value={evaluation.attitude_score} />
              <ScoreBlock label="General" value={evaluation.overall_score} />
            </div>
            {evaluation.notes ? (
              <p className="mt-3 text-[12.5px] lg:text-[13.5px] leading-relaxed text-jaguar-ink/60">{evaluation.notes}</p>
            ) : null}
          </>
        ) : (
          <p className="text-[13px] lg:text-[14px] text-jaguar-ink/40">Aún no se han registrado evaluaciones para este jugador.</p>
        )}
      </div>
    </Card>
  );
}
