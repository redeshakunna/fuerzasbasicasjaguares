"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CalendarClock, CheckCircle2, ChevronDown, MessageCircle, Send, UserPlus } from "lucide-react";
import { Card, CardHeader } from "@/components/dashboard/ui/Card";
import { Avatar } from "@/components/dashboard/ui/Avatar";
import { enviarRecordatorios } from "@/app/plataforma/(dashboard)/finanzas/actions";
import { addReplacementToCallup } from "@/app/plataforma/(dashboard)/mensajes/actions";
import { waHref, type MessageRecipient, type MatchReplacementGroup } from "@/lib/data/messaging-shared";
import { categories, type Category } from "@/lib/data/categories";

const tabs = [
  { id: "deudores", label: "Deudores" },
  { id: "inasistencias", label: "Inasistencias" },
  { id: "reemplazo", label: "Reemplazo de convocatoria" },
  { id: "general", label: "Aviso general" },
] as const;

type TabId = (typeof tabs)[number]["id"];

function initialsOf(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "—";
}

/** Fila de destinatario — mensaje colapsable + botón de envío por WhatsApp (uno por uno, click-to-chat). */
function RecipientRow({
  recipient,
  onSent,
}: {
  recipient: MessageRecipient;
  onSent?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  function send() {
    if (!recipient.waPhone) return;
    window.open(waHref(recipient.waPhone, recipient.message), "_blank", "noopener,noreferrer");
    setSent(true);
    if (onSent) startTransition(onSent);
  }

  return (
    <div className="rounded-2xl border border-jaguar-ink/8">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3.5">
        <Avatar initials={initialsOf(recipient.playerName)} size={38} />
        <div className="min-w-[160px] flex-1">
          <p className="text-[13px] lg:text-[14px] font-semibold text-jaguar-ink">{recipient.playerName}</p>
          <p className="text-[11.5px] lg:text-[12.5px] text-jaguar-ink/45">{recipient.meta}</p>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11.5px] font-semibold text-jaguar-ink/50 hover:bg-jaguar-ink/[0.04]"
        >
          Ver mensaje
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} strokeWidth={2} aria-hidden />
        </button>

        {!recipient.waPhone ? (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-jaguar-maroon-500/10 px-3 py-1.5 text-[11.5px] font-semibold text-jaguar-maroon-600">
            <AlertTriangle className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            Sin teléfono
          </span>
        ) : (
          <button
            type="button"
            onClick={send}
            disabled={sent || isPending}
            className={`ml-auto inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[12px] lg:text-[13px] font-semibold transition-colors ${
              sent ? "bg-jaguar-green-50 text-jaguar-green-700" : "bg-[#25D366] text-white hover:opacity-90"
            }`}
          >
            <MessageCircle className="h-3.5 w-3.5" strokeWidth={2.1} aria-hidden />
            {sent ? "Enviado" : "Enviar por WhatsApp"}
          </button>
        )}
      </div>
      {open ? (
        <div className="border-t border-jaguar-ink/8 bg-jaguar-mist/40 px-4 py-3.5">
          <p className="whitespace-pre-line text-[12.5px] leading-relaxed text-jaguar-ink/70">{recipient.message}</p>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Fila de candidato de reemplazo — un solo botón hace las dos cosas que pidió
 * el club: confirma al jugador en la convocatoria real del partido (aparece
 * en la programación) y abre WhatsApp con el aviso, ya en un solo clic.
 */
function ReplacementCandidateRow({ matchId, recipient }: { matchId: string; recipient: MessageRecipient }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "pending" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function confirmAndSend() {
    if (!recipient.waPhone || status === "pending" || status === "done") return;
    setStatus("pending");
    setErrorMsg(null);
    (async () => {
      const result = await addReplacementToCallup(matchId, recipient.playerId);
      if (result.error) {
        setStatus("error");
        setErrorMsg(result.error);
        return;
      }
      window.open(waHref(recipient.waPhone!, recipient.message), "_blank", "noopener,noreferrer");
      setStatus("done");
      router.refresh();
    })();
  }

  return (
    <div className="rounded-2xl border border-jaguar-ink/8">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3.5">
        <Avatar initials={initialsOf(recipient.playerName)} size={38} />
        <div className="min-w-[160px] flex-1">
          <p className="text-[13px] lg:text-[14px] font-semibold text-jaguar-ink">{recipient.playerName}</p>
          <p className="text-[11.5px] lg:text-[12.5px] text-jaguar-ink/45">{recipient.meta}</p>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11.5px] font-semibold text-jaguar-ink/50 hover:bg-jaguar-ink/[0.04]"
        >
          Ver mensaje
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} strokeWidth={2} aria-hidden />
        </button>

        {!recipient.waPhone ? (
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-jaguar-maroon-500/10 px-3 py-1.5 text-[11.5px] font-semibold text-jaguar-maroon-600">
            <AlertTriangle className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            Sin teléfono
          </span>
        ) : (
          <button
            type="button"
            onClick={confirmAndSend}
            disabled={status === "pending" || status === "done"}
            className={`ml-auto inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[12px] lg:text-[13px] font-semibold transition-colors ${
              status === "done" ? "bg-jaguar-green-50 text-jaguar-green-700" : "bg-[#25D366] text-white hover:opacity-90 disabled:opacity-60"
            }`}
          >
            {status === "done" ? <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.1} aria-hidden /> : <UserPlus className="h-3.5 w-3.5" strokeWidth={2.1} aria-hidden />}
            {status === "done" ? "Agregado y enviado" : status === "pending" ? "Agregando…" : "Agregar a convocatoria y enviar"}
          </button>
        )}
      </div>
      {errorMsg ? (
        <p className="border-t border-jaguar-ink/8 bg-jaguar-maroon-500/8 px-4 py-2.5 text-[12px] font-medium text-jaguar-maroon-700">{errorMsg}</p>
      ) : null}
      {open ? (
        <div className="border-t border-jaguar-ink/8 bg-jaguar-mist/40 px-4 py-3.5">
          <p className="whitespace-pre-line text-[12.5px] leading-relaxed text-jaguar-ink/70">{recipient.message}</p>
        </div>
      ) : null}
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      <MessageCircle className="h-6 w-6 text-jaguar-ink/20" strokeWidth={1.6} aria-hidden />
      <p className="mt-2 text-[12.5px] lg:text-[13.5px] text-jaguar-ink/45">{label}</p>
    </div>
  );
}

