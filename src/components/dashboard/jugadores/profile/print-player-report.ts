import { areaLabel, periodLabel, type ReportArea } from "@/lib/informes/report-generator";
import type { PlayerReportRow } from "@/lib/data/reports";
import type { MonthlyParticipation } from "@/lib/data/reports";
import {
  buildRadarSvg,
  escapeHtml,
  formatDateLong,
  headerBlock,
  openPrintWindow,
  signaturesBlock,
  textLines,
} from "@/lib/print/report-print-kit";

export interface PrintPlayerInfo {
  fullName: string;
  photoUrl: string | null;
  position: string | null;
  category: string;
  age: number | null;
  dominantFoot: string | null;
  joinedAt: string | null;
  guardianName: string | null;
  guardianPhone: string | null;
  coachName: string | null;
  coordinatorName: string | null;
}

const reportAreas: ReportArea[] = ["technical", "tactical", "physical", "attitude"];

function areaScoreOf(report: PlayerReportRow, area: ReportArea): number | null {
  const map: Record<ReportArea, number | null> = {
    technical: report.technical_score,
    tactical: report.tactical_score,
    physical: report.physical_score,
    attitude: report.attitude_score,
  };
  return map[area];
}

function areaNotesOf(report: PlayerReportRow, area: ReportArea): string | null {
  const map: Record<ReportArea, string | null> = {
    technical: report.technical_notes,
    tactical: report.tactical_notes,
    physical: report.physical_notes,
    attitude: report.attitude_notes,
  };
  return map[area];
}

/** "2 años, 3 meses" a partir de la fecha de ingreso — nunca fechas exactas, solo antigüedad. */
function formatTenure(joinedAt: string | null): string {
  if (!joinedAt) return "—";
  const joined = new Date(joinedAt);
  if (Number.isNaN(joined.getTime())) return "—";
  const now = new Date();
  let months = (now.getFullYear() - joined.getFullYear()) * 12 + (now.getMonth() - joined.getMonth());
  if (now.getDate() < joined.getDate()) months -= 1;
  if (months < 0) months = 0;
  if (months < 12) return months === 1 ? "1 mes" : `${months} meses`;
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  const yearsLabel = years === 1 ? "1 año" : `${years} años`;
  return remMonths > 0 ? `${yearsLabel}, ${remMonths} ${remMonths === 1 ? "mes" : "meses"}` : yearsLabel;
}

/**
 * PDF imprimible del informe individual — infografía de una página: datos
 * del jugador, resumen del período, radar de áreas, fortalezas y aspectos
 * por fortalecer (derivados del umbral de 7/10 sobre las notas reales de
 * cada área, nunca inventadas), observación del entrenador, plan de mejora
 * y firmas. Mismo patrón que ya usaba printReport(): ventana nueva +
 * window.print(), sin librería de PDF.
 */
