"use client";

import { useState } from "react";
import Link from "next/link";
import { ClipboardPlus, FileUp, HeartPulse, MoreHorizontal, PencilLine, Send, Sparkles } from "lucide-react";
import { Card } from "../../ui/Card";
import { RegisterInjuryDialog } from "./RegisterInjuryDialog";
import { EditPlayerDialog } from "./EditPlayerDialog";
import type { Tables } from "@/lib/supabase/database.types";

type PlayerRow = Tables<"players">;

/** Normaliza un teléfono colombiano a dígitos con código de país, para wa.me. `null` si no hay nada usable. */
function waNumber(phone: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("57")) return digits;
  if (digits.length === 10) return `57${digits}`;
  return digits;
}

function switchTab(tabId: string) {
  window.dispatchEvent(new CustomEvent("profile:switch-tab", { detail: tabId }));
}

/** Acciones rápidas del perfil — cada botón dispara un flujo real (sin dummies). */
export function ProfileActionsBar({ player, playerFullName, isAdmin }: { player: PlayerRow; playerFullName: string; isAdmin: boolean }) {
  const [injuryDialogOpen, setInjuryDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const waTarget = waNumber(player.guardian_phone) ?? waNumber(player.phone);
  const waHref = waTarget ? `https://wa.me/${waTarget}` : null;

  return (
    <>
      <Card className="flex flex-wrap items-center gap-3 p-4">
        <Link
          href="/plataforma/evaluaciones"
          className="inline-flex items-center gap-2 rounded-xl border border-jaguar-ink/10 px-4 py-2.5 text-[13px] lg:text-[14px] font-semibold text-jaguar-ink/70 transition-colors hover:bg-jaguar-ink/[0.03]"
        >
          <ClipboardPlus className="h-4 w-4" strokeWidth={2} aria-hidden />
          Registrar evaluación
        </Link>

        <button
          type="button"
          onClick={() => setInjuryDialogOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-jaguar-ink/10 px-4 py-2.5 text-[13px] lg:text-[14px] font-semibold text-jaguar-ink/70 transition-colors hover:bg-jaguar-ink/[0.03]"
        >
          <HeartPulse className="h-4 w-4" strokeWidth={2} aria-hidden />
          Registrar lesión
        </button>

        <button
          type="button"
          onClick={() => switchTab("documentos")}
          className="inline-flex items-center gap-2 rounded-xl border border-jaguar-ink/10 px-4 py-2.5 text-[13px] lg:text-[14px] font-semibold text-jaguar-ink/70 transition-colors hover:bg-jaguar-ink/[0.03]"
        >
          <FileUp className="h-4 w-4" strokeWidth={2} aria-hidden />
          Subir documento
        </button>

        {waHref ? (
          <a
            href={waHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-jaguar-ink/10 px-4 py-2.5 text-[13px] lg:text-[14px] font-semibold text-jaguar-ink/70 transition-colors hover:bg-jaguar-ink/[0.03]"
          >
            <Send className="h-4 w-4" strokeWidth={2} aria-hidden />
            Enviar mensaje
          </a>
        ) : (
          <button
            type="button"
            disabled
            title="Este jugador no tiene teléfono ni de acudiente registrado"
            className="inline-flex items-center gap-2 rounded-xl border border-jaguar-ink/10 px-4 py-2.5 text-[13px] lg:text-[14px] font-semibold text-jaguar-ink/35 cursor-not-allowed"
          >
            <Send className="h-4 w-4" strokeWidth={2} aria-hidden />
            Enviar mensaje
          </button>
        )}

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-xl border border-jaguar-ink/10 px-4 py-2.5 text-[13px] lg:text-[14px] font-semibold text-jaguar-ink/70 transition-colors hover:bg-jaguar-ink/[0.03]"
          >
            <MoreHorizontal className="h-4 w-4" strokeWidth={2} aria-hidden />
            Más acciones
          </button>
          {menuOpen ? (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute left-0 top-full z-20 mt-2 w-[220px] rounded-2xl border border-jaguar-ink/10 bg-white p-1.5 shadow-xl">
                {isAdmin ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setEditDialogOpen(true);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold text-jaguar-ink/75 hover:bg-jaguar-ink/[0.04]"
                  >
                    <PencilLine className="h-4 w-4" strokeWidth={2} aria-hidden />
                    Editar información
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    switchTab("informes");
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold text-jaguar-ink/75 hover:bg-jaguar-ink/[0.04]"
                >
                  <Sparkles className="h-4 w-4" strokeWidth={2} aria-hidden />
                  Ir a Informes
                </button>
              </div>
            </>
          ) : null}
        </div>
      </Card>

      {injuryDialogOpen ? (
        <RegisterInjuryDialog playerId={player.id} playerName={playerFullName} onClose={() => setInjuryDialogOpen(false)} />
      ) : null}
      {editDialogOpen ? <EditPlayerDialog player={player} onClose={() => setEditDialogOpen(false)} /> : null}
    </>
  );
}
