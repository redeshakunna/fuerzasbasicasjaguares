"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CalendarClock, CheckCircle2, Sparkles, Users } from "lucide-react";
import { Card, CardHeader } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Avatar } from "../ui/Avatar";
import { GroupReportCard } from "./GroupReportCard";
import { generateBulkPlayerReports } from "@/app/plataforma/(dashboard)/informes/actions";
import { periodLabel } from "@/lib/informes/report-generator";
import type { GroupReportRow } from "@/lib/data/group-reports";

export interface InformesRosterPlayer {
  id: string;
  name: string;
  photoUrl: string | null;
  initials: string;
  guardianEmail: string | null;
  reportStatus: string | null;
}

const statusTone: Record<string, "gold" | "turquoise" | "green" | "neutral"> = {
  Borrador: "gold",
  Revisado: "turquoise",
  Enviado: "green",
};

function statusLabel(status: string | null): string {
  if (!status) return "Sin generar";
  return status;
}

export function InformesHub({
  category,
  currentPeriod,
  roster,
  cadence,
  groupReports,
  categoryPhoto,
  isAdmin,
  coachName,
  coordinatorName,
}: {
  category: string;
  currentPeriod: string;
  roster: InformesRosterPlayer[];
  cadence: "mensual" | "quincenal";
  groupReports: GroupReportRow[];
  categoryPhoto: string | null;
  isAdmin: boolean;
  coachName: string | null;
  coordinatorName: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const pending = roster.filter((p) => !p.reportStatus);
  const done = roster.length - pending.length;
  const [latest, ...older] = groupReports;
  const currentGroupReport = latest && latest.period === currentPeriod ? latest : null;
  const historyGroupReports = currentGroupReport ? older : groupReports;

  const guardianEmails = roster.map((p) => p.guardianEmail).filter((e): e is string => !!e);

  const allCaughtUp = pending.length === 0 && !!currentGroupReport;

  function generatePending() {
    setMessage(null);
    startTransition(async () => {
      const result = await generateBulkPlayerReports(category, currentPeriod);
      if (result.error) {
        setMessage(result.error);
        return;
      }
      setMessage(
        result.generatedCount && result.generatedCount > 0
          ? `Se generaron ${result.generatedCount} informe${result.generatedCount === 1 ? "" : "s"} nuevo${result.generatedCount === 1 ? "" : "s"}.`
          : "No había informes pendientes por generar.",
      );
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <Card
        className={`flex flex-wrap items-center gap-3 p-5 ${
          allCaughtUp ? "bg-jaguar-green-50/60" : "bg-jaguar-gold-500/8"
        }`}
      >
        {allCaughtUp ? (
          <CheckCircle2 className="h-5 w-5 shrink-0 text-jaguar-green-600" strokeWidth={2} aria-hidden />
        ) : (
          <CalendarClock className="h-5 w-5 shrink-0 text-jaguar-gold-700" strokeWidth={2} aria-hidden />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] lg:text-[15px] font-bold text-jaguar-ink">
            {allCaughtUp
              ? `${category} está al día con ${periodLabel(currentPeriod)}`
              : `Recordatorio ${cadence === "mensual" ? "mensual" : "quincenal"} — toca revisar los informes de ${periodLabel(currentPeriod)}`}
          </p>
          <p className="mt-0.5 text-[12.5px] lg:text-[13.5px] text-jaguar-ink/55">
            {done}/{roster.length} informes individuales generados
            {currentGroupReport ? " · informe grupal generado" : " · falta el informe grupal"}. El envío a las familias
            siempre lo confirmas tú, esto es solo un recordatorio.
          </p>
        </div>
        <Badge tone={cadence === "mensual" ? "turquoise" : "gold"}>{cadence === "mensual" ? "Mensual" : "Quincenal"}</Badge>
      </Card>

      <Card className="p-5">
        <CardHeader
          title="Informes individuales"
          subtitle={`Plantel de ${category} — ${periodLabel(currentPeriod)}`}
          action={
            pending.length > 0 ? (
              <button
                type="button"
                onClick={generatePending}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-[12.5px] lg:text-[13.5px] font-semibold text-white transition-colors hover:bg-violet-700 disabled:opacity-60"
              >
                <Sparkles className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                {isPending ? "Generando…" : `Generar ${pending.length} pendiente${pending.length === 1 ? "" : "s"}`}
              </button>
            ) : null
          }
        />
        {message ? <p className="px-6 pt-3 text-[12px] lg:text-[13px] font-medium text-jaguar-green-700">{message}</p> : null}

        {roster.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
            <Users className="h-6 w-6 text-jaguar-ink/20" strokeWidth={1.6} aria-hidden />
            <p className="text-[12.5px] lg:text-[13.5px] text-jaguar-ink/45">Aún no hay jugadores registrados en esta categoría.</p>
          </div>
        ) : (
          <div className="mt-4 divide-y divide-jaguar-ink/6 px-2 pb-2">
            {roster.map((p) => (
              <Link
                key={p.id}
                href={`/plataforma/jugadores/${p.id}`}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-jaguar-ink/[0.02]"
              >
                <Avatar initials={p.initials} size={32} photoUrl={p.photoUrl} />
                <span className="flex-1 text-[13px] lg:text-[14px] font-semibold text-jaguar-ink">{p.name}</span>
                <Badge tone={p.reportStatus ? statusTone[p.reportStatus] ?? "neutral" : "neutral"}>
                  {statusLabel(p.reportStatus)}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </Card>

      <GroupReportCard
        category={category}
        currentPeriod={currentPeriod}
        report={currentGroupReport}
        categoryPhoto={categoryPhoto}
        isAdmin={isAdmin}
        guardianEmails={guardianEmails}
        coachName={coachName}
        coordinatorName={coordinatorName}
      />

      {historyGroupReports.length > 0 ? (
        <Card className="p-5">
          <p className="text-[12.5px] lg:text-[13.5px] font-bold uppercase tracking-[0.04em] text-jaguar-ink/40">
            Historial de informes grupales
          </p>
          <div className="mt-3 divide-y divide-jaguar-ink/6">
            {historyGroupReports.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-[13px] lg:text-[14px] font-semibold capitalize text-jaguar-ink">{periodLabel(r.period)}</p>
                  <p className="text-[11.5px] lg:text-[12.5px] text-jaguar-ink/45">
                    {r.average_score !== null ? `Promedio ${Number(r.average_score).toFixed(1)}/10` : "Sin datos"} · {r.player_count} jugadores
                  </p>
                </div>
                <Badge tone={statusTone[r.status] ?? "neutral"}>{r.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
