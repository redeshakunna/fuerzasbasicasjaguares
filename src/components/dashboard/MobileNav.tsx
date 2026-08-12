"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { dashboardNavItems, mobileNavItemIds } from "./data/nav.data";

/** Navegación inferior fija — solo mobile/tablet angosto. */
export function MobileNav() {
  const pathname = usePathname();
  const items = dashboardNavItems.filter((item) => mobileNavItemIds.includes(item.id));

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-jaguar-ink/8 bg-white/95 px-2 py-2 backdrop-blur-sm lg:hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-jaguar-green-600 via-jaguar-turquoise-500 to-jaguar-gold-500"
      />
      {items.map((item) => {
        const isActive = pathname === item.href.split("?")[0];
        const Icon = item.icon;
        return (
          <Link
            key={item.id}
            href={item.href}
            className={`flex flex-col items-center gap-1 rounded-xl px-3.5 py-1.5 text-[10px] lg:text-[11px] font-semibold transition-colors ${
              isActive ? "bg-jaguar-green-50 text-jaguar-green-700" : "text-jaguar-ink/45"
            }`}
          >
            <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
