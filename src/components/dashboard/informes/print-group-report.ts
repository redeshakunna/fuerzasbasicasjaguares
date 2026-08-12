import { areaLabel, periodLabel, type ReportArea } from "@/lib/informes/report-generator";
import type { GroupReportRow } from "@/lib/data/group-reports";
import {
  buildRadarSvg,
  escapeHtml,
  formatDateLong,
  headerBlock,
  openPrintWindow,
  signaturesBlock,
} from "@/lib/print/report-print-kit";

const reportAreas: ReportArea[] = ["technical", "tactical", "physical", "attitude"];

function areaScoreOf(report: GroupReportRow, area: ReportArea): number | null {
  const map: Record<ReportArea, number | null> = {
    technical: report.technical_score,
    tactical: report.tactical_score,
    physical: report.physical_score,
    attitude: report.attitude_score,
  };
  return map[area];
}

/**
 * PDF imprimible del informe grupal — misma infografía de una página que el
 * informe individual, adaptada a datos de categoría: foto del plantel,
 * resumen agregado, radar de áreas y jugadores destacados (reales, marcados
 * por el entrenador al evaluar, nunca inventados).
 */
export function printGroupReport(
  report: GroupReportRow,
  categoryPhoto: string | null,
  staffNames: { coachName: string | null; coordinatorName: string | null },
): void {
  const scoreLabel = report.average_score !== null ? `${Number(report.average_score).toFixed(1)}/10` : "—";
  const standoutNames = (report.standout_players ?? "")
    .split(",")
    .map((n) => n.trim())
    .filter((n) => n.length > 0);

  const photoBlock = categoryPhoto
    ? `<img src="${categoryPhoto}" alt="" style="width:100%;height:100%;object-fit:cover;" />`
    : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#f6f7f5;color:#0d121033;font-size:11px;font-weight:700;">SIN FOTO</div>`;

  const infoRows: [string, string][] = [
    ["Categoría", report.category],
    ["Jugadores en plantel", String(report.player_count)],
    ["Asistencia promedio", report.attendance_pct !== null ? `${report.attendance_pct}%` : "—"],
    ["Entrenador", staffNames.coachName ?? "—"],
    ["Coordinador deportivo", staffNames.coordinatorName ?? "—"],
  ];
  const infoTable = infoRows
    .map(([label, value]) => `<tr><td class="label">${escapeHtml(label)}</td><td class="value">${escapeHtml(value)}</td></tr>`)
    .join("");

  const statsRow = `<div class="stats-row">
    <div class="stat-box">
      <div class="n">${report.player_count}</div>
      <div class="l">Jugadores</div>
      <div class="sub">&nbsp;</div>
    </div>
    <div class="stat-box">
      <div class="n">${report.attendance_pct !== null ? `${report.attendance_pct}%` : "—"}</div>
      <div class="l">Asistencia promedio</div>
      <div class="sub">&nbsp;</div>
    </div>
    <div class="stat-box">
      <div class="n">${standoutNames.length}</div>
      <div class="l">Jugadores destacados</div>
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
      return `<tr>
        <td style="font-weight:700;">${areaLabel[area]}</td>
        <td style="font-weight:800;color:${score !== null && score >= 7 ? "#145c2c" : "#0d1210"};">${score !== null ? score.toFixed(1) + "/10" : "—"}</td>
      </tr>`;
    })
    .join("");

  const radarSvg = buildRadarSvg(
    reportAreas.map((area) => ({ label: areaLabel[area], score: areaScoreOf(report, area) })),
  );

  const standoutBlock =
    standoutNames.length > 0
      ? standoutNames
          .map(
            (name) => `<div class="bullet-item">
              <span class="bullet-dot" style="background:#145c2c;"></span>
              <div><p class="t">${escapeHtml(name)}</p></div>
            </div>`,
          )
          .join("")
      : `<p style="font-size:11.5px;color:#0d121066;">Sin jugadores destacados marcados en este período.</p>`;

  const body = `
    ${headerBlock({
      docTitle: "Informe Grupal de Seguimiento Deportivo",
      periodLabel: periodLabel(report.period),
      categoryLabel: report.category,
      dateLabel: formatDateLong(new Date()),
    })}

    <section>
      <p class="section-title">1. Información del grupo</p>
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
          <thead><tr><th>Área</th><th>Calificación</th></tr></thead>
          <tbody>${areaRows}</tbody>
        </table>
        ${radarSvg}
      </div>
    </section>

    <section>
      <p class="section-title">4. Jugadores destacados</p>
      ${standoutBlock}
    </section>

    <section>
      <p class="section-title">5. Resumen del entrenador</p>
      <div class="quote">${escapeHtml(report.summary)}</div>
    </section>

    ${report.comments ? `<section><p class="section-title">6. Comentarios adicionales</p><div class="quote">${escapeHtml(report.comments)}</div></section>` : ""}

    ${signaturesBlock({ coachName: staffNames.coachName, coordinatorName: staffNames.coordinatorName })}
  `;

  openPrintWindow(`Informe Grupal — ${report.category}`, body);
}
