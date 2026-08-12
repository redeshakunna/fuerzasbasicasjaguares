import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { ProfileHero } from "@/components/dashboard/jugadores/profile/ProfileHero";
import { ProfileTabs } from "@/components/dashboard/jugadores/profile/ProfileTabs";
import { InformacionPersonalCard } from "@/components/dashboard/jugadores/profile/InformacionPersonalCard";
import { ProfileSidebar } from "@/components/dashboard/jugadores/profile/ProfileSidebar";
import { EvolucionRendimientoChart } from "@/components/dashboard/jugadores/profile/EvolucionRendimientoChart";
import { UltimaEvaluacionCard } from "@/components/dashboard/jugadores/profile/UltimaEvaluacionCard";
import { PlayerEvaluationsTab } from "@/components/dashboard/jugadores/profile/PlayerEvaluationsTab";
import { PlayerDocumentsTab } from "@/components/dashboard/jugadores/profile/PlayerDocumentsTab";
import { PlayerMatchHistory } from "@/components/dashboard/jugadores/profile/PlayerMatchHistory";
import { PlayerAttendanceHistory } from "@/components/dashboard/jugadores/profile/PlayerAttendanceHistory";
import { PlayerFinanceMirror } from "@/components/dashboard/jugadores/profile/PlayerFinanceMirror";
import { PlayerReportsTab } from "@/components/dashboard/jugadores/profile/PlayerReportsTab";
import { ProfileActionsBar } from "@/components/dashboard/jugadores/profile/ProfileActionsBar";
import {
  getCurrentStaffProfile,
  getNextTrainingForCategory,
  getPlayerById,
  getPlayerEvaluations,
} from "@/lib/data/player-profile";
import { calculateAge, getFullName } from "@/lib/data/players-stats";
import { getEstadoGeneral } from "@/lib/data/player-profile-view";
import { getPlayerCallupHistory } from "@/lib/data/match-callups";
import { getPlayerAttendanceHistory } from "@/lib/data/attendance";
import { getMonthlyParticipation, getPlayerReports, type MonthlyParticipation } from "@/lib/data/reports";
import { getPlayerDocuments } from "@/lib/data/player-documents";
import { getPrimaryStaffNames } from "@/lib/data/staff";
import type { PrintPlayerInfo } from "@/components/dashboard/jugadores/profile/print-player-report";

export const dynamic = "force-dynamic";

function formatEvalLabel(dateStr: string) {
  const [y, m, d] = dateStr.split("-");
  const monthShort = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  return `${d} ${monthShort[Number(m) - 1]}`;
}

interface PlayerProfilePageProps {
  params: Promise<{ id: string }>;
}

/**
 * Hoja de vida deportiva del jugador — foto, datos personales/deportivos,
 * estado general y evaluaciones reales. "Editar información" solo aparece
 * (y solo funciona: la Server Action lo re-valida) para el súper admin.
 */
export default async function PlayerProfilePage({ params }: PlayerProfilePageProps) {
  const { id } = await params;

  const [player, evaluations, staff] = await Promise.all([
    getPlayerById(id),
    getPlayerEvaluations(id),
    getCurrentStaffProfile(),
  ]);

  if (!player) notFound();

  const [nextTraining, matchHistory, attendanceHistory, reports, evaluationHistory, documents, staffNames] =
    await Promise.all([
      getNextTrainingForCategory(player.category),
      getPlayerCallupHistory(player.id),
      getPlayerAttendanceHistory(player.id),
      getPlayerReports(player.id),
      getPlayerEvaluations(player.id, 100),
      getPlayerDocuments(player.id),
      getPrimaryStaffNames(),
    ]);
  const currentPeriod = new Date().toISOString().slice(0, 7);
  const lastTrainingDate =
    attendanceHistory.find((e) => e.kind === "entrenamiento" && (e.status === "Presente" || e.status === "Tarde"))
      ?.date ?? null;

  const participationEntries = await Promise.all(
    reports.map(async (r) => [r.period, await getMonthlyParticipation(player.id, r.period)] as const),
  );
  const participationByPeriod: Record<string, MonthlyParticipation> = Object.fromEntries(participationEntries);

  const age = calculateAge(player.birth_date);
  const latestEvaluation = evaluations[0] ?? null;
  const estadoGeneral = getEstadoGeneral(player, latestEvaluation);
  const isAdmin = staff?.isAdmin ?? false;
  const canEditPerformanceGroup = isAdmin || staff?.role === "entrenador";

  const chartData = [...evaluations]
    .filter((e) => e.overall_score !== null)
    .reverse()
    .map((e) => ({ label: formatEvalLabel(e.evaluation_date), value: e.overall_score ?? 0 }));

  const printInfo: PrintPlayerInfo = {
    fullName: getFullName(player),
    photoUrl: player.photo_url,
    position: player.position,
    category: player.category,
    age,
    dominantFoot: player.dominant_foot,
    joinedAt: player.joined_at,
    guardianName: player.guardian_name,
    guardianPhone: player.guardian_phone,
    coachName: staffNames.coachName,
    coordinatorName: staffNames.coordinatorName,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-[13px] lg:text-[14px] text-jaguar-ink/50">
        <Link
          href="/plataforma/jugadores"
          className="flex items-center gap-1 font-semibold text-jaguar-ink/60 hover:text-jaguar-green-600"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2.25} aria-hidden />
          Jugadores
        </Link>
        <span className="text-jaguar-ink/25">/</span>
        <span className="font-semibold text-jaguar-ink">{getFullName(player)}</span>
      </div>

      <ProfileHero
        player={player}
        age={age}
        evaluationsUpToDate={evaluations.length > 0}
        estadoGeneral={estadoGeneral}
        canEditPerformanceGroup={canEditPerformanceGroup}
        canEditPromotion={isAdmin}
      />

      <ProfileTabs
        generalContent={
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
              <InformacionPersonalCard player={player} isAdmin={isAdmin} age={age} />
              <ProfileSidebar player={player} nextTraining={nextTraining} lastTrainingDate={lastTrainingDate} />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
              <EvolucionRendimientoChart data={chartData} />
              <UltimaEvaluacionCard evaluation={latestEvaluation} />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <PlayerMatchHistory history={matchHistory} />
              <PlayerAttendanceHistory history={attendanceHistory} />
            </div>
          </div>
        }
        evaluacionesContent={<PlayerEvaluationsTab evaluations={evaluationHistory} />}
        documentosContent={<PlayerDocumentsTab playerId={player.id} documents={documents} isAdmin={isAdmin} />}
        financieroContent={<PlayerFinanceMirror playerId={player.id} />}
        informesContent={
          <PlayerReportsTab
            playerId={player.id}
            playerFirstName={player.first_name}
            playerFullName={getFullName(player)}
            currentPeriod={currentPeriod}
            reports={reports}
            guardianEmail={player.guardian_email}
            guardianPhone={player.guardian_phone}
            currentCategory={player.category}
            currentPerformanceGroup={player.performance_group}
            printInfo={printInfo}
            participationByPeriod={participationByPeriod}
          />
        }
      />

      <ProfileActionsBar />
    </div>
  );
}
