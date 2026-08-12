"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Mail,
  MessageCircle,
  PenLine,
  Printer,
  RefreshCw,
  Send,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Card, CardHeader } from "../../ui/Card";
import { Badge } from "../../ui/Badge";
import {
  createManualReport,
  generateReport,
  markReportReviewed,
  sendReport,
  updateReportFields,
  type ManualReportInput,
} from "@/app/plataforma/(dashboard)/jugadores/report-actions";
import { setPerformanceGroup, setPromotionReady } from "@/app/plataforma/(dashboard)/jugadores/actions";
import { areaLabel, periodLabel, type ReportArea } from "@/lib/informes/report-generator";
import type { MonthlyParticipation, PlayerReportRow } from "@/lib/data/reports";
import { printPlayerReport, type PrintPlayerInfo } from "./print-player-report";

function statusTone(status: string): "gold" | "turquoise" | "green" {
  if (status === "Revisado") return "turquoise";
  if (status === "Enviado") return "green";
  return "gold";
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function scoreTone(score: number | null) {
  if (score === null) return { text: "text-jaguar-ink/30", bg: "bg-jaguar-mist", ring: "ring-jaguar-ink/10" };
  if (score >= 8.5) return { text: "text-jaguar-green-600", bg: "bg-jaguar-green-50", ring: "ring-jaguar-green-500/25" };
  if (score >= 6.5) return { text: "text-jaguar-turquoise-600", bg: "bg-jaguar-turquoise-500/10", ring: "ring-jaguar-turquoise-500/25" };
  if (score >= 4.5) return { text: "text-jaguar-gold-600", bg: "bg-jaguar-gold-500/10", ring: "ring-jaguar-gold-500/25" };
  return { text: "text-jaguar-maroon-600", bg: "bg-jaguar-maroon-500/10", ring: "ring-jaguar-maroon-500/25" };
}

/** Normaliza un teléfono colombiano a dígitos con código de país, para wa.me. `null` si no hay nada usable. */
function waNumber(phone: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("57")) return digits;
  if (digits.length === 10) return `57${digits}`;
  return digits;
}

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

const reportAreas: ReportArea[] = ["technical", "tactical", "physical", "attitude"];

/** Texto plano del informe — reutilizado por el correo y el mensaje de WhatsApp. */
function buildShareText(report: PlayerReportRow, playerFullName: string): string {
  const lines = [
    "ACADEMIA JAGUARES DE CÓRDOBA",
    `Informe de Evolución — ${playerFullName}`,
    periodLabel(report.period).replace(/^./, (c) => c.toUpperCase()),
    "",
    `Calificación general: ${report.average_score !== null ? `${Number(report.average_score).toFixed(1)}/10` : "—"}`,
    report.attendance_pct !== null ? `Asistencia: ${report.attendance_pct}%` : null,
    "",
    report.summary,
    "",
  ];

  reportAreas.forEach((area) => {
    const notes = areaNotesOf(report, area);
    if (notes) lines.push(`${areaLabel[area]}: ${notes}`);
  });

  if (report.tasks) {
    lines.push("", "Tareas / compromisos para el próximo mes:", report.tasks);
  }
  if (report.comments) {
    lines.push("", "Comentarios adicionales:", report.comments);
  }

  lines.push("", "¡Aquí nace el futuro!");
  return lines.filter((l) => l !== null).join("\n");
}

const sectionFields = [
  { key: "technicalNotes", label: "Técnica" },
  { key: "tacticalNotes", label: "Táctica" },
  { key: "physicalNotes", label: "Física" },
  { key: "attitudeNotes", label: "Actitud / disciplina" },
] as const;

