import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface PageHeaderBannerProps {
  title: string;
  breadcrumbLabel: string;
}

/**
 * Banner de encabezado para páginas interiores (Nosotros, Categorías,
 * Jugadores, Entrenadores, Contacto...) — mismo tratamiento en todas:
 * verde institucional oscuro, textura sutil en diagonal (evoca el pelaje
 * del jaguar sin ser literal), título en tipografía display y breadcrumb
 * de regreso a Inicio. El padding-top compensa el Navbar fijo de arriba.
 */
export function PageHeaderBanner({ title, breadcrumbLabel }: PageHeaderBannerProps) {
  return (
    <div className="relative overflow-hidden bg-jaguar-green-900 pt-36 pb-10 lg:pt-44 lg:pb-14">
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.06] [background:repeating-linear-gradient(115deg,white_0px,white_2px,transparent_2px,transparent_18px)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-jaguar-green-600/40 blur-3xl"
      />
      <div className="relative mx-auto max-w-[1600px] px-6 md:px-10 lg:px-14">
        <h1 className="font-display text-4xl uppercase leading-none tracking-tight text-jaguar-white md:text-5xl">
          {title}
        </h1>
        <span aria-hidden className="mt-4 block h-[3px] w-14 rounded-full bg-jaguar-green-500" />
        <div className="mt-5 flex items-center gap-1.5 text-[12.5px] font-medium text-jaguar-white/55">
          <Link href="/" className="flex items-center gap-1.5 transition-colors hover:text-jaguar-white">
            <Home className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            Inicio
          </Link>
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          <span className="text-jaguar-white/85">{breadcrumbLabel}</span>
        </div>
      </div>
    </div>
  );
}
