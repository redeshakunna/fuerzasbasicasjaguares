"use server";

import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";

export interface RecoverState {
  error?: string;
  success?: boolean;
}

/**
 * Server Action pública — envía el link de recuperación de contraseña de
 * Supabase Auth. Siempre responde con éxito (aunque el correo no exista) para
 * no revelar qué cuentas están registradas.
 */
export async function requestPasswordReset(_prevState: RecoverState, formData: FormData): Promise<RecoverState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return { error: "Ingresa tu correo." };
  }

  const supabase = await createClient();
  const siteUrl = await getSiteUrl();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/plataforma/restablecer`,
  });

  if (error) {
    if (error.code === "over_email_send_rate_limit" || error.status === 429) {
      return { error: "Se enviaron demasiados correos en poco tiempo. Espera unos minutos e intenta de nuevo." };
    }
    console.error("requestPasswordReset() falló:", error);
    // No confirmamos ni negamos si el correo existe — mensaje genérico de éxito.
  }

  return { success: true };
}
