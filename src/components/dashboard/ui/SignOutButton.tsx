"use client";

import { LogOut } from "lucide-react";
import { signOut } from "@/lib/supabase/actions";

export function SignOutButton() {
  return (
    <button
      type="button"
      aria-label="Cerrar sesión"
      onClick={() => signOut()}
      className="flex h-10 w-10 items-center justify-center rounded-xl text-jaguar-ink/50 transition-colors hover:bg-jaguar-maroon-500/8 hover:text-jaguar-maroon-600"
    >
      <LogOut className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
    </button>
  );
}
