import Image from "next/image";
import { Bell, ChevronDown, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Avatar } from "./ui/Avatar";
import { SignOutButton } from "./ui/SignOutButton";
import { TourHelpButton } from "./tour/TourHelpButton";

const roleLabel = {
  entrenador: "Entrenador",
  coordinador: "Coordinador deportivo",
  directivo: "Directivo",
  padre: "Padre de familia",
  admin: "Súper Admin",
} as const;

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "??";
}

/**
 * Header superior — logo (visible en mobile, el sidebar ya lo trae en
 * desktop), temporada, buscador, notificaciones y perfil real (sesión
 * de Supabase Auth).
 */
export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let fullName = "Usuario";
  let role: keyof typeof roleLabel = "entrenador";

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", user.id)
      .single();
    if (profile) {
      fullName = profile.full_name;
      role = profile.role;
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between gap-4 border-b border-jaguar-ink/8 bg-white/90 px-5 backdrop-blur-sm lg:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-jaguar-green-600 via-jaguar-turquoise-500 to-jaguar-gold-500"
      />
      <div className="flex items-center gap-3 lg:hidden">
        <Image src="/brand/logo-fuerzas-basicas.png" alt="Jaguares FC" width={32} height={32} className="h-8 w-8 object-contain" />
      </div>

      <button
        type="button"
        className="hidden items-center gap-2 rounded-xl border border-jaguar-ink/10 px-3.5 py-2 text-[13px] lg:text-[14px] font-semibold text-jaguar-ink/75 transition-colors hover:bg-jaguar-ink/[0.03] sm:flex"
      >
        Temporada 2024 - 2025
        <ChevronDown className="h-3.5 w-3.5 text-jaguar-ink/40" strokeWidth={2} aria-hidden />
      </button>

      <div className="relative hidden max-w-sm flex-1 md:block">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-jaguar-ink/35"
          strokeWidth={1.8}
          aria-hidden
        />
        <input
          type="text"
          placeholder="Buscar jugador, entrenamiento, partido…"
          className="w-full rounded-xl border border-jaguar-ink/10 bg-jaguar-mist/60 py-2.5 pl-10 pr-4 text-[13.5px] lg:text-[15px] text-jaguar-ink placeholder:text-jaguar-ink/35 focus:border-jaguar-green-500/40 focus:outline-none focus:ring-2 focus:ring-jaguar-green-500/10"
        />
      </div>

      <div className="flex items-center gap-2">
        <TourHelpButton />

        <button
          type="button"
          aria-label="Notificaciones"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl text-jaguar-ink/60 transition-colors hover:bg-jaguar-ink/[0.04]"
        >
          <Bell className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-jaguar-green-600 px-1 text-[10px] lg:text-[11px] font-bold leading-none text-white">
            3
          </span>
        </button>

        <div className="flex items-center gap-2.5 rounded-xl py-1.5 pl-1.5 pr-2.5">
          <Avatar initials={getInitials(fullName)} size={34} />
          <span className="hidden flex-col items-start leading-none sm:flex">
            <span className="text-[13px] lg:text-[14px] font-semibold text-jaguar-ink">{fullName}</span>
            <span className="mt-0.5 text-[11px] lg:text-[12px] text-jaguar-ink/45">{roleLabel[role]}</span>
          </span>
        </div>

        <SignOutButton />
      </div>
    </header>
  );
}
