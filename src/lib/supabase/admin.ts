import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * Cliente con la service_role key — se salta RLS y es el único que puede
 * invitar usuarios reales por correo (`auth.admin.inviteUserByEmail`).
 * SOLO se usa dentro de Server Actions ya protegidas con
 * `getCurrentStaffProfile()?.isAdmin` (ver configuracion/actions.ts).
 * Nunca debe importarse desde un componente cliente.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Falta SUPABASE_SERVICE_ROLE_KEY en las variables de entorno (Project Settings -> API -> service_role secret en Supabase)."
    );
  }

  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
