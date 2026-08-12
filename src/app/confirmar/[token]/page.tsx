import Image from "next/image";
import type { Metadata } from "next";
import { lookupRsvp } from "@/lib/data/match-rsvp";
import { RsvpConfirmClient } from "@/components/rsvp/RsvpConfirmClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Confirmar asistencia — Fuerzas Básicas Jaguares de Córdoba",
};

interface ConfirmarPageProps {
  params: Promise<{ token: string }>;
}

/**
 * Página pública (sin login) — el jugador llega desde su link personal de WhatsApp
 * y confirma en un toque si va a asistir al partido. Fuera de /plataforma a propósito:
 * no requiere sesión ni chrome de dashboard.
 */
export default async function ConfirmarPage({ params }: ConfirmarPageProps) {
  const { token } = await params;
  const info = await lookupRsvp(token);

  return (
    <div className="flex min-h-screen items-center justify-center bg-jaguar-mist/60 px-6 py-12">
      <div className="w-full max-w-[420px]">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/brand/logo-fuerzas-basicas.png"
            alt="Fuerzas Básicas de Jaguares de Córdoba"
            width={64}
            height={78}
            className="h-16 w-auto object-contain"
          />
          <p className="mt-3 text-[11.5px] font-bold uppercase tracking-[0.08em] text-jaguar-green-600">
            Fuerzas Básicas Jaguares de Córdoba
          </p>
        </div>

        <div className="mt-6 rounded-[22px] border border-jaguar-ink/8 bg-white p-6 shadow-[0_1px_2px_rgba(13,18,16,0.04)] sm:p-7">
          {!info ? (
            <div className="py-6 text-center">
              <p className="text-[15px] font-bold text-jaguar-ink">Este enlace no es válido</p>
              <p className="mt-1.5 text-[13px] text-jaguar-ink/50">
                Puede que ya haya expirado o esté mal copiado. Habla con tu técnico si necesitas otro.
              </p>
            </div>
          ) : (
            <RsvpConfirmClient token={token} info={info} />
          )}
        </div>

        <p className="mt-5 text-center text-[12px] text-jaguar-ink/40">Formación de futbolistas y personas.</p>
      </div>
    </div>
  );
}
