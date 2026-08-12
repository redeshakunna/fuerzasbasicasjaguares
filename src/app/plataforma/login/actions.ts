"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLandingPathForRole } from "@/lib/data/player-profile";

export interface LoginState {
  error?: string;
}

/**
 * Server Action — valida credenciales contra Supabase Auth y aterriza según
 * el rol del perfil. `padre` todavía no tiene vista en esta plataforma (el
 * portal de familias es un módulo futuro), así que se bloquea con un mensaje
 * claro en vez de dejarlo entrar al panel de staff.
 */
export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/plataforma");

  if (!email || !password) {
    return { error: "Ingresa tu correo y contraseña." };
  }

  const supabase = await createClient();
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

  if (signInError || !signInData.user) {
    return { error: "Correo o contraseña incorrectos." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", signInData.user.id)
    .maybeSingle();

  if (profileError || !profile) {
    await supabase.auth.signOut();
    return { error: "Tu cuenta no tiene un perfil activo en la academia. Contacta a un administrador." };
  }

  const landingPath = getLandingPathForRole(profile.role);
  if (!landingPath) {
    await supabase.auth.signOut();
    return { error: "El acceso para padres de familia aún no está disponible en esta plataforma. Muy pronto." };
  }

  redirect(next.startsWith("/plataforma") && next !== "/plataforma/login" ? next : landingPath);
}