export function printPlayerReport(
  report: PlayerReportRow,
  player: PrintPlayerInfo,
  participation: MonthlyParticipation,
): void {
  const scoreLabel = report.average_score !== null ? `${Number(report.average_score).toFixed(1)}/10` : "—";

  const photoBlock = player.photoUrl
    ? `<img src="${player.photoUrl}" alt="" style="width:100%;height:100%;object-fit:cover;" />`
    : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#f6f7f5;color:#0d121033;font-size:11px;font-weight:700;">SIN FOTO</div>`;

  const infoRows: [string, string][] = [
    ["Nombre completo", player.fullName],
    ["Posición", player.position ?? "—"],
    ["Categoría", player.category],
    ["Edad", player.age !== null ? `${player.age} años` : "—"],
    ["Pierna dominante", player.dominantFoot ?? "—"],
    ["Tiempo en la academia", formatTenure(player.joinedAt)],
    ["Entrenador", player.coachName ?? "—"],
    ["Acudiente", player.guardianName ?? "—"],
    ["Teléfono", player.guardianPhone ?? "—"],
  ];

  const infoTable = infoRows
    .map(([label, value]) => `<tr><td class="label">${escapeHtml(label)}</td><td class="value">${escapeHtml(value)}</td></tr>`)
    .join("");

  const statsRow = `<div class="stats-row">
    <div class="stat-box">
      <div class="n">${participation.trainingsTotal}</div>
      <div class="l">Entrenamientos</div>
      <div class="sub">Asistió a ${participation.trainingsAttended}</div>
    </div>
    <div class="stat-box">
      <div class="n">${participation.matchesPlayed}</div>
      <div class="l">Partidos</div>
      <div class="sub">Titular en ${participation.matchesStarted}</div>
    </div>
    <div class="stat-box">
      <div class="n">${participation.minutesPlayed}</div>
      <div class="l">Minutos jugados</div>
      <div class="sub">&nbsp;</div>
    </div>
    <div class="stat-box">
      <div class="n">${scoreLabel}</div>
      <div class="l">Evaluación general</div>
      <div class="sub">&nbsp;</div>
    </div>
  </div>`;

  const areaRows = reportAreas
    .map((area) => {
      const score = areaScoreOf(report, area);
      const notes = areaNotesOf(report, area);
      return `<tr>
        <td style="font-weight:700;width:110px;">${areaLabel[area]}</td>
        <td style="font-weight:800;color:${score !== null && score >= 7 ? "#145c2c" : "#0d1210"};width:60px;">${score !== null ? score.toFixed(1) + "/10" : "—"}</td>
        <td>${notes ? escapeHtml(notes) : "—"}</td>
      </tr>`;
    })
    .join("");

  const radarSvg = buildRadarSvg(
    reportAreas.map((area) => ({ label: areaLabel[area], score: areaScoreOf(report, area) })),
  );

  const strengths = reportAreas.filter((a) => {
    const s = areaScoreOf(report, a);
    return s !== null && s >= 7 && areaNotesOf(report, a);
  });
  const improvements = reportAreas.filter((a) => {
    const s = areaScoreOf(report, a);
    return s !== null && s < 7 && areaNotesOf(report, a);
  });

  function bulletList(areas: ReportArea[], dotColor: string): string {
    if (areas.length === 0) {
      return `<p style="font-size:11.5px;color:#0d121066;">Sin observaciones registradas por área todavía.</p>`;
    }
    return areas
      .map(
        (a) => `<div class="bullet-item">
          <span class="bullet-dot" style="background:${dotColor};"></span>
          <div><p class="t">${areaLabel[a]}</p><p class="d">${escapeHtml(areaNotesOf(report, a) ?? "")}</p></div>
        </div>`,
      )
      .join("");
  }

  const tasksList = textLines(report.tasks);
  const planSection =
    tasksList.length > 0
      ? `<ul class="plan-list" style="margin:0;padding-left:18px;">${tasksList.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul>`
      : `<p style="font-size:11.5px;color:#0d121066;">Sin tareas asignadas para el próximo período.</p>`;

  const body = `
    ${headerBlock({
      docTitle: "Informe de Seguimiento Deportivo",
      periodLabel: periodLabel(report.period),
      categoryLabel: player.category,
      dateLabel: formatDateLong(new Date()),
    })}

    <section>
      <p class="section-title">1. Información del jugador</p>
      <div style="display:grid;grid-template-columns:1fr 200px;gap:18px;align-items:start;">
        <table class="info">${infoTable}</table>
        <div style="width:100%;aspect-ratio:4/5;border-radius:14px;overflow:hidden;background:#f6f7f5;">${photoBlock}</div>
      </div>
    </section>

    <section>
      <p class="section-title">2. Resumen del período</p>
      ${statsRow}
    </section>

    <section>
      <p class="section-title">3. Evaluación del rendimiento</p>
      <div style="display:grid;grid-template-columns:1fr 340px;gap:10px;align-items:center;">
        <table class="areas">
          <thead><tr><th>Área</th><th>Calificación</th><th>Observación</th></tr></thead>
          <tbody>${areaRows}</tbody>
        </table>
        ${radarSvg}
      </div>
    </section>

    <section class="grid2">
      <div>
        <p class="section-title">4. Fortalezas destacadas</p>
        ${bulletList(strengths, "#145c2c")}
      </div>
      <div>
        <p class="section-title">5. Aspectos por fortalecer</p>
        ${bulletList(improvements, "#e0a723")}
      </div>
    </section>

    <section>
      <p class="section-title">6. Observación del entrenador</p>
      <div class="quote">${escapeHtml(report.summary)}</div>
    </section>

    <section>
      <p class="section-title">7. Plan de mejora — próximo período</p>
      ${planSection}
      ${report.recommendation_note ? `<div class="callout"><b>Recomendación del cuerpo técnico:</b> ${escapeHtml(report.recommendation_note)}</div>` : ""}
    </section>

    ${signaturesBlock({ coachName: player.coachName, coordinatorName: player.coordinatorName })}
  `;

  openPrintWindow(`Informe de Evolución — ${player.fullName}`, body);
}
