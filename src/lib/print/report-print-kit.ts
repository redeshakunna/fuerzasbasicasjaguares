/**
 * Kit compartido para los PDF imprimibles de informes (individual y grupal) —
 * mismo lenguaje visual: encabezado de marca, radar de áreas, tarjetas de
 * resumen y firmas. Sin dependencias nuevas: genera HTML/SVG a mano y usa
 * window.print() (mismo patrón que ya existía en PlayerReportsTab/GroupReportCard).
 */

export const PRINT_COLORS = {
  ink: "#0d1210",
  green: "#145c2c",
  greenBg: "#eaf5ee",
  turquoise: "#17b8bd",
  gold: "#e0a723",
  goldBg: "#fdf3e1",
  maroon: "#6e1b2b",
  neutralBg: "#f6f7f5",
} as const;

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Convierte saltos de línea en párrafos/viñetas simples para texto libre (tareas, comentarios). */
export function textLines(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

export function formatDateLong(date: Date): string {
  return date.toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" });
}

interface RadarItem {
  label: string;
  score: number | null;
}

/** Radar de áreas (SVG, a mano) — se adapta a cualquier número de ejes, sin librería de gráficos. */
export function buildRadarSvg(items: RadarItem[]): string {
  if (items.length < 3) return "";

  const cx = 170;
  const cy = 148;
  const radius = 86;
  const n = items.length;
  const angleFor = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
  const pointAt = (i: number, fraction: number) => ({
    x: cx + Math.cos(angleFor(i)) * radius * fraction,
    y: cy + Math.sin(angleFor(i)) * radius * fraction,
  });

  const rings = [0.25, 0.5, 0.75, 1]
    .map((frac) => {
      const pts = items.map((_, i) => pointAt(i, frac)).map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
      return `<polygon points="${pts}" fill="none" stroke="#0d121014" stroke-width="1" />`;
    })
    .join("");

  const axes = items
    .map((_, i) => {
      const p = pointAt(i, 1);
      return `<line x1="${cx}" y1="${cy}" x2="${p.x.toFixed(1)}" y2="${p.y.toFixed(1)}" stroke="#0d121014" stroke-width="1" />`;
    })
    .join("");

  const dataPoints = items.map((item, i) => pointAt(i, Math.max(0, Math.min(1, (item.score ?? 0) / 10))));
  const dataPolygon = dataPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const dataDots = dataPoints
    .map((p) => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.5" fill="${PRINT_COLORS.green}" />`)
    .join("");

  const labels = items
    .map((item, i) => {
      const p = pointAt(i, 1.34);
      const cos = Math.cos(angleFor(i));
      const anchor = Math.abs(cos) < 0.15 ? "middle" : cos > 0 ? "start" : "end";
      return `<text x="${p.x.toFixed(1)}" y="${p.y.toFixed(1)}" text-anchor="${anchor}" font-size="11.5" font-weight="700" fill="${PRINT_COLORS.ink}">${escapeHtml(item.label)}</text>
      <text x="${p.x.toFixed(1)}" y="${(p.y + 14).toFixed(1)}" text-anchor="${anchor}" font-size="12.5" font-weight="800" fill="${PRINT_COLORS.green}">${item.score !== null ? item.score.toFixed(1) : "—"}</text>`;
    })
    .join("");

  return `<svg width="340" height="300" viewBox="0 0 340 300" xmlns="http://www.w3.org/2000/svg">
    ${rings}
    ${axes}
    <polygon points="${dataPolygon}" fill="${PRINT_COLORS.green}22" stroke="${PRINT_COLORS.green}" stroke-width="2" />
    ${dataDots}
    ${labels}
  </svg>`;
}

const BASE_STYLE = `
  * { box-sizing: border-box; }
  body { font-family: -apple-system, Segoe UI, sans-serif; color:${PRINT_COLORS.ink}; margin:0; padding: 28px 34px; }
  .header { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; border-bottom: 3px solid ${PRINT_COLORS.green}; padding-bottom:14px; margin-bottom:18px; }
  .brand { display:flex; align-items:center; gap:12px; }
  .brand img { height:52px; width:52px; object-fit:contain; }
  .brand-name { font-size:13px; font-weight:800; text-transform:uppercase; letter-spacing:0.02em; color:${PRINT_COLORS.green}; line-height:1.3; }
  .brand-tag { font-size:9px; font-weight:600; text-transform:uppercase; letter-spacing:0.07em; color:${PRINT_COLORS.ink}66; margin-top:2px; }
  .doc-title { text-align:center; padding-top:4px; }
  .doc-title h1 { font-size:16.5px; font-weight:800; text-transform:uppercase; letter-spacing:0.03em; margin:0; color:${PRINT_COLORS.ink}; }
  .doc-title p { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:${PRINT_COLORS.green}; margin:3px 0 0; }
  .meta { text-align:right; font-size:10px; line-height:1.7; color:${PRINT_COLORS.ink}88; white-space:nowrap; }
  .meta b { color:${PRINT_COLORS.ink}; font-weight:800; }
  section { margin-top: 18px; }
  .section-title { font-size:10.5px; font-weight:800; text-transform:uppercase; letter-spacing:0.05em; color:${PRINT_COLORS.green}; margin: 0 0 9px; }
  table.info { width:100%; border-collapse:collapse; }
  table.info td { padding:5px 8px; font-size:11.5px; border-bottom:1px solid ${PRINT_COLORS.ink}0a; }
  table.info td.label { color:${PRINT_COLORS.ink}88; font-weight:700; width:150px; }
  table.info td.value { color:${PRINT_COLORS.ink}; font-weight:600; }
  .stats-row { display:flex; gap:10px; }
  .stat-box { flex:1; background:${PRINT_COLORS.neutralBg}; border-radius:12px; padding:12px 8px; text-align:center; }
  .stat-box .n { font-size:20px; font-weight:800; color:${PRINT_COLORS.green}; line-height:1.1; }
  .stat-box .l { font-size:8.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.03em; color:${PRINT_COLORS.ink}66; margin-top:3px; }
  .stat-box .sub { font-size:8.5px; color:${PRINT_COLORS.ink}55; margin-top:1px; }
  table.areas { width:100%; border-collapse:collapse; }
  table.areas th { text-align:left; font-size:9.5px; text-transform:uppercase; letter-spacing:0.03em; color:${PRINT_COLORS.ink}66; padding:5px 8px; border-bottom:2px solid ${PRINT_COLORS.ink}0f; }
  table.areas td { padding:7px 8px; font-size:11.5px; border-bottom:1px solid ${PRINT_COLORS.ink}0a; vertical-align:top; }
  .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
  .bullet-item { display:flex; gap:8px; align-items:flex-start; margin-bottom:9px; }
  .bullet-dot { flex-shrink:0; width:17px; height:17px; border-radius:50%; margin-top:1px; }
  .bullet-item .t { font-size:11.5px; font-weight:700; margin:0; }
  .bullet-item .d { font-size:11px; color:${PRINT_COLORS.ink}99; margin:1px 0 0; line-height:1.4; }
  .quote { background:${PRINT_COLORS.neutralBg}; border-radius:12px; padding:13px 15px; font-size:12px; line-height:1.6; }
  .plan-list { background:${PRINT_COLORS.neutralBg}; border-radius:12px; padding:13px 15px; }
  .plan-list li { font-size:11.5px; line-height:1.6; }
  .callout { margin-top:10px; background:${PRINT_COLORS.greenBg}; border:1px solid ${PRINT_COLORS.green}33; border-radius:12px; padding:11px 14px; font-size:11.5px; line-height:1.5; }
  .signatures { display:flex; justify-content:space-around; margin-top:34px; padding-top:8px; }
  .sig { text-align:center; width:180px; }
  .sig .line { border-top:1.4px solid ${PRINT_COLORS.ink}; margin-top:34px; margin-bottom:6px; }
  .sig .name { font-size:11.5px; font-weight:700; }
  .sig .role { font-size:9px; color:${PRINT_COLORS.ink}66; text-transform:uppercase; letter-spacing:0.03em; }
  .sig-logo { text-align:center; width:70px; }
  .sig-logo img { height:44px; width:44px; object-fit:contain; }
  @media print {
    body { padding: 12mm; }
    @page { size: A4; margin: 0; }
  }
`;

export function headerBlock(opts: {
  docTitle: string;
  periodLabel: string;
  categoryLabel: string;
  dateLabel: string;
}): string {
  const logoSrc = `${window.location.origin}/brand/logo-fuerzas-basicas.png`;
  return `<div class="header">
    <div class="brand">
      <img src="${logoSrc}" alt="" />
      <div>
        <div class="brand-name">Fuerzas Básicas<br/>Jaguares de Córdoba</div>
        <div class="brand-tag">Formamos talento, construimos sueños</div>
      </div>
    </div>
    <div class="doc-title">
      <h1>${escapeHtml(opts.docTitle)}</h1>
      <p>Período: ${escapeHtml(opts.periodLabel)}</p>
    </div>
    <div class="meta">
      <div>CATEGORÍA:<br/><b>${escapeHtml(opts.categoryLabel)}</b></div>
      <div style="margin-top:6px;">FECHA DEL INFORME:<br/><b>${escapeHtml(opts.dateLabel)}</b></div>
    </div>
  </div>`;
}

export function signaturesBlock(opts: { coachName: string | null; coordinatorName: string | null }): string {
  const logoSrc = `${window.location.origin}/brand/logo-fuerzas-basicas.png`;
  return `<div class="signatures">
    <div class="sig">
      <div class="line"></div>
      <p class="name">${opts.coachName ? escapeHtml(opts.coachName) : "—"}</p>
      <p class="role">Entrenador</p>
    </div>
    <div class="sig-logo">
      <img src="${logoSrc}" alt="" />
    </div>
    <div class="sig">
      <div class="line"></div>
      <p class="name">${opts.coordinatorName ? escapeHtml(opts.coordinatorName) : "—"}</p>
      <p class="role">Coordinador deportivo</p>
    </div>
  </div>`;
}

/** Abre una ventana nueva, escribe el HTML completo del informe y dispara la impresión al cargar. */
export function openPrintWindow(title: string, bodyHtml: string): void {
  const win = window.open("", "_blank", "width=900,height=1000");
  if (!win) return;

  win.document.write(`<!doctype html>
<html lang="es"><head><meta charset="utf-8" />
<title>${escapeHtml(title)}</title>
<style>${BASE_STYLE}</style>
</head><body>
${bodyHtml}
<script>window.onload = () => window.print();</script>
</body></html>`);
  win.document.close();
}
