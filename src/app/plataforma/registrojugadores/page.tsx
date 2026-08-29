import Image from "next/image";
import type { Metadata } from "next";
import { RegistrationWizard } from "./RegistrationWizard";

export const metadata: Metadata = {
  title: "Inscripción de jugadores Sub-15 — Fuerzas Básicas Jaguares",
  description:
    "Formulario público de inscripción para jugadores de la categoría Sub-15 de Fuerzas Básicas Jaguares de Córdoba.",
};

/**
 * Link independiente y público (sin sesión) para que un jugador o acudiente
 * de Sub-15 cargue su hoja de vida deportiva completa. Queda pendiente de
 * revisión por el cuerpo técnico — ver /plataforma/jugadores/solicitudes.
 */
export default function RegistroJugadoresPage() {
  return (
    <div className="min-h-screen bg-jaguar-mist/60 px-4 py-10 lg:py-14">
      <div className="mx-auto w-full max-w-[640px]">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/brand/logo-fuerzas-basicas.png"
            alt="Fuerzas Básicas de Jaguares de Córdoba"
            width={72}
            height={88}
            className="h-[64px] w-auto object-contain lg:h-[72px]"
          />
          <h1 className="mt-4 text-[19px] lg:text-[22px] font-extrabold text-jaguar-ink">
            Fuerzas Básicas <span className="text-jaguar-green-600">Jaguares</span> de Córdoba
          </h1>
          <p className="mt-1 text-[13px] lg:text-[14px] text-jaguar-ink/55">
            No formamos solo futbolistas — formamos personas.
          </p>
        </div>

        <div className="mt-8">
          <RegistrationWizard />
        </div>

        <p className="mt-6 text-center text-[12px] lg:text-[13px] text-jaguar-ink/40">
          ¿Ya enviaste tu solicitud? El cuerpo técnico se pondrá en contacto contigo tras revisarla.
        </p>
      </div>
    </div>
  );
}