/** Formulario de creación manual — por secciones, sin depender del generador de reglas. */
function ManualReportForm({
  onCancel,
  onSubmit,
  isPending,
}: {
  onCancel: () => void;
  onSubmit: (input: ManualReportInput) => void;
  isPending: boolean;
}) {
  const [fields, setFields] = useState<ManualReportInput>({
    technicalNotes: "",
    tacticalNotes: "",
    physicalNotes: "",
    attitudeNotes: "",
    tasks: "",
  });

  return (
    <div className="mt-4 rounded-2xl border border-jaguar-ink/8 bg-jaguar-mist/30 p-4">
      <p className="text-[12.5px] lg:text-[13.5px] font-bold text-jaguar-ink">Informe manual — por secciones</p>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {sectionFields.map((f) => (
          <label key={f.key} className="text-[11.5px] lg:text-[12.5px] font-semibold text-jaguar-ink/55">
            {f.label}
            <textarea
              rows={3}
              value={fields[f.key]}
              onChange={(e) => setFields((prev) => ({ ...prev, [f.key]: e.target.value }))}
              placeholder={`Observaciones de ${f.label.toLowerCase()}…`}
              className="mt-1.5 w-full resize-none rounded-xl border border-jaguar-ink/10 bg-white px-3 py-2 text-[13px] lg:text-[14px] font-normal text-jaguar-ink placeholder:text-jaguar-ink/30 focus:border-jaguar-green-500/40 focus:outline-none"
            />
          </label>
        ))}
      </div>
      <label className="mt-3 block text-[11.5px] lg:text-[12.5px] font-semibold text-jaguar-ink/55">
        Tareas / compromisos para el próximo mes
        <textarea
          rows={2}
          value={fields.tasks}
          onChange={(e) => setFields((prev) => ({ ...prev, tasks: e.target.value }))}
          placeholder="Ej. Trabajar remate con pierna izquierda, mejorar puntualidad…"
          className="mt-1.5 w-full resize-none rounded-xl border border-jaguar-ink/10 bg-white px-3 py-2 text-[13px] lg:text-[14px] font-normal text-jaguar-ink placeholder:text-jaguar-ink/30 focus:border-jaguar-green-500/40 focus:outline-none"
        />
      </label>
      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-3.5 py-2 text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-ink/55 hover:bg-jaguar-ink/[0.04]"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => onSubmit(fields)}
          disabled={isPending}
          className="rounded-lg bg-jaguar-green-600 px-4 py-2 text-[12.5px] lg:text-[13.5px] font-semibold text-white hover:bg-jaguar-green-700 disabled:opacity-60"
        >
          {isPending ? "Creando…" : "Crear informe manual"}
        </button>
      </div>
    </div>
  );
}