export function MensajesShell({
  category,
  debtors,
  cutoffRecipients,
  absentees,
  replacementGroups,
  playersByCategory,
}: {
  category: Category;
  debtors: MessageRecipient[];
  cutoffRecipients: MessageRecipient[];
  absentees: MessageRecipient[];
  replacementGroups: MatchReplacementGroup[];
  playersByCategory: Record<Category, MessageRecipient[]>;
}) {
  const [tab, setTab] = useState<TabId>("deudores");
  const [showCutoff, setShowCutoff] = useState(false);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-2 text-[12.5px] lg:text-[13.5px] font-semibold transition-colors ${
              tab === t.id ? "bg-jaguar-green-600 text-white" : "bg-jaguar-ink/[0.04] text-jaguar-ink/60 hover:bg-jaguar-ink/[0.07]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <p className="flex items-center gap-2 text-[12px] lg:text-[12.5px] text-jaguar-ink/45">
        <Send className="h-3.5 w-3.5 shrink-0" strokeWidth={1.8} aria-hidden />
        WhatsApp no permite envío automático masivo — cada botón abre el chat de ese acudiente con el mensaje ya escrito, listo para dar enviar.
      </p>

      {tab === "deudores" ? (
        <div className="space-y-5">
          <Card className="pb-4">
            <CardHeader
              title={`Fecha de corte del mes — ${category}`}
              subtitle="Aviso general a TODOS los jugadores activos, tengan o no un cobro pendiente registrado"
              action={
                <button
                  type="button"
                  onClick={() => setShowCutoff((v) => !v)}
                  className="flex items-center gap-1.5 rounded-xl border border-jaguar-ink/10 px-3.5 py-2 text-[12.5px] font-semibold text-jaguar-ink/65 hover:bg-jaguar-ink/[0.03]"
                >
                  <CalendarClock className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                  {showCutoff ? "Ocultar lista" : `Ver ${cutoffRecipients.length} familias`}
                </button>
              }
            />
            {showCutoff ? (
              cutoffRecipients.length === 0 ? (
                <EmptyState label="No hay jugadores activos en esta categoría." />
              ) : (
                <div className="mt-2 space-y-2.5 px-3">
                  {cutoffRecipients.map((r) => (
                    <RecipientRow key={r.playerId} recipient={r} />
                  ))}
                </div>
              )
            ) : null}
          </Card>

          <Card className="pb-4">
            <CardHeader title={`Cuentas vencidas — ${category}`} subtitle="Recordatorio de pago personalizado por jugador" />
            {debtors.length === 0 ? (
              <EmptyState label="No hay cuentas vencidas en este momento." />
            ) : (
              <div className="mt-2 space-y-2.5 px-3">
                {debtors.map((d) => (
                  <RecipientRow
                    key={d.obligationId ?? d.playerId}
                    recipient={d}
                    onSent={d.obligationId ? () => enviarRecordatorios([d.obligationId!]) : undefined}
                  />
                ))}
              </div>
            )}
          </Card>
        </div>
      ) : null}

      {tab === "inasistencias" ? (
        <Card className="pb-4">
          <CardHeader title={`Faltas recientes — ${category}`} subtitle="Últimas dos semanas de entrenamientos" />
          {absentees.length === 0 ? (
            <EmptyState label="Nadie tiene faltas registradas en las últimas dos semanas." />
          ) : (
            <div className="mt-2 space-y-2.5 px-3">
              {absentees.map((a) => (
                <RecipientRow key={a.playerId} recipient={a} />
              ))}
            </div>
          )}
        </Card>
      ) : null}

      {tab === "reemplazo" ? (
        <div className="space-y-5">
          {replacementGroups.length === 0 ? (
            <Card className="pb-4">
              <EmptyState label="No hay bajas confirmadas en los próximos partidos." />
            </Card>
          ) : (
            replacementGroups.map((group) => (
              <Card key={group.matchId} className="pb-4">
                <CardHeader
                  title={`vs. ${group.opponent}`}
                  subtitle={`${group.matchDateLabel} · ${group.matchTimeLabel}${group.location ? ` · ${group.location}` : ""}`}
                />
                <div className="mx-3 mt-2 flex flex-wrap items-center gap-2 rounded-xl bg-jaguar-maroon-500/8 px-4 py-3">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-jaguar-maroon-600" strokeWidth={1.9} aria-hidden />
                  <p className="text-[12.5px] font-semibold text-jaguar-maroon-700">
                    Bajas: {group.withdrawn.map((w) => `${w.playerName} (${w.callStatus})`).join(", ")}
                  </p>
                </div>
                <p className="mx-3 mt-2.5 text-[11.5px] lg:text-[12.5px] text-jaguar-ink/45">
                  &ldquo;Agregar a convocatoria y enviar&rdquo; confirma al jugador directamente en la convocatoria de
                  este partido (aparece en la programación) y le manda el WhatsApp, en un solo clic — no hace falta
                  volver a Partidos ni reenviarle a los demás convocados.
                </p>
                <div className="mt-3 space-y-2.5 px-3">
                  {group.candidates.length === 0 ? (
                    <EmptyState label="No hay jugadores disponibles sin convocar en este plantel." />
                  ) : (
                    group.candidates.map((c) => <ReplacementCandidateRow key={c.playerId} matchId={group.matchId} recipient={c} />)
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      ) : null}

      {tab === "general" ? <AvisoGeneralTab defaultCategory={category} playersByCategory={playersByCategory} /> : null}
    </div>
  );
}

interface PresetTemplate {
  id: string;
  label: string;
  text: string;
}

const presetTemplates: PresetTemplate[] = [
  {
    id: "lluvia",
    label: "No hay entrenamiento (lluvia)",
    text: "*ACADEMIA JAGUARES DE CÓRDOBA*\n*Aviso importante*\n\nHola {acudiente}, te informamos que HOY no habrá entrenamiento de {nombre} por lluvia.\n\nApenas tengamos la reprogramación te avisamos por este medio.\n\n¡Gracias por tu comprensión!",
  },
  {
    id: "cancelacion",
    label: "Entrenamiento cancelado",
    text: "*ACADEMIA JAGUARES DE CÓRDOBA*\n*Aviso importante*\n\nHola {acudiente}, te informamos que el entrenamiento de {nombre} queda CANCELADO.\n\nCualquier duda, escríbenos por este medio.\n\n¡Gracias!",
  },
  {
    id: "horario",
    label: "Cambio de horario",
    text: "*ACADEMIA JAGUARES DE CÓRDOBA*\n*Aviso importante*\n\nHola {acudiente}, te informamos que hay un cambio de horario para {nombre}. Te contamos el detalle:\n\n[nueva fecha/hora]\n\n¡Gracias por tu comprensión!",
  },
  {
    id: "libre",
    label: "Mensaje personalizado",
    text: "*ACADEMIA JAGUARES DE CÓRDOBA*\n\nHola {acudiente}, te escribimos de Jaguares de Córdoba sobre {nombre}.\n\n",
  },
];

/** Aviso general: elige plantilla + categorías destino, personaliza el texto y selecciona destinatarios. */
function AvisoGeneralTab({
  defaultCategory,
  playersByCategory,
}: {
  defaultCategory: Category;
  playersByCategory: Record<Category, MessageRecipient[]>;
}) {
  const [templateId, setTemplateId] = useState(presetTemplates[0]!.id);
  const [template, setTemplate] = useState(presetTemplates[0]!.text);
  const [selectedCategories, setSelectedCategories] = useState<Set<Category>>(new Set([defaultCategory]));
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const players = useMemo(() => {
    const list = categories.filter((c) => selectedCategories.has(c)).flatMap((c) => playersByCategory[c] ?? []);
    return list;
  }, [selectedCategories, playersByCategory]);

  const allSelected = players.length > 0 && players.every((p) => selected.has(p.playerId));

  function toggleCategory(c: Category) {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(players.map((p) => p.playerId)));
  }

  function applyTemplate(id: string) {
    setTemplateId(id);
    const preset = presetTemplates.find((t) => t.id === id);
    if (preset) setTemplate(preset.text);
  }

  const recipients = useMemo(
    () =>
      players
        .filter((p) => selected.has(p.playerId))
        .map((p) => ({
          ...p,
          message: template.replaceAll("{nombre}", p.playerName).replaceAll("{acudiente}", p.guardianName),
        })),
    [players, selected, template],
  );

  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-jaguar-turquoise-500/10 text-jaguar-turquoise-600">
          <MessageCircle className="h-4.5 w-4.5" strokeWidth={1.9} aria-hidden />
        </span>
        <div>
          <p className="text-[13.5px] lg:text-[15px] font-bold text-jaguar-ink">Aviso general</p>
          <p className="text-[12px] lg:text-[13px] text-jaguar-ink/50">
            Elige a qué categorías avisar, una plantilla y ajusta el texto — usa{" "}
            <code className="rounded bg-jaguar-ink/[0.06] px-1">{"{nombre}"}</code> y{" "}
            <code className="rounded bg-jaguar-ink/[0.06] px-1">{"{acudiente}"}</code> para personalizar.
          </p>
        </div>
      </div>

      <p className="mt-5 text-[12px] font-bold uppercase tracking-[0.06em] text-jaguar-ink/45">Categorías</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => toggleCategory(c)}
            className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors ${
              selectedCategories.has(c) ? "bg-jaguar-green-600 text-white" : "bg-jaguar-ink/[0.05] text-jaguar-ink/55 hover:bg-jaguar-ink/[0.08]"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <p className="mt-5 text-[12px] font-bold uppercase tracking-[0.06em] text-jaguar-ink/45">Plantilla</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {presetTemplates.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => applyTemplate(t.id)}
            className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors ${
              templateId === t.id ? "bg-jaguar-ink text-white" : "bg-jaguar-ink/[0.05] text-jaguar-ink/55 hover:bg-jaguar-ink/[0.08]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <textarea
        value={template}
        onChange={(e) => setTemplate(e.target.value)}
        rows={6}
        className="mt-4 w-full rounded-xl border border-jaguar-ink/10 bg-white px-3.5 py-3 text-[13px] leading-relaxed text-jaguar-ink focus:border-jaguar-green-500/50 focus:outline-none"
      />

      <div className="mt-4 flex items-center justify-between">
        <p className="text-[12px] font-bold uppercase tracking-[0.06em] text-jaguar-ink/45">
          Destinatarios ({selected.size} de {players.length})
        </p>
        <button type="button" onClick={toggleAll} className="text-[11.5px] font-semibold text-jaguar-green-700 hover:underline">
          {allSelected ? "Ninguno" : "Todos"}
        </button>
      </div>
      <div className="mt-2 max-h-64 space-y-1.5 overflow-y-auto pr-1">
        {players.length === 0 ? (
          <p className="px-2.5 py-3 text-[12.5px] text-jaguar-ink/40">Selecciona al menos una categoría con plantel activo.</p>
        ) : (
          players.map((p) => (
            <label
              key={p.playerId}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[12.5px] text-jaguar-ink/75 hover:bg-jaguar-ink/[0.03]"
            >
              <input
                type="checkbox"
                checked={selected.has(p.playerId)}
                onChange={() => toggle(p.playerId)}
                className="h-3.5 w-3.5 rounded border-jaguar-ink/20 text-jaguar-green-600 focus:ring-jaguar-green-500"
              />
              {p.playerName} <span className="text-jaguar-ink/40">— {p.guardianName}</span>
            </label>
          ))
        )}
      </div>

      {recipients.length > 0 ? (
        <div className="mt-5 space-y-2.5 border-t border-jaguar-ink/8 pt-4">
          {recipients.map((r) => (
            <RecipientRow key={r.playerId} recipient={r} />
          ))}
        </div>
      ) : null}
    </Card>
  );
}
