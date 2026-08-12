"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { NavLink } from "@/components/hero/hero.types";

interface NavbarProps {
  links: NavLink[];
  /** href del link activo, para el indicador subrayado. */
  activeHref?: string;
  /**
   * "transparent" (default): se funde con el Hero y se vuelve sólido al
   * hacer scroll — pensado para la home. "solid": siempre opaco, para
   * páginas interiores que no tienen una foto a sangre completa debajo.
   */
  variant?: "transparent" | "solid";
}

/** Ruta pura de un href, sin `?query` ni `#hash`. */
function basePathOf(href: string): string {
  return href.replace(/[?#].*$/, "");
}

/** ¿Este link (o alguno de sus hijos) corresponde a la página activa? Compara solo la ruta. */
function isLinkActive(link: NavLink, activeHref: string): boolean {
  if (basePathOf(link.href) === activeHref) return true;
  return link.children?.some((child) => basePathOf(child.href) === activeHref) ?? false;
}

function UserIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden>
      <circle cx="8" cy="5.2" r="2.7" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M2.6 13.5c.9-2.8 3-4.3 5.4-4.3s4.5 1.5 5.4 4.3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Navbar({ links, activeHref = "#inicio", variant = "transparent" }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isSolid = variant === "solid" || scrolled;

  function openNow(label: string) {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenDropdown(label);
  }

  function closeSoon() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenDropdown(null), 150);
  }

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={[
        "fixed inset-x-0 top-0 z-50 transition-colors duration-500",
        isSolid
          ? "bg-jaguar-white/85 backdrop-blur-md shadow-[0_1px_0_0_rgba(13,18,16,0.06)]"
          : "bg-transparent",
      ].join(" ")}
    >
      <nav className="mx-auto flex h-28 max-w-[1920px] items-center justify-between px-6 md:px-12 lg:h-32 lg:px-16">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/brand/logo-fuerzas-basicas.png"
            alt="Fuerzas Básicas de Jaguares de Córdoba FC"
            width={128}
            height={128}
            priority
            className="h-[104px] w-[104px] shrink-0 object-contain lg:h-28 lg:w-28"
          />
          <span className="hidden flex-col leading-none sm:flex">
            <span className="text-[15px] font-extrabold uppercase tracking-[0.04em] text-jaguar-green-600 md:text-[17px]">
              Fuerzas Básicas de Jaguares
            </span>
            <span className="mt-0.5 text-[15px] font-extrabold uppercase tracking-[0.04em] text-jaguar-green-600 md:text-[17px]">
              de Córdoba FC
            </span>
            <span className="mt-1 text-[9px] font-medium uppercase tracking-[0.16em] text-jaguar-ink/45">
              Formamos talento, construimos sueños
            </span>
          </span>
        </Link>

        <ul className="hidden items-center gap-8 lg:flex">
          {links.map((link) => {
            const isActive = isLinkActive(link, activeHref);
            const hasChildren = (link.children?.length ?? 0) > 0;
            const isOpen = openDropdown === link.label;
            return (
              <li
                key={link.href}
                className="relative"
                onMouseEnter={hasChildren ? () => openNow(link.label) : undefined}
                onMouseLeave={hasChildren ? closeSoon : undefined}
              >
                <Link
                  href={link.href}
                  aria-current={isActive}
                  aria-expanded={hasChildren ? isOpen : undefined}
                  onClick={hasChildren ? (e) => {
                    e.preventDefault();
                    setOpenDropdown((prev) => (prev === link.label ? null : link.label));
                  } : undefined}
                  className={[
                    "relative flex items-center gap-1 pb-1 text-[12.5px] font-semibold uppercase tracking-[0.14em] transition-colors",
                    isActive
                      ? "text-jaguar-ink"
                      : "text-jaguar-ink/65 hover:text-jaguar-green-600",
                  ].join(" ")}
                >
                  {link.label}
                  {hasChildren ? (
                    <ChevronDown
                      className={`h-3 w-3 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                      strokeWidth={2.5}
                      aria-hidden
                    />
                  ) : null}
                  {isActive ? (
                    <motion.span
                      layoutId="navbar-active-indicator"
                      className="absolute inset-x-0 -bottom-0.5 h-[2px] rounded-full bg-jaguar-green-500"
                    />
                  ) : null}
                </Link>

                {hasChildren ? (
                  <AnimatePresence>
                    {isOpen ? (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute left-1/2 top-full z-10 mt-3 w-52 -translate-x-1/2 overflow-hidden rounded-2xl border border-jaguar-ink/8 bg-jaguar-white shadow-[0_24px_60px_-24px_rgba(13,18,16,0.25)]"
                      >
                        {link.children?.map((child) => {
                          const childActive = !child.badge && basePathOf(child.href) === activeHref;
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={() => setOpenDropdown(null)}
                              className={[
                                "flex items-center justify-between gap-2 px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.08em] transition-colors",
                                childActive
                                  ? "bg-jaguar-green-50 text-jaguar-green-700"
                                  : "text-jaguar-ink/70 hover:bg-jaguar-mist hover:text-jaguar-ink",
                              ].join(" ")}
                            >
                              {child.label}
                              {child.badge ? (
                                <span className="rounded-full bg-jaguar-gold-500/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.03em] text-jaguar-gold-700">
                                  {child.badge}
                                </span>
                              ) : null}
                            </Link>
                          );
                        })}
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                ) : null}
              </li>
            );
          })}
        </ul>

        <Link
          href="/plataforma"
          className="group inline-flex items-center gap-2 rounded-full border border-jaguar-ink/15 bg-jaguar-white/90 px-5 py-2.5 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-jaguar-ink shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-jaguar-green-500/40 hover:bg-jaguar-white active:scale-[0.98]"
        >
          <UserIcon />
          Acceso Plataforma
        </Link>
      </nav>
    </motion.header>
  );
}
