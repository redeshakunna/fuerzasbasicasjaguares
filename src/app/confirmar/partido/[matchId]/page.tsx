import Image from "next/image";
import type { Metadata } from "next";
import { getRsvpMatchRoster } from "@/lib/data/match-rsvp";
import { RsvpRosterClient } from "@/components/rsvp/RsvpRosterClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Confirmar asistencia — Fuerzas Básicas Jaguares de Córdoba",
};

interface ConfirmarPartidoPageProps {
  params: Promise<{ matchId: string }>;
}

/**
 * Página pública (sin login) — un solo link para toda la convocatoria. El jugador
 * toca su propio nombre en la lista en vez de recibir un link personal, así el
 * técnico solo comparte un link en el mensaje de WhatsApp.
 */
export default async function ConfirmarPartidoPage({ params }: ConfirmarPartidoPageProps) {
  const { matchId } = await params;
  const roster = await getRsvpMatchRoster(matchId);

  return (
    <div className="flex min-h-screen items-center justify-center bg-jaguar-mist/60 px-6 py-12">
      <div className="w-full max-w-[440px]">
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
          {roster.roster.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-[15px] font-bold text-jaguar-ink">Todavía no hay convocatoria</p>
              <p className="mt-1.5 text-[13px] text-jaguar-ink/50">
                Este link no tiene jugadores convocados todavía. Habla con tu técnico.
              </p>
            </div>
          ) : (
            <RsvpRosterClient matchId={matchId} roster={roster} />
          )}
        </div>

        <p className="mt-5 text-center text-[12px] text-jaguar-ink/40">Formación de futbolistas y personas.</p>
      </div>
    </div>
  );
}
