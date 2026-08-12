"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, ImagePlus, Mail, MessageCircle, Printer, RefreshCw, Send, Sparkles, Users } from "lucide-react";
import { Card, CardHeader } from "../ui/Card";
import { Badge } from "../ui/Badge";
import {
  generateGroupReport,
  markGroupReportReviewed,
  sendGroupReport,
  updateGroupReportFields,
  uploadCategoryPhoto,
} from "@/app/plataforma/(dashboard)/informes/actions";
import { periodLabel } from "@/lib/informes/report-generator";
import { whatsAppShareUrl } from "@/lib/training/whatsapp";
import type { GroupReportRow } from "@/lib/data/group-reports";
import { printGroupReport } from "./print-group-report";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function scoreTone(score: number | null) {
  if (score === null) return { text: "text-jaguar-ink/30", bg: "bg-jaguar-mist" };
  if (score >= 8.5) return { text: "text-jaguar-green-600", bg: "bg-jaguar-green-50" };
  if (score >= 6.5) return { text: "text-jaguar-turquoise-600", bg: "bg-jaguar-turquoise-500/10" };
  if (score >= 4.5) return { text: "text-jaguar-gold-600", bg: "bg-jaguar-gold-500/10" };
  return { text: "text-jaguar-maroon-600", bg: "bg-jaguar-maroon-500/10" };
}

const areaFields = [
  { key: "technical_score" as const, label: "Técnica" },
  { key: "tactical_score" as const, label: "Táctica" },
  { key: "physical_score" as const, label: "Física" },
  { key: "attitude_score" as const, label: "Actitud" },
];

function buildShareText(report: GroupReportRow): string {
  const lines = [
    "ACADEMIA JAGUARES DE CÓRDOBA",
    `Informe Grupal — ${report.category}`,
    periodLabel(report.period).replace(/^./, (c) => c.toUpperCase()),
    "",
    `Promedio del plantel: ${report.average_score !== null ? `${Number(report.average_score).toFixed(1)}/10` : "—"}`,
    report.attendance_pct !== null ? `Asistencia promedio: ${report.attendance_pct}%` : null,
    `Jugadores evaluados: ${report.player_count}`,
    "",
    report.summary,
    report.comments ? `\n${report.comments}` : null,
    "",
    "¡Aquí nace el futuro!",
  ];
  return lines.filter((l) => l !== null).join("\n");
}