function ReportCard({
  report,
  playerId,
  playerFirstName,
  playerFullName,
  guardianEmail,
  guardianPhone,
  currentCategory,
  currentPerformanceGroup,
  isCurrent,
  printInfo,
  participation,
}: {
  report: PlayerReportRow;
  playerId: string;
  playerFirstName: string;
  playerFullName: string;
  guardianEmail: string | null;
  guardianPhone: string | null;
  currentCategory: string;
  currentPerformanceGroup: string | null;
  isCurrent: boolean;
  printInfo: PrintPlayerInfo;
  participation: MonthlyParticipation;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [summary, setSummary] = useState(report.summary);
  const [technicalNotes, setTechnicalNotes] = useState(report.technical_notes ?? "");
  const [tacticalNotes, setTacticalNotes] = useState(report.tactical_notes ?? "");
  const [physicalNotes, setPhysicalNotes] = useState(report.physical_notes ?? "");
  const [attitudeNotes, setAttitudeNotes] = useState(report.attitude_notes ?? "");
  const [comments, setComments] = useState(report.comments ?? "");
  const [tasks, setTasks] = useState(report.tasks ?? "");
  const [previousTasks, setPreviousTasks] = useState(report.previous_tasks ?? "");
  const [sendDate, setSendDate] = useState(report.send_date ?? todayISO());
  const [dirty, setDirty] = useState(false);
  const [applyMessage, setApplyMessage] = useState<string | null>(null);

  function field<T extends (v: string) => void>(setter: T) {
    return (v: string) => {
      setter(v);
      setDirty(true);
    };
  }

  function save() {
    startTransition(async () => {
      await updateReportFields(report.id, playerId, {
        summary,
        technical_notes: technicalNotes || null,
        tactical_notes: tacticalNotes || null,
        physical_notes: physicalNotes || null,
        attitude_notes: attitudeNotes || null,
        comments: comments || null,
        tasks: tasks || null,
        previous_tasks: previousTasks || null,
      });
      setDirty(false);
      router.refresh();
    });
  }

  function markReviewed() {
    startTransition(async () => {
      await markReportReviewed(report.id, playerId);
      router.refresh();
    });
  }

  function regenerate() {
    startTransition(async () => {
      await generateReport(playerId, playerFirstName, report.period);
      router.refresh();
    });
  }

  function send() {
    startTransition(async () => {
      await sendReport(report.id, playerId, sendDate);
      router.refresh();
    });
  }

  function applyGroup(group: "A" | "B") {
    startTransition(async () => {
      const result = await setPerformanceGroup(playerId, group);
      setApplyMessage(result.error ?? `Grupo actualizado a ${group}.`);
      router.refresh();
    });
  }

  function applyPromotion() {
    startTransition(async () => {
      const result = await setPromotionReady(playerId, true);
      setApplyMessage(result.error ?? "Jugador marcado como listo para promoción.");
      router.refresh();
    });
  }

  const isApproved = report.status !== "Borrador";
  const waTarget = waNumber(guardianPhone);
  const shareText = buildShareText(report, playerFullName);
  const mailtoHref = guardianEmail
    ? `mailto:${guardianEmail}?subject=${encodeURIComponent(`Informe de Evolución — ${playerFullName} — ${periodLabel(report.period)}`)}&body=${encodeURIComponent(shareText)}`
    : null;
  const waHref = waTarget
    ? `https://wa.me/${waTarget}?text=${encodeURIComponent(shareText)}`
    : `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: "easeOut" }}>
      <Card className={`p-5 ${isCurrent ? "ring-2 ring-jaguar-green-500/20" : ""}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl ring-2 ${scoreTone(report.average_score).bg} ${scoreTone(report.average_score).ring}`}>
              <span className={`text-[16px] lg:text-[17.5px] font-extrabold leading-none ${scoreTone(report.average_score).text}`}>
                {report.average_score !== null ? Number(report.average_score).toFixed(1) : "—"}
              </span>
              <span className="mt-0.5 text-[8px] lg:text-[9px] font-bold uppercase tracking-wide text-jaguar-ink/35">/ 10</span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[14px] lg:text-[15.5px] font-bold capitalize text-jaguar-ink">{periodLabel(report.period)}</p>
                {isCurrent ? <Badge tone="green">Informe actual</Badge> : null}
                <Badge tone={statusTone(report.status)}>{report.status}</Badge>
                <Badge tone={report.source === "manual" ? "neutral" : "violet"}>
                  {report.source === "manual" ? "Manual" : "IA"}
                </Badge>
              </div>
              {report.attendance_pct !== null ? (
                <p className="mt-1 text-[12px] lg:text-[13px] text-jaguar-ink/50">Asistencia del mes: {report.attendance_pct}%</p>
              ) : null}
            </div>
          </div>
        </div>

        {/* Calificación por área */}
        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {reportAreas.map((area) => {
            const score = areaScoreOf(report, area);
            const tone = scoreTone(score);
            return (
              <div key={area} className={`rounded-xl px-2.5 py-2.5 text-center ${tone.bg}`}>
                <p className="text-[10px] lg:text-[11px] font-semibold uppercase tracking-[0.02em] text-jaguar-ink/45">{areaLabel[area]}</p>
                <p className={`mt-0.5 text-[15px] lg:text-[16.5px] font-extrabold ${tone.text}`}>{score !== null ? score.toFixed(1) : "—"}</p>
              </div>
            );
          })}
        </div>

        {report.recommendation_note ? (
          <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl bg-jaguar-gold-500/10 p-3.5">
            <TrendingUp className="h-4 w-4 shrink-0 text-jaguar-gold-700" strokeWidth={2} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] lg:text-[12px] font-semibold uppercase tracking-[0.03em] text-jaguar-gold-700/80">
                Recomendación del cuerpo técnico
              </p>
              <p className="mt-1 text-[13px] lg:text-[14px] leading-relaxed text-jaguar-ink/80">{report.recommendation_note}</p>
              <p className="mt-1 text-[11px] lg:text-[12px] text-jaguar-ink/40">
                Actual: {currentCategory} · Grupo {currentPerformanceGroup ?? "sin asignar"}
              </p>
            </div>
            {(report.recommended_group || report.recommended_category) && isCurrent ? (
              <div className="flex shrink-0 flex-col gap-1.5">
                {report.recommended_group ? (
                  <button
                    type="button"
                    onClick={() => applyGroup(report.recommended_group as "A" | "B")}
                    disabled={isPending}
                    className="rounded-lg bg-jaguar-gold-600 px-3 py-1.5 text-[11.5px] lg:text-[12.5px] font-semibold text-white hover:bg-jaguar-gold-700 disabled:opacity-60"
                  >
                    Pasar a Grupo {report.recommended_group}
                  </button>
                ) : null}
                {report.recommended_category ? (
                  <button
                    type="button"
                    onClick={applyPromotion}
                    disabled={isPending}
                    className="rounded-lg border border-jaguar-gold-600/40 px-3 py-1.5 text-[11.5px] lg:text-[12.5px] font-semibold text-jaguar-gold-700 hover:bg-jaguar-gold-500/10 disabled:opacity-60"
                  >
                    Marcar listo para {report.recommended_category}
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
        {applyMessage ? <p className="mt-1.5 text-[11.5px] lg:text-[12.5px] font-medium text-jaguar-green-700">{applyMessage}</p> : null}

        {previousTasks ? (
          <div className="mt-3 rounded-xl bg-jaguar-gold-500/8 p-3.5">
            <p className="text-[11px] lg:text-[12px] font-semibold uppercase tracking-[0.03em] text-jaguar-gold-700/80">
              Seguimiento del informe anterior
            </p>
            <textarea
              rows={2}
              value={previousTasks}
              onChange={(e) => field(setPreviousTasks)(e.target.value)}
              className="mt-1.5 w-full resize-none rounded-lg bg-transparent text-[13px] lg:text-[14px] leading-relaxed text-jaguar-ink/80 focus:outline-none"
            />
          </div>
        ) : null}

        <div className="mt-3 rounded-xl bg-violet-500/[0.04] p-3.5">
          <p className="flex items-center gap-1.5 text-[11px] lg:text-[12px] font-semibold uppercase tracking-[0.03em] text-violet-600">
            <Sparkles className="h-3 w-3" strokeWidth={2} aria-hidden />
            Resumen — editable antes de compartir
          </p>
          <textarea
            rows={4}
            value={summary}
            onChange={(e) => field(setSummary)(e.target.value)}
            className="mt-2 w-full resize-none rounded-lg bg-transparent text-[13px] lg:text-[14px] leading-relaxed text-jaguar-ink focus:outline-none"
          />
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <label className="text-[11px] lg:text-[12px] font-semibold uppercase tracking-[0.02em] text-jaguar-ink/40">
            Técnica
            <textarea
              rows={2}
              value={technicalNotes}
              onChange={(e) => field(setTechnicalNotes)(e.target.value)}
              placeholder="—"
              className="mt-1 w-full resize-none rounded-lg bg-jaguar-mist/40 px-2.5 py-2 text-[12.5px] lg:text-[13.5px] font-normal text-jaguar-ink placeholder:text-jaguar-ink/25 focus:outline-none"
            />
          </label>
          <label className="text-[11px] lg:text-[12px] font-semibold uppercase tracking-[0.02em] text-jaguar-ink/40">
            Táctica
            <textarea
              rows={2}
              value={tacticalNotes}
              onChange={(e) => field(setTacticalNotes)(e.target.value)}
              placeholder="—"
              className="mt-1 w-full resize-none rounded-lg bg-jaguar-mist/40 px-2.5 py-2 text-[12.5px] lg:text-[13.5px] font-normal text-jaguar-ink placeholder:text-jaguar-ink/25 focus:outline-none"
            />
          </label>
          <label className="text-[11px] lg:text-[12px] font-semibold uppercase tracking-[0.02em] text-jaguar-ink/40">
            Física
            <textarea
              rows={2}
              value={physicalNotes}
              onChange={(e) => field(setPhysicalNotes)(e.target.value)}
              placeholder="—"
              className="mt-1 w-full resize-none rounded-lg bg-jaguar-mist/40 px-2.5 py-2 text-[12.5px] lg:text-[13.5px] font-normal text-jaguar-ink placeholder:text-jaguar-ink/25 focus:outline-none"
            />
          </label>
          <label className="text-[11px] lg:text-[12px] font-semibold uppercase tracking-[0.02em] text-jaguar-ink/40">
            Actitud / disciplina
            <textarea
              rows={2}
              value={attitudeNotes}
              onChange={(e) => field(setAttitudeNotes)(e.target.value)}
              placeholder="—"
              className="mt-1 w-full resize-none rounded-lg bg-jaguar-mist/40 px-2.5 py-2 text-[12.5px] lg:text-[13.5px] font-normal text-jaguar-ink placeholder:text-jaguar-ink/25 focus:outline-none"
            />
          </label>
        </div>

        <label className="mt-3 block text-[11px] lg:text-[12px] font-semibold uppercase tracking-[0.02em] text-jaguar-ink/40">
          Tareas / compromisos para el próximo informe
          <textarea
            rows={2}
            value={tasks}
            onChange={(e) => field(setTasks)(e.target.value)}
            placeholder="Se traerán automáticamente en el siguiente informe."
            className="mt-1 w-full resize-none rounded-lg bg-jaguar-mist/40 px-2.5 py-2 text-[12.5px] lg:text-[13.5px] font-normal text-jaguar-ink placeholder:text-jaguar-ink/25 focus:outline-none"
          />
        </label>

        <label className="mt-3 block text-[11px] lg:text-[12px] font-semibold uppercase tracking-[0.02em] text-jaguar-ink/40">
          Comentarios adicionales (antes de enviar)
          <textarea
            rows={2}
            value={comments}
            onChange={(e) => field(setComments)(e.target.value)}
            placeholder="Comentarios para la familia…"
            className="mt-1 w-full resize-none rounded-lg bg-jaguar-mist/40 px-2.5 py-2 text-[12.5px] lg:text-[13.5px] font-normal text-jaguar-ink placeholder:text-jaguar-ink/25 focus:outline-none"
          />
        </label>

        <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-jaguar-ink/6 pt-3.5">
          {report.source === "ia" ? (
            <button
              type="button"
              onClick={regenerate}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 rounded-lg border border-jaguar-ink/10 px-3 py-1.5 text-[12px] lg:text-[13px] font-semibold text-jaguar-ink/60 transition-colors hover:bg-jaguar-ink/[0.03] disabled:opacity-50"
            >
              <RefreshCw className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              Regenerar
            </button>
          ) : null}
          {dirty ? (
            <button
              type="button"
              onClick={save}
              disabled={isPending}
              className="rounded-lg border border-jaguar-ink/10 px-3.5 py-1.5 text-[12px] lg:text-[13px] font-semibold text-jaguar-ink/70 hover:bg-jaguar-ink/[0.03]"
            >
              Guardar cambios
            </button>
          ) : null}
          {report.status === "Borrador" ? (
            <button
              type="button"
              onClick={markReviewed}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 rounded-lg bg-jaguar-green-600 px-3.5 py-1.5 text-[12px] lg:text-[13px] font-semibold text-white hover:bg-jaguar-green-700 disabled:opacity-60"
            >
              <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.1} aria-hidden />
              Marcar como revisado
            </button>
          ) : null}
        </div>

        {isApproved ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.25 }}
            className="mt-3 space-y-3 rounded-xl bg-jaguar-green-50/60 p-3.5"
          >
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-[11.5px] lg:text-[12.5px] font-semibold text-jaguar-ink/55">
                Fecha de envío
                <input
                  type="date"
                  value={sendDate}
                  onChange={(e) => setSendDate(e.target.value)}
                  className="ml-2 rounded-lg border border-jaguar-ink/10 bg-white px-2.5 py-1.5 text-[12.5px] lg:text-[13.5px] text-jaguar-ink focus:outline-none"
                />
              </label>
              <button
                type="button"
                onClick={send}
                disabled={isPending}
                className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-jaguar-turquoise-600 px-3.5 py-1.5 text-[12px] lg:text-[13px] font-semibold text-white hover:bg-jaguar-turquoise-700 disabled:opacity-60"
              >
                <Send className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                {report.status === "Enviado" ? "Reenviar" : "Enviar informe"}
              </button>
              {report.status === "Enviado" && report.sent_at ? (
                <span className="w-full text-[11.5px] lg:text-[12.5px] text-jaguar-green-700/70">
                  Enviado el {new Date(report.sent_at).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-2 border-t border-jaguar-green-600/10 pt-3">
              <button
                type="button"
                onClick={() => printPlayerReport(report, printInfo, participation)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-jaguar-ink/10 bg-white px-3 py-1.5 text-[12px] lg:text-[13px] font-semibold text-jaguar-ink/70 hover:bg-jaguar-ink/[0.03]"
              >
                <Printer className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                Imprimir / PDF
              </button>
              <a
                href={mailtoHref ?? undefined}
                aria-disabled={!mailtoHref}
                title={mailtoHref ? undefined : "Este jugador no tiene correo de acudiente registrado"}
                className={`inline-flex items-center gap-1.5 rounded-lg border border-jaguar-ink/10 bg-white px-3 py-1.5 text-[12px] lg:text-[13px] font-semibold ${
                  mailtoHref ? "text-jaguar-ink/70 hover:bg-jaguar-ink/[0.03]" : "cursor-not-allowed text-jaguar-ink/30"
                }`}
                onClick={(e) => {
                  if (!mailtoHref) e.preventDefault();
                }}
              >
                <Mail className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                Enviar por correo
              </a>
              <a
                href={waHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-1.5 text-[12px] lg:text-[13px] font-semibold text-white hover:bg-[#1fb955]"
              >
                <MessageCircle className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                Compartir por WhatsApp
              </a>
            </div>
          </motion.div>
        ) : null}
      </Card>
    </motion.div>
  );
}

/** Informes de Evolución — uno por mes, por IA o manual, editable y con seguimiento entre períodos. */
export function PlayerReportsTab({
  playerId,
  playerFirstName,
  playerFullName,
  currentPeriod,
  reports,
  guardianEmail,
  guardianPhone,
  currentCategory,
  currentPerformanceGroup,
  printInfo,
  participationByPeriod,
}: {
  playerId: string;
  playerFirstName: string;
  playerFullName: string;
  currentPeriod: string;
  reports: PlayerReportRow[];
  guardianEmail: string | null;
  guardianPhone: string | null;
  currentCategory: string;
  currentPerformanceGroup: string | null;
  printInfo: PrintPlayerInfo;
  participationByPeriod: Record<string, MonthlyParticipation>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [manualFormOpen, setManualFormOpen] = useState(false);
  const hasCurrentPeriodReport = reports.some((r) => r.period === currentPeriod);
  const emptyParticipation: MonthlyParticipation = {
    trainingsTotal: 0,
    trainingsAttended: 0,
    matchesPlayed: 0,
    matchesStarted: 0,
    minutesPlayed: 0,
  };

  function generateCurrent() {
    startTransition(async () => {
      await generateReport(playerId, playerFirstName, currentPeriod);
      router.refresh();
    });
  }

  function submitManual(input: ManualReportInput) {
    startTransition(async () => {
      await createManualReport(playerId, currentPeriod, input);
      setManualFormOpen(false);
      router.refresh();
    });
  }

  const [latest, ...older] = reports;

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <CardHeader
          title="Informe de Evolución"
          subtitle="Uno por mes — por IA (sistema experto) o redactado manualmente. Calificación total y por área, con recomendación de categoría/grupo."
          action={
            !hasCurrentPeriodReport && !manualFormOpen ? (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={generateCurrent}
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-[12.5px] lg:text-[13.5px] font-semibold text-white transition-colors hover:bg-violet-700 disabled:opacity-60"
                >
                  <Sparkles className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                  {isPending ? "Generando…" : "Generar con IA"}
                </button>
                <button
                  type="button"
                  onClick={() => setManualFormOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-jaguar-ink/10 bg-white px-4 py-2 text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-ink/70 transition-colors hover:bg-jaguar-ink/[0.03]"
                >
                  <PenLine className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                  Crear manual
                </button>
              </div>
            ) : null
          }
        />
        {manualFormOpen ? (
          <ManualReportForm onCancel={() => setManualFormOpen(false)} onSubmit={submitManual} isPending={isPending} />
        ) : null}
      </Card>

      {reports.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 px-6 py-14 text-center">
          <Sparkles className="h-6 w-6 text-jaguar-ink/20" strokeWidth={1.6} aria-hidden />
          <p className="text-[13px] lg:text-[14px] font-semibold text-jaguar-ink/50">Aún no hay informes generados para este jugador.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {latest ? (
            <ReportCard
              report={latest}
              playerId={playerId}
              playerFirstName={playerFirstName}
              playerFullName={playerFullName}
              guardianEmail={guardianEmail}
              guardianPhone={guardianPhone}
              currentCategory={currentCategory}
              currentPerformanceGroup={currentPerformanceGroup}
              printInfo={printInfo}
              participation={participationByPeriod[latest.period] ?? emptyParticipation}
              isCurrent
            />
          ) : null}

          {older.length > 0 ? (
            <div className="space-y-3 pt-2">
              <p className="text-[11.5px] lg:text-[12.5px] font-bold uppercase tracking-[0.05em] text-jaguar-ink/35">
                Historial de informes anteriores
              </p>
              {older.map((r) => (
                <ReportCard
                  key={r.id}
                  report={r}
                  playerId={playerId}
                  playerFirstName={playerFirstName}
                  playerFullName={playerFullName}
                  guardianEmail={guardianEmail}
                  guardianPhone={guardianPhone}
                  currentCategory={currentCategory}
                  currentPerformanceGroup={currentPerformanceGroup}
                  printInfo={printInfo}
                  participation={participationByPeriod[r.period] ?? emptyParticipation}
                  isCurrent={false}
                />
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
