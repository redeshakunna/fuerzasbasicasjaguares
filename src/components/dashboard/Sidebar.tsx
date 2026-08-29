"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { dashboardNavItems } from "./data/nav.data";

/** Compara un href de nav (puede traer `?categoria=`) contra la ruta y el parámetro actuales. */
function isNavHrefActive(href: string, pathname: string, currentCategoria: string | null): boolean {
  const [path, query] = href.split("?");
  if (path !== pathname) return false;
  if (!query) return true;
  const categoria = new URLSearchParams(query).get("categoria");
  return categoria === null || categoria === currentCategoria;
}

interface SidebarProps {
  /** Solicitudes de inscripción pendientes — se muestra como badge sobre "Solicitudes de inscripción". */
  pendingRegistrationsCount?: number;
}

/**
 * Sidebar izquierda fija. Item activo con fondo verde sólido (sin
 * degradados), hover sutil, íconos minimalistas (lucide, stroke 1.75).
 * Cierra con una tarjeta de propósito institucional (marca de agua del
 * jaguar) antes del link de regreso al sitio público.
 */
export function Sidebar({ pendingRegistrationsCount = 0 }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategoria = searchParams.get("categoria");

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-white/8 bg-jaguar-green-900 lg:flex">
      <div className="flex items-center gap-2.5 border-b border-white/8 px-6 py-4">
        <Image
          src="/brand/logo-fuerzas-basicas.png"
          alt="Fuerzas Básicas de Jaguares de Córdoba"
          width={44}
          height={44}
          className="h-11 w-11 shrink-0 object-contain"
        />
        <div className="flex flex-col leading-[1.15]">
          <span className="text-[12px] lg:text-[13px] font-extrabold uppercase tracking-[0.02em] text-white">
            Fuerzas Básicas
            <br />
            Jaguares de Córdoba
          </span>
          <span className="mt-1 text-[9px] lg:text-[10px] font-medium uppercase tracking-[0.1em] text-white/40">
            Formamos talento, construimos sueños
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
        {dashboardNavItems.map((item) => {
          const hasChildren = (item.children?.length ?? 0) > 0;
          const sectionActive = hasChildren
            ? isNavHrefActive(item.href, pathname, currentCategoria) ||
              (item.children?.some((c) => isNavHrefActive(c.href, pathname, currentCategoria)) ?? false)
            : isNavHrefActive(item.href, pathname, currentCategoria);
          const Icon = item.icon;
          return (
            <div key={item.id}>
              <Link
                href={item.href}
                data-tour={`sidebar-${item.id}`}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13.5px] lg:text-[15px] font-medium transition-colors ${
                  sectionActive
                    ? "bg-jaguar-green-600 text-white shadow-[inset_3px_0_0_0_var(--color-jaguar-gold-500)]"
                    : "text-white/60 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} aria-hidden />
                {item.label}
              </Link>
              {hasChildren && sectionActive ? (
                <div className="mt-1 space-y-0.5 border-l border-white/10 pl-3.5">
                  {item.children?.map((child) => {
                    const childActive = isNavHrefActive(child.href, pathname, currentCategoria);
                    const pendingBadge =
                      child.id === "jugadores-solicitudes" && pendingRegistrationsCount > 0
                        ? String(pendingRegistrationsCount)
                        : null;
                    return (
                      <Link
                        key={child.id}
                        href={child.href}
                        className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-[12.5px] lg:text-[13.5px] font-medium transition-colors ${
                          childActive
                            ? "bg-white/10 text-jaguar-gold-400"
                            : "text-white/45 hover:bg-white/[0.06] hover:text-white"
                        }`}
                      >
                        {child.label}
                        {pendingBadge ? (
                          <span className="rounded-full bg-jaguar-gold-500 px-1.5 py-0.5 text-[9px] lg:text-[10px] font-bold text-jaguar-ink">
                            {pendingBadge}
                          </span>
                        ) : child.badge ? (
                          <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.03em] text-white/50">
                            {child.badge}
                          </span>
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>

      <div className="px-4 pb-4">
        <div className="relative overflow-hidden rounded-2xl bg-white/[0.06] p-4">
          <Image
            src="/brand/logo-fuerzas-basicas.png"
            alt=""
            width={140}
            height={170}
            aria-hidden
            className="pointer-events-none absolute -bottom-6 -right-6 h-[130px] w-[108px] object-contain opacity-[0.1]"
          />
          <p className="relative text-[13px] lg:text-[14px] font-bold leading-snug text-white">
            “No es solo fútbol,
            <br />
            es nuestro legado.”
          </p>
          <p className="relative mt-2 text-[11.5px] lg:text-[12.5px] font-semibold text-jaguar-gold-400">
            Jaguares de Córdoba
          </p>
        </div>
      </div>

      <div className="border-t border-white/8 p-4">
        <Link
          href="/"
          className="flex items-center justify-center rounded-xl px-3.5 py-2.5 text-[12.5px] lg:text-[13.5px] font-semibold text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          Volver al sitio público
        </Link>
      </div>
    </aside>
  );
}
