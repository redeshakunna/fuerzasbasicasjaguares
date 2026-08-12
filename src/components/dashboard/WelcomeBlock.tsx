import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { DashboardButton } from "./ui/Button";

/**
 * Tarjeta de bienvenida — foto real del plantel (Banner Central
 * Dashboard.png), marca y CTA. Se ubica junto a Próximos Partidos.
 */
export function WelcomeBlock({ category = "Sub-15" }: { category?: string }) {
  return (
    <div className="relative h-full overflow-hidden rounded-[18px] border border-jaguar-ink/8 bg-white">
      <div className="relative z-10 grid grid-cols-1 lg:h-full lg:grid-cols-[1fr_1fr] lg:min-h-[280px]">
        <div className="relative z-10 flex flex-col justify-center gap-4 px-7 py-8 lg:px-10 lg:py-10">
          <div className="flex items-center gap-3">
            <Image
              src="/brand/logo-fuerzas-basicas.png"
              alt="Fuerzas Básicas de Jaguares de Córdoba FC"
              width={56}
              height={56}
              className="h-12 w-12 shrink-0 object-contain"
            />
            <div className="leading-tight">
              <p className="text-[15px] lg:text-[16.5px] font-extrabold text-jaguar-ink">Desarrollamos talento</p>
              <p className="text-[15px] lg:text-[16.5px] font-extrabold text-jaguar-green-600">Construimos futuro</p>
            </div>
          </div>

          <p className="max-w-md text-[14px] lg:text-[15.5px] leading-relaxed text-jaguar-ink/60">
            Formación integral para la Categoría {category}: disciplina, técnica y mentalidad
            ganadora dentro y fuera de la cancha.
          </p>

          <div>
            <DashboardButton
              href="/plataforma/jugadores"
              icon={<ArrowRight className="h-4 w-4" strokeWidth={2} />}
            >
              Ver plantel
            </DashboardButton>
          </div>
        </div>

        <div className="relative hidden min-h-[280px] lg:block">
          <Image
            src="/brand/Banner Central Dashboard.png"
            alt="Plantel Sub-15 Fuerzas Básicas Jaguares"
            fill
            sizes="50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/5 to-transparent" />
        </div>
      </div>

      {/* Fondo móvil (imagen completa detrás del texto, con velo blanco) */}
      <div className="absolute inset-0 lg:hidden">
        <Image
          src="/brand/Banner Central Dashboard.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
          aria-hidden
        />
        <div className="absolute inset-0 bg-white/88" />
      </div>
    </div>
  );
}
