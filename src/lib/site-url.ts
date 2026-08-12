import { headers } from "next/headers";

/** URL base del sitio para este request — usada para armar links públicos (ej. confirmación de asistencia por WhatsApp). */
export async function getSiteUrl(): Promise<string> {
  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host") ?? "localhost:3000";
  const proto = headersList.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
