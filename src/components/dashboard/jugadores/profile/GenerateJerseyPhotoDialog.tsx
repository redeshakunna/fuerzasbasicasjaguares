"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Loader2, Shirt, Upload, X } from "lucide-react";
import {
  generateJerseyPhoto,
  type GenerateJerseyPhotoState,
} from "@/app/plataforma/(dashboard)/jugadores/jersey-photo-actions";
import { getFullName } from "@/lib/data/players-stats";
import type { Tables } from "@/lib/supabase/database.types";

type PlayerRow = Tables<"players">;

const initialState: GenerateJerseyPhotoState = {};
const MAX_PHOTO_BYTES = 8 * 1024 * 1024;

/**
 * Dialog admin-only — sube una foto tipo carnet del jugador y la compone
 * automáticamente sobre la plantilla oficial de camiseta (campo o portero,
 * según su posición). El resultado reemplaza la foto que se ve en el
 * perfil y en la hoja de vida (queda guardado aparte, sin tocar la foto
 * original del jugador).
 */
export function GenerateJerseyPhotoDialog({ player, onClose }: { player: PlayerRow; onClose: () => void }) {
  const generateForPlayer = generateJerseyPhoto.bind(null, player.id);
  const [state, formAction, isPending] = useActionState(generateForPlayer, initialState);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const templateLabel = player.position_group === "Arquero" ? "camiseta de portero" : "camiseta de campo";

  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(onClose, 1400);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && file.size > MAX_PHOTO_BYTES) {
      setFileError("La foto pesa más de 8 MB. Usa una imagen más liviana.");
      e.target.value = "";
      setPreview(null);
      return;
    }
    setFileError(null);
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-jaguar-ink/40 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-[440px] flex-col rounded-[18px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-jaguar-ink/6 px-6 py-5">
          <div>
            <h2 className="text-[17px] lg:text-[18.5px] font-extrabold text-jaguar-ink">Generar foto con camiseta</h2>
            <p className="mt-0.5 text-[13px] lg:text-[14px] text-jaguar-ink/50">{getFullName(player)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-jaguar-ink/40 hover:bg-jaguar-ink/[0.05]"
          >
            <X className="h-4 w-4" strokeWidth={2} aria-hidden />
          </button>
        </div>

        {!player.image_authorization ? (
          <div className="px-6 py-6">
            <p className="rounded-xl bg-jaguar-gold-500/10 px-4 py-3 text-[13px] lg:text-[13.5px] font-medium text-jaguar-gold-700">
              Este jugador todavía no tiene activada la autorización de uso de imagen. Actívala desde &ldquo;Editar
              información&rdquo; antes de generar esta foto.
            </p>
          </div>
        ) : (
          <form action={formAction} className="px-6 py-5">
            <p className="text-[12.5px] lg:text-[13.5px] text-jaguar-ink/55">
              Sube una foto tipo carnet (rostro visible, de frente, buena luz). La montamos automáticamente sobre la{" "}
              <span className="font-semibold text-jaguar-ink">{templateLabel}</span> oficial de Jaguares. No reemplaza
              la foto original del jugador.
            </p>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="group relative mt-4 flex h-40 w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-jaguar-ink/15 bg-jaguar-mist/50 transition-colors hover:border-jaguar-green-500/40"
            >
              {preview ? (
                <Image src={preview} alt="Vista previa" fill className="object-cover" unoptimized />
              ) : (
                <span className="flex flex-col items-center gap-2 text-jaguar-ink/35">
                  <Upload className="h-6 w-6" strokeWidth={1.7} aria-hidden />
                  <span className="text-[12px] lg:text-[13px] font-semibold">Subir foto</span>
                </span>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              name="photo"
              accept="image/*"
              onChange={onFileChange}
              className="hidden"
            />
            {fileError ? <p className="mt-2 text-[12px] lg:text-[13px] font-medium text-jaguar-maroon-600">{fileError}</p> : null}
            {state.error ? <p className="mt-2 text-[12px] lg:text-[13px] font-medium text-jaguar-maroon-600">{state.error}</p> : null}
            {state.success ? (
              <p className="mt-2 text-[12px] lg:text-[13px] font-medium text-jaguar-green-700">
                Listo — la foto con camiseta ya está en el perfil.
              </p>
            ) : null}

            <div className="mt-5 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2.5 text-[13px] lg:text-[13.5px] font-semibold text-jaguar-ink/55 hover:bg-jaguar-ink/[0.05]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending || !preview}
                className="inline-flex items-center gap-1.5 rounded-xl bg-jaguar-green-600 px-4 py-2.5 text-[13px] lg:text-[13.5px] font-semibold text-white transition-colors hover:bg-jaguar-green-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.2} aria-hidden />
                ) : (
                  <Shirt className="h-4 w-4" strokeWidth={2} aria-hidden />
                )}
                {isPending ? "Generando…" : "Generar"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
