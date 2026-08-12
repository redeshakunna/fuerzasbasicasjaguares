import { redirect } from "next/navigation";

/**
 * Pantalla retirada: los recordatorios ahora son una acción masiva dentro de
 * Cuentas por cobrar (junto a la cuenta que los origina), no un destino aparte.
 * Se conserva esta ruta como redirect para no romper enlaces guardados.
 */
export default function RecordatoriosPage() {
  redirect("/plataforma/finanzas/cuentas-por-cobrar");
}
