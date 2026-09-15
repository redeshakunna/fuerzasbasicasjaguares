"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Mail, MailCheck } from "lucide-react";
import { requestPasswordReset, type RecoverState } from "./actions";

const initialState: RecoverState = {};

export function RecoverForm() {
  const [state, formAction, isPending] = useActionState(requestPasswordReset, initialState);

  if (state.success) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-jaguar-green-500/10 text-jaguar-green-600">
          <MailCheck className="h-6 w-6" strokeWidth={1.8} aria-hidden />
        </span>
        <p className="text-[13.5px] lg:text-[14.5px] leading-relaxed text-jaguar-ink/70">
          Si el correo está registrado, te enviamos un link para restablecer tu contraseña. Revisa tu bandeja de
          entrada (y la carpeta de spam).
        </p>
        <Link
          href="/plataforma/login"
          className="mt-2 inline-flex items-center gap-1.5 text-[13px] lg:text-[13.5px] font-semibold text-jaguar-green-600 hover:text-jaguar-green-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
          Volver a iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
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
        {isPending ? "Enviando…" : "Enviar link de recuperación"}
      </button>

      <Link
        href="/plataforma/login"
        className="flex items-center justify-center gap-1.5 text-[13px] lg:text-[13.5px] font-semibold text-jaguar-ink/50 hover:text-jaguar-ink/80"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
        Volver a iniciar sesión
      </Link>
    </form>
  );
}
