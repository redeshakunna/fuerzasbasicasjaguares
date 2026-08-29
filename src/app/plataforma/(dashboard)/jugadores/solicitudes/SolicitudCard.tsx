"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Calendar, Check, ChevronDown, Loader2, Phone, X } from "lucide-react";
import { approveRegistrationRequest, rejectRegistrationRequest } from "./actions";
import { calculateAge } from "@/lib/data/players-stats";
import type { RegistrationRequest } from "@/lib/data/registration-requests";

interface SolicitudCardProps {
  request: RegistrationRequest;
  reviewable: boolean;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

function DetailRow({ label, value }: { label: string; value: string | number | null }) {
  if (value === null || value === "") return null;
  return (
    <div>
      <p className="text-[11px] lg:text-[11.5px] font-semibold uppercase tracking-[0.03em] text-jaguar-ink/40">
        {label}
      </p>
      <p className="mt-0.5 text-[13px] lg:text-[13.5px] text-jaguar-ink">{value}</p>
    </div>
  );
}

/** Tarjeta de una solicitud de inscripción — resumen + detalle expandible + acciones de aprobar/rechazar. */
export function SolicitudCard({ request, reviewable }: SolicitudCardProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [mode, setMode] = useState<"idle" | "approve" | "reject">("idle");
  const [jerseyValue, setJerseyValue] = useState(
    request.requested_jersey_number ? String(request.requested_jersey_number) : ""
  );
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resolved, setResolved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const fullName = `${request.first_name} ${request.last_name}`.trim();
  const age = calculateAge(request.birth_date);

  function onApprove() {
    setError(null);
    startTransition(async () => {
      const jerseyNumber = jerseyValue ? Number(jerseyValue) : null;
      const result = await approveRegistrationRequest(request.id, jerseyNumber);
      if (result.error) {
        setError(result.error);
        return;
      }
      setResolved(true);
      router.refresh();
    });
  }

  function onReject() {
    setError(null);
    startTransition(async () => {
      const result = await rejectRegistrationRequest(request.id, note);
      if (result.error) {
        setError(result.error);
        return;
      }
      setResolved(true);
      router.refresh();
    });
  }

  if (resolved) return null;

  return (
    <div className="overflow-hidden rounded-[16px] border border-jaguar-ink/8 bg-white shadow-[0_1px_2px_rgba(13,18,16,0.04)]">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left"
      >
        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-jaguar-mist">
          <Image
            src={request.photo_url || "/brand/default-avatar.png"}
            alt={fullName}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] lg:text-[15px] font-bold text-jaguar-ink">{fullName}</p>
          <p className="mt-0.5 text-[12px] lg:text-[12.5px] text-jaguar-ink/50">
            {request.position} · {age} años · Sub-15
          </p>
        </div>
        <div className="hidden items-center gap-1.5 text-[12px] text-jaguar-ink/40 sm:flex">
          <Calendar className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          {formatDate(request.submitted_at)}
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-jaguar-ink/35 transition-transform ${expanded ? "rotate-180" : ""}`}
          strokeWidth={2}
          aria-hidden
        />
      </button>

      {expanded ? (
        <div className="border-t border-jaguar-ink/6 px-4 py-4">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 lg:grid-cols-3">
            <DetailRow label="Apodo" value={request.nickname} />
            <DetailRow label="Fecha de nacimiento" value={formatDate(request.birth_date)} />
            <DetailRow label="Documento" value={request.document_type ? `${request.document_type} ${request.document_number ?? ""}` : null} />
            <DetailRow label="Lugar de nacimiento" value={request.birth_place} />
            <DetailRow label="Lugar de residencia" value={request.residence_place} />
            <DetailRow label="Dirección" value={request.address} />
            <DetailRow label="Colegio" value={request.school_name} />
            <DetailRow label="Grado" value={request.school_grade} />
            <DetailRow label="Teléfono jugador" value={request.phone} />
            <DetailRow label="Acudiente" value={request.guardian_name} />
            <DetailRow label="Parentesco" value={request.guardian_relationship} />
            <DetailRow label="Teléfono acudiente" value={request.guardian_phone} />
            <DetailRow label="Correo acudiente" value={request.guardian_email} />
            <DetailRow label="Contacto de emergencia" value={request.emergency_contact_name} />
            <DetailRow label="Teléfono de emergencia" value={request.emergency_contact_phone} />
            <DetailRow label="Pie hábil" value={request.dominant_foot} />
            <DetailRow label="Número sugerido" value={request.requested_jersey_number} />
            <DetailRow label="Altura" value={request.height_cm ? `${request.height_cm} cm` : null} />
            <DetailRow label="Peso" value={request.weight_kg ? `${request.weight_kg} kg` : null} />
            <DetailRow label="Club anterior" value={request.previous_club} />
            <DetailRow label="Años jugando" value={request.years_playing} />
            <DetailRow label="EPS" value={request.eps_name} />
            <DetailRow label="Tipo de sangre" value={request.blood_type} />
            <DetailRow label="Alergias" value={request.allergies} />
          </div>
          {request.medical_conditions ? (
            <div className="mt-3">
              <DetailRow label="Condiciones médicas" value={request.medical_conditions} />
            </div>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-jaguar-ink/45">
            <span className="flex items-center gap-1.5">
              <Check className={`h-3.5 w-3.5 ${request.medical_authorization ? "text-jaguar-green-600" : "text-jaguar-ink/20"}`} strokeWidth={2.5} />
              Autorización médica
            </span>
            <span className="flex items-center gap-1.5">
              <Check className={`h-3.5 w-3.5 ${request.image_authorization ? "text-jaguar-green-600" : "text-jaguar-ink/20"}`} strokeWidth={2.5} />
              Autorización de imagen
            </span>
            {request.guardian_phone ? (
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" strokeWidth={2} />
                {request.guardian_phone}
              </span>
            ) : null}
          </div>

          {request.request_status === "Rechazado" && request.review_note ? (
            <p className="mt-3 rounded-lg bg-jaguar-maroon-500/8 px-3 py-2 text-[12.5px] text-jaguar-maroon-600">
              Nota de rechazo: {request.review_note}
            </p>
          ) : null}

          {reviewable ? (
            <div className="mt-4 border-t border-jaguar-ink/6 pt-4">
              {mode === "idle" ? (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setMode("approve")}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-jaguar-green-600 px-3.5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-jaguar-green-700"
                  >
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                    Aprobar
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("reject")}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-jaguar-maroon-500/30 px-3.5 py-2 text-[13px] font-semibold text-jaguar-maroon-600 transition-colors hover:bg-jaguar-maroon-500/8"
                  >
                    <X className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                    Rechazar
                  </button>
                </div>
              ) : mode === "approve" ? (
                <div className="space-y-2.5">
                  <label className="block text-[12.5px] font-semibold text-jaguar-ink/70">
                    Número de camiseta definitivo
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={jerseyValue}
                    onChange={(e) => setJerseyValue(e.target.value)}
                    placeholder="Ej. 10 (opcional)"
                    className="w-40 rounded-xl border border-jaguar-ink/10 bg-jaguar-mist/40 px-3 py-2 text-[13.5px] text-jaguar-ink focus:border-jaguar-green-500/40 focus:outline-none focus:ring-2 focus:ring-jaguar-green-500/10"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={onApprove}
                      className="flex items-center gap-1.5 rounded-xl bg-jaguar-green-600 px-3.5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-jaguar-green-700 disabled:opacity-60"
                    >
                      {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2.5} /> : null}
                      Confirmar y crear jugador
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode("idle")}
                      className="rounded-xl px-3.5 py-2 text-[13px] font-semibold text-jaguar-ink/50 hover:bg-jaguar-ink/[0.04]"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <label className="block text-[12.5px] font-semibold text-jaguar-ink/70">
                    Nota para el jugador/acudiente (opcional)
                  </label>
                  <textarea
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ej. Cupo completo por ahora, vuelve a intentar la próxima temporada."
                    className="w-full rounded-xl border border-jaguar-ink/10 bg-jaguar-mist/40 px-3 py-2 text-[13.5px] text-jaguar-ink focus:border-jaguar-green-500/40 focus:outline-none focus:ring-2 focus:ring-jaguar-green-500/10"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={onReject}
                      className="flex items-center gap-1.5 rounded-xl bg-jaguar-maroon-600 px-3.5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-jaguar-maroon-700 disabled:opacity-60"
                    >
                      {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2.5} /> : null}
                      Confirmar rechazo
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode("idle")}
                      className="rounded-xl px-3.5 py-2 text-[13px] font-semibold text-jaguar-ink/50 hover:bg-jaguar-ink/[0.04]"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
              {error ? <p className="mt-2 text-[12.5px] font-medium text-jaguar-maroon-600">{error}</p> : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
