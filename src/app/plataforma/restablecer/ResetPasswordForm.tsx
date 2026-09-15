"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Status = "checking" | "ready" | "invalid" | "saving" | "done";

/**
 * El link de recuperación de Supabase llega con el token en el hash de la
 * URL (#access_token=...&type=recovery), que nunca se envía al servidor —
 * por eso este flujo corre entero en el cliente. `createBrowserClient`
 * detecta el hash automáticamente (`detectSessionInUrl`) y dispara el
 * evento `PASSWORD_RECOVERY`.
 */
export function ResetPasswordForm() {
  const router = useRouter();
  const supabase = createClient();
  const [status, setStatus] = useState<Status>("checking");
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    let settled = false;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        settled = true;
        setStatus("ready");
      }
    });

    // Fallback: si el evento ya disparó antes de suscribirnos, o el navegador
    // ya tenía una sesión de recuperación válida, getSession() la encuentra.
    supabase.auth.getSession().then(({ data }) => {
      if (!settled && data.session) {
        settled = true;
        setStatus("ready");
      }
    });

    const timeout = setTimeout(() => {
      if (!settled) setStatus("invalid");
    }, 4000);

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setStatus("saving");
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError("No se pudo actualizar la contraseña. Pide un nuevo link e intenta de nuevo.");
      setStatus("ready");
      return;
    }

    await supabase.auth.signOut();
    setStatus("done");
    setTimeout(() => router.push("/plataforma/login"), 2500);
  }

  if (status === "checking") {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-jaguar-green-600" strokeWidth={2.25} aria-hidden />
        <p className="text-[13.5px] text-jaguar-ink/60">Verificando tu link…</p>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="text-[13.5px] lg:text-[14.5px] leading-relaxed text-jaguar-ink/70">
          Este link no es válido o ya venció. Pide uno nuevo desde la pantalla de recuperación.
        </p>
        <Link
          href="/plataforma/recuperar"
          className="mt-1 text-[13px] lg:text-[13.5px] font-semibold text-jaguar-green-600 hover:text-jaguar-green-700"
        >
          Pedir un nuevo link
        </Link>
      </div>
    );
  }

  if (status === "done") {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-jaguar-green-500/10 text-jaguar-green-600">
          <CheckCircle2 className="h-6 w-6" strokeWidth={1.8} aria-hidden />
        </span>
        <p className="text-[13.5px] lg:text-[14.5px] leading-relaxed text-jaguar-ink/70">
          Contraseña actualizada. Te llevamos al inicio de sesión…
        </p>
      </div>
    );
  }

  const isSaving = status === "saving";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="password" className="text-[13px] lg:text-[14px] font-semibold text-jaguar-ink/70">
          Nueva contraseña
        </label>
        <div className="relative mt-1.5">
          <Lock
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-jaguar-ink/35"
            strokeWidth={1.8}
            aria-hidden
          />
          <input
            id="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-jaguar-ink/10 bg-jaguar-mist/40 py-2.5 pl-10 pr-4 text-[13.5px] lg:text-[15px] text-jaguar-ink placeholder:text-jaguar-ink/35 focus:border-jaguar-green-500/40 focus:outline-none focus:ring-2 focus:ring-jaguar-green-500/10"
          />
        </div>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="text-[13px] lg:text-[14px] font-semibold text-jaguar-ink/70">
          Confirmar contraseña
        </label>
        <div className="relative mt-1.5">
          <Lock
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-jaguar-ink/35"
            strokeWidth={1.8}
            aria-hidden
          />
          <input
            id="confirmPassword"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-xl border border-jaguar-ink/10 bg-jaguar-mist/40 py-2.5 pl-10 pr-4 text-[13.5px] lg:text-[15px] text-jaguar-ink placeholder:text-jaguar-ink/35 focus:border-jaguar-green-500/40 focus:outline-none focus:ring-2 focus:ring-jaguar-green-500/10"
          />
        </div>
      </div>

      {error ? (
        <p className="rounded-xl bg-jaguar-maroon-500/8 px-3.5 py-2.5 text-[13px] lg:text-[14px] font-medium text-jaguar-maroon-600">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSaving}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-jaguar-green-600 py-3 text-[13.5px] lg:text-[15px] font-semibold text-white transition-colors hover:bg-jaguar-green-700 disabled:opacity-60"
      >
        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} aria-hidden /> : null}
        {isSaving ? "Guardando…" : "Guardar nueva contraseña"}
      </button>
    </form>
  );
}