export function GroupReportCard({
  category,
  currentPeriod,
  report,
  categoryPhoto,
  isAdmin,
  guardianEmails,
  coachName,
  coordinatorName,
}: {
  category: string;
  currentPeriod: string;
  report: GroupReportRow | null;
  categoryPhoto: string | null;
  isAdmin: boolean;
  guardianEmails: string[];
  coachName: string | null;
  coordinatorName: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [summary, setSummary] = useState(report?.summary ?? "");
  const [comments, setComments] = useState(report?.comments ?? "");
  const [dirty, setDirty] = useState(false);
  const [sendDate, setSendDate] = useState(report?.send_date ?? todayISO());
  const [photoMessage, setPhotoMessage] = useState<string | null>(null);

  function generate() {
    startTransition(async () => {
      await generateGroupReport(category, currentPeriod);
      router.refresh();
    });
  }

  function save() {
    if (!report) return;
    startTransition(async () => {
      await updateGroupReportFields(report.id, { summary, comments: comments || null });
      setDirty(false);
      router.refresh();
    });
  }

  function markReviewed() {
    if (!report) return;
    startTransition(async () => {
      await markGroupReportReviewed(report.id);
      router.refresh();
    });
  }

  function send() {
    if (!report) return;
    startTransition(async () => {
      await sendGroupReport(report.id, sendDate);
      router.refresh();
    });
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoMessage(null);
    const formData = new FormData();
    formData.set("photo", file);
    startTransition(async () => {
      const result = await uploadCategoryPhoto(category, formData);
      setPhotoMessage(result.error ?? "Foto actualizada.");
      router.refresh();
    });
  }

  if (!report) {
    return (
      <Card className="flex flex-col items-center gap-3 px-6 py-12 text-center">
        <Users className="h-6 w-6 text-jaguar-ink/20" strokeWidth={1.6} aria-hidden />
        <div>
          <p className="text-[13.5px] lg:text-[15px] font-bold text-jaguar-ink">Aún no hay informe grupal de {periodLabel(currentPeriod)}</p>
          <p className="mt-1 text-[12.5px] lg:text-[13.5px] text-jaguar-ink/45">
            Resumen agregado del plantel — promedio por área, asistencia y jugadores destacados, sin exponer notas individuales.
          </p>
        </div>
        <button
          type="button"
          onClick={generate}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-[12.5px] lg:text-[13.5px] font-semibold text-white transition-colors hover:bg-violet-700 disabled:opacity-60"
        >
          <Sparkles className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          {isPending ? "Generando…" : "Generar informe grupal"}
        </button>
      </Card>
    );
  }

  const isApproved = report.status !== "Borrador";
  const shareText = buildShareText(report);
  const mailtoHref = guardianEmails.length > 0
    ? `mailto:?bcc=${encodeURIComponent(guardianEmails.join(","))}&subject=${encodeURIComponent(`Informe Grupal — ${category} — ${periodLabel(report.period)}`)}&body=${encodeURIComponent(shareText)}`
    : null;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: "easeOut" }}>
      <Card className="p-5">
        <CardHeader
          title={`Informe grupal — ${periodLabel(report.period)}`}
          subtitle={`${report.player_count} jugadores evaluados`}
          action={
            <div className="flex items-center gap-2">
              <Badge tone={report.status === "Enviado" ? "green" : report.status === "Revisado" ? "turquoise" : "gold"}>
                {report.status}
              </Badge>
              <button
                type="button"
                onClick={generate}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 rounded-lg border border-jaguar-ink/10 px-3 py-1.5 text-[12px] lg:text-[13px] font-semibold text-jaguar-ink/60 transition-colors hover:bg-jaguar-ink/[0.03] disabled:opacity-50"
              >
                <RefreshCw className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                Regenerar
              </button>
            </div>
          }
        />

        <div className="mt-4 px-6">
          <div className="flex flex-wrap items-start gap-4">
            {categoryPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={categoryPhoto} alt={category} className="h-28 w-40 shrink-0 rounded-2xl object-cover" />
            ) : (
              <div className="flex h-28 w-40 shrink-0 items-center justify-center rounded-2xl bg-jaguar-mist">
                <Users className="h-6 w-6 text-jaguar-ink/20" strokeWidth={1.6} aria-hidden />
              </div>
            )}
            {isAdmin ? (
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-jaguar-ink/10 px-3 py-1.5 text-[12px] lg:text-[13px] font-semibold text-jaguar-ink/60 hover:bg-jaguar-ink/[0.03]"
                >
                  <ImagePlus className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                  {categoryPhoto ? "Cambiar foto de portada" : "Subir foto de portada"}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                {photoMessage ? <p className="mt-1.5 text-[11.5px] lg:text-[12.5px] text-jaguar-ink/45">{photoMessage}</p> : null}
              </div>
            ) : null}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {areaFields.map((f) => {
              const score = report[f.key];
              const tone = scoreTone(score);
              return (
                <div key={f.key} className={`rounded-xl px-2.5 py-2.5 text-center ${tone.bg}`}>
                  <p className="text-[10px] lg:text-[11px] font-semibold uppercase tracking-[0.02em] text-jaguar-ink/45">{f.label}</p>
                  <p className={`mt-0.5 text-[15px] lg:text-[16.5px] font-extrabold ${tone.text}`}>{score !== null ? Number(score).toFixed(1) : "—"}</p>
                </div>
              );
            })}
          </div>

          {report.standout_players ? (
            <div className="mt-3 rounded-xl bg-jaguar-gold-500/8 p-3.5">
              <p className="text-[11px] lg:text-[12px] font-semibold uppercase tracking-[0.03em] text-jaguar-gold-700/80">Jugadores destacados</p>
              <p className="mt-1 text-[13px] lg:text-[14px] text-jaguar-ink/80">{report.standout_players}</p>
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
              onChange={(e) => {
                setSummary(e.target.value);
                setDirty(true);
              }}
              className="mt-2 w-full resize-none rounded-lg bg-transparent text-[13px] lg:text-[14px] leading-relaxed text-jaguar-ink focus:outline-none"
            />
          </div>

          <label className="mt-3 block text-[11px] lg:text-[12px] font-semibold uppercase tracking-[0.02em] text-jaguar-ink/40">
            Comentarios adicionales
            <textarea
              rows={2}
              value={comments}
              onChange={(e) => {
                setComments(e.target.value);
                setDirty(true);
              }}
              placeholder="Comentarios para las familias de la categoría…"
              className="mt-1 w-full resize-none rounded-lg bg-jaguar-mist/40 px-2.5 py-2 text-[12.5px] lg:text-[13.5px] font-normal text-jaguar-ink placeholder:text-jaguar-ink/25 focus:outline-none"
            />
          </label>

          <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-jaguar-ink/6 pt-3.5">
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
                  {report.status === "Enviado" ? "Reenviar" : "Enviar a las familias"}
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-jaguar-green-600/10 pt-3">
                <button
                  type="button"
                  onClick={() => printGroupReport(report, categoryPhoto, { coachName, coordinatorName })}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-jaguar-ink/10 bg-white px-3 py-1.5 text-[12px] lg:text-[13px] font-semibold text-jaguar-ink/70 hover:bg-jaguar-ink/[0.03]"
                >
                  <Printer className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                  Imprimir / PDF
                </button>
                <a
                  href={mailtoHref ?? undefined}
                  aria-disabled={!mailtoHref}
                  title={mailtoHref ? undefined : "Ningún jugador de la categoría tiene correo de acudiente registrado"}
                  onClick={(e) => {
                    if (!mailtoHref) e.preventDefault();
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-lg border border-jaguar-ink/10 bg-white px-3 py-1.5 text-[12px] lg:text-[13px] font-semibold ${
                    mailtoHref ? "text-jaguar-ink/70 hover:bg-jaguar-ink/[0.03]" : "cursor-not-allowed text-jaguar-ink/30"
                  }`}
                >
                  <Mail className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                  Enviar por correo ({guardianEmails.length})
                </a>
                <a
                  href={whatsAppShareUrl(shareText)}
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
        </div>
      </Card>
    </motion.div>
  );
}
