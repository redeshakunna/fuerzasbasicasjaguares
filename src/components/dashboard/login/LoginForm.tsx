"use client";

import { useActionState } from "react";
import { Loader2, Lock, Mail } from "lucide-react";
import { login, type LoginState } from "@/app/plataforma/login/actions";

const initialState: LoginState = {};

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, isPending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />

      <div>
        <label htmlFor="email" className="text-[13px] lg:text-[14px] font-semibold text-jaguar-ink/70">
          Correo
        </label>
        <div className="relative mt-1.5">
          <Mail
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-jaguar-ink/35"
            strokeWidth={1.8}
            aria-hidden
          />
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="entrenador@jaguaresdecordoba.com"
            className="w-full rounded-xl border border-jaguar-ink/10 bg-jaguar-mist/40 py-2.5 pl-10 pr-4 text-[13.5px] lg:text-[15px] text-jaguar-ink placeholder:text-jaguar-ink/35 focus:border-jaguar-green-500/40 focus:outline-none focus:ring-2 focus:ring-jaguar-green-500/10"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="text-[13px] lg:text-[14px] font-semibold text-jaguar-ink/70">
          Contraseña
        </label>
        <div className="relative mt-1.5">
          <Lock
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-jaguar-ink/35"
            strokeWidth={1.8}
            aria-hidden
          />
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className="w-full rounded-xl border border-jaguar-ink/10 bg-jaguar-mist/40 py-2.5 pl-10 pr-4 text-[13.5px] lg:text-[15px] text-jaguar-ink placeholder:text-jaguar-ink/35 focus:border-jaguar-green-500/40 focus:outline-none focus:ring-2 focus:ring-jaguar-green-500/10"
          />
        </div>
      </div>

      {state.error ? (
        <p className="rounded-xl bg-jaguar-maroon-500/8 px-3.5 py-2.5 text-[13px] lg:text-[14px] font-medium text-jaguar-maroon-600">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-jaguar-green-600 py-3 text-[13.5px] lg:text-[15px] font-semibold text-white transition-colors hover:bg-jaguar-green-700 disabled:opacity-60"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} aria-hidden /> : null}
        {isPending ? "Ingresando…" : "Iniciar sesión"}
      </button>
    </form>
  );
}
