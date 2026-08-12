"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, ChevronLeft, ChevronRight, PartyPopper } from "lucide-react";
import { Card } from "../ui/Card";
import { Avatar } from "../ui/Avatar";
import { conceptIcon, conceptIconClass } from "./shared";
import { crearObligacion } from "@/app/plataforma/(dashboard)/finanzas/actions";
import type { ConceptRow } from "@/lib/data/finance";
import { formatCOP, formatLongDate } from "@/lib/finance/format";

const steps = [
  { id: 1, label: "Jugador" },
  { id: 2, label: "Concepto" },
  { id: 3, label: "Valor" },
  { id: 4, label: "Confirmación" },
] as const;

interface PlayerOption {
  id: string;
  name: string;
  initials: string;
  category: string;
  jerseyNumber: number | null;
}

function defaultDueDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 10);
  return d.toISOString().slice(0, 10);
}

/** Wizard de 4 pasos — crea un concepto de cobro real vía Server Action. */
export function NuevoCobroWizard({ concepts, players }: { concepts: ConceptRow[]; players: PlayerOption[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(1);
  const [player, setPlayer] = useState<PlayerOption | null>(players[0] ?? null);
  const [concept, setConcept] = useState<ConceptRow | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [dueDate, setDueDate] = useState(defaultDueDate());
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function selectConcept(c: ConceptRow) {
    setConcept(c);
    setAmount(c.suggestedAmount > 0 ? String(c.suggestedAmount) : "");
  }

  function confirm() {
    if (!player || !concept) return;
    setError(null);
    startTransition(async () => {
      const result = await crearObligacion({
        playerId: player.id,
        conceptId: concept.id,
        title: `${concept.name} — ${formatLongDate(dueDate)}`,
        amount: Number(amount) || 0,
        dueDate,
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      setDone(true);
      router.refresh();
    });
  }

  if (players.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-2 p-14 text-center">
        <p className="text-[13.5px] lg:text-[15px] font-bold text-jaguar-ink">Aún no hay jugadores registrados.</p>
      </Card>
    );
  }

  if (done && concept) {
    return (
      <Card className="flex flex-col items-center gap-3 p-14 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-jaguar-green-50 text-jaguar-green-600">
          <PartyPopper className="h-6 w-6" strokeWidth={1.8} aria-hidden />
        </span>
        <p className="text-[16px] lg:text-[17.5px] font-bold text-jaguar-ink">Concepto de cobro creado</p>
        <p className="max-w-sm text-[13px] lg:text-[14px] text-jaguar-ink/50">
          {concept.name} para {player?.name} por {formatCOP(Number(amount) || 0)}, con vencimiento el {formatLongDate(dueDate)}.
        </p>
        <div className="mt-2 flex gap-2">
          <Link
            href="/plataforma/finanzas/cuentas-por-cobrar"
            className="rounded-xl bg-jaguar-green-600 px-4 py-2.5 text-[13px] lg:text-[14px] font-semibold text-white transition-colors hover:bg-jaguar-green-700"
          >
            Ver cuentas por cobrar
          </Link>
          <button
            type="button"
            onClick={() => {
              setDone(false);
              setStep(1);
              setConcept(null);
              setAmount("");
            }}
            className="rounded-xl border border-jaguar-ink/10 px-4 py-2.5 text-[13px] lg:text-[14px] font-semibold text-jaguar-ink/70 transition-colors hover:bg-jaguar-ink/[0.03]"
          >
            Crear otro cobro
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        {steps.map((s, i) => (
          <div key={s.id} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-[12.5px] lg:text-[13.5px] font-bold transition-colors ${
                  step >= s.id ? "bg-jaguar-green-600 text-white" : "bg-jaguar-ink/6 text-jaguar-ink/35"
                }`}
              >
                {step > s.id ? <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden /> : s.id}
              </span>
              <span className={`text-[11px] lg:text-[12px] font-semibold ${step >= s.id ? "text-jaguar-ink" : "text-jaguar-ink/35"}`}>{s.label}</span>
            </div>
            {i < steps.length - 1 ? (
              <div className={`mx-2 h-px flex-1 ${step > s.id ? "bg-jaguar-green-600" : "bg-jaguar-ink/10"}`} />
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-8 min-h-[260px]">
        {step === 1 ? (
          <div>
            <p className="text-[14px] lg:text-[15.5px] font-bold text-jaguar-ink">Selecciona el jugador</p>
            <p className="mt-1 text-[12.5px] lg:text-[13.5px] text-jaguar-ink/45">La academia tiene {players.length} jugador{players.length === 1 ? "" : "es"} en esta categoría.</p>
            <div className="mt-4 space-y-2">
              {players.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setPlayer(p);
                    setStep(2);
                  }}
                  className={`flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-colors ${
                    player?.id === p.id ? "border-jaguar-green-600 bg-jaguar-green-50/40" : "border-jaguar-ink/8 hover:bg-jaguar-mist/40"
                  }`}
                >
                  <Avatar initials={p.initials} size={48} />
                  <div className="flex-1">
                    <p className="text-[14px] lg:text-[15.5px] font-bold text-jaguar-ink">{p.name}</p>
                    <p className="text-[12.5px] lg:text-[13.5px] text-jaguar-ink/50">
                      {p.category}
                      {p.jerseyNumber ? ` · #${p.jerseyNumber}` : ""}
                    </p>
                  </div>
                  {player?.id === p.id ? (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-jaguar-green-600 text-white">
                      <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div>
            <p className="text-[14px] lg:text-[15.5px] font-bold text-jaguar-ink">Selecciona el concepto</p>
            <p className="mt-1 text-[12.5px] lg:text-[13.5px] text-jaguar-ink/45">Elige qué tipo de cobro vas a generar.</p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {concepts.map((c) => {
                const Icon = conceptIcon(c.name);
                const selected = concept?.id === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => selectConcept(c)}
                    className={`flex flex-col items-start gap-2 rounded-2xl border-2 p-4 text-left transition-colors ${
                      selected ? "border-jaguar-green-600 bg-jaguar-green-50/40" : "border-jaguar-ink/8 hover:bg-jaguar-mist/40"
                    }`}
                  >
                    <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${conceptIconClass(c.name)}`}>
                      <Icon className="h-4 w-4" strokeWidth={1.9} aria-hidden />
                    </span>
                    <p className="text-[13px] lg:text-[14px] font-bold text-jaguar-ink">{c.name}</p>
                    <p className="text-[11px] lg:text-[12px] text-jaguar-ink/45">{c.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="max-w-sm">
            <p className="text-[14px] lg:text-[15.5px] font-bold text-jaguar-ink">Define el valor</p>
            <p className="mt-1 text-[12.5px] lg:text-[13.5px] text-jaguar-ink/45">Puedes ajustar el monto sugerido para {concept?.name}.</p>
            <label className="mt-4 block">
              <span className="text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-ink/60">Valor a cobrar</span>
              <div className="relative mt-1.5">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[13.5px] lg:text-[15px] text-jaguar-ink/40">$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-xl border border-jaguar-ink/10 bg-jaguar-mist/50 py-2.5 pl-8 pr-4 text-[14px] lg:text-[15.5px] font-semibold text-jaguar-ink focus:border-jaguar-green-500/40 focus:outline-none focus:ring-2 focus:ring-jaguar-green-500/10"
                />
              </div>
            </label>
            <label className="mt-4 block">
              <span className="text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-ink/60">Fecha de vencimiento</span>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-jaguar-ink/10 bg-jaguar-mist/50 py-2.5 px-3.5 text-[13.5px] lg:text-[15px] text-jaguar-ink focus:border-jaguar-green-500/40 focus:outline-none focus:ring-2 focus:ring-jaguar-green-500/10"
              />
            </label>
          </div>
        ) : null}

        {step === 4 && concept && player ? (
          <div className="max-w-md">
            <p className="text-[14px] lg:text-[15.5px] font-bold text-jaguar-ink">Confirma el cobro</p>
            <div className="mt-4 space-y-3 rounded-2xl bg-jaguar-mist/50 p-4">
              <div className="flex items-center justify-between text-[13px] lg:text-[14px]">
                <span className="text-jaguar-ink/50">Jugador</span>
                <span className="font-semibold text-jaguar-ink">{player.name}</span>
              </div>
              <div className="flex items-center justify-between text-[13px] lg:text-[14px]">
                <span className="text-jaguar-ink/50">Concepto</span>
                <span className="font-semibold text-jaguar-ink">{concept.name}</span>
              </div>
              <div className="flex items-center justify-between text-[13px] lg:text-[14px]">
                <span className="text-jaguar-ink/50">Valor</span>
                <span className="font-semibold text-jaguar-ink">{formatCOP(Number(amount) || 0)}</span>
              </div>
              <div className="flex items-center justify-between text-[13px] lg:text-[14px]">
                <span className="text-jaguar-ink/50">Vence</span>
                <span className="font-semibold text-jaguar-ink">{formatLongDate(dueDate)}</span>
              </div>
            </div>
            {error ? <p className="mt-3 text-[12.5px] lg:text-[13.5px] font-medium text-jaguar-maroon-600">{error}</p> : null}
          </div>
        ) : null}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-jaguar-ink/6 pt-5">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1}
          className="inline-flex items-center gap-1 rounded-xl px-3.5 py-2 text-[13px] lg:text-[14px] font-semibold text-jaguar-ink/55 transition-colors hover:bg-jaguar-ink/[0.04] disabled:opacity-0"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2.25} aria-hidden />
          Atrás
        </button>
        {step < 4 ? (
          <button
            type="button"
            onClick={() => setStep((s) => Math.min(4, s + 1))}
            disabled={(step === 1 && !player) || (step === 2 && !concept) || (step === 3 && !amount)}
            className="inline-flex items-center gap-1 rounded-xl bg-jaguar-green-600 px-4 py-2.5 text-[13px] lg:text-[14px] font-semibold text-white transition-colors hover:bg-jaguar-green-700 disabled:opacity-40"
          >
            Continuar
            <ChevronRight className="h-4 w-4" strokeWidth={2.25} aria-hidden />
          </button>
        ) : (
          <button
            type="button"
            onClick={confirm}
            disabled={isPending}
            className="rounded-xl bg-jaguar-green-600 px-5 py-2.5 text-[13px] lg:text-[14px] font-semibold text-white transition-colors hover:bg-jaguar-green-700 disabled:opacity-60"
          >
            {isPending ? "Creando…" : "Crear concepto de cobro"}
          </button>
        )}
      </div>
    </Card>
  );
}
