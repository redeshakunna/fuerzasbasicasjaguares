"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentStaffProfile } from "@/lib/data/player-profile";
import { getDefaultAcademiaId } from "@/lib/data/finance";

export interface FinanceActionState {
  error?: string;
  success?: boolean;
}

/**
 * Registra un pago sobre una obligación existente y la marca como Pagado.
 * Simplificación de MVP: se asume pago del valor completo de la obligación
 * (el esquema ya soporta pagos parciales vía múltiples filas en `payments`,
 * pero la UI de "pago parcial" queda para una siguiente iteración).
 */
export async function registrarPago(
  obligationId: string,
  input: { amount: number; method: string; paidAt: string },
): Promise<FinanceActionState & { obligationId?: string }> {
  const staff = await getCurrentStaffProfile();
  if (!staff) return { error: "Debes iniciar sesión para registrar un pago." };

  const supabase = await createClient();

  const { data: obligation, error: fetchError } = await supabase
    .from("obligations")
    .select("id, status")
    .eq("id", obligationId)
    .maybeSingle();

  if (fetchError || !obligation) {
    console.error("registrarPago() — obligación no encontrada:", fetchError);
    return { error: "No se encontró el concepto a pagar." };
  }

  const receiptNumber = `REC-${Math.floor(1000 + Math.random() * 9000)}`;

  const { error: paymentError } = await supabase.from("payments").insert({
    obligation_id: obligationId,
    amount: input.amount,
    method: input.method,
    paid_at: input.paidAt,
    receipt_number: receiptNumber,
    registered_by: staff.id,
  });

  if (paymentError) {
    console.error("registrarPago() falló al insertar payment:", paymentError);
    return { error: "No se pudo registrar el pago. Intenta de nuevo." };
  }

  const { error: updateError } = await supabase
    .from("obligations")
    .update({ status: "Pagado", updated_at: new Date().toISOString() })
    .eq("id", obligationId);

  if (updateError) {
    console.error("registrarPago() falló al actualizar obligation:", updateError);
    return { error: "El pago se registró, pero no se pudo actualizar el estado de la cuenta." };
  }

  revalidatePath("/plataforma/finanzas");
  revalidatePath("/plataforma/finanzas/cuentas-por-cobrar");
  revalidatePath("/plataforma/finanzas/estado-cuenta");
  revalidatePath("/plataforma/finanzas/historial");
  return { success: true, obligationId };
}

/** Crea un nuevo concepto de cobro (obligación) para un jugador — usado por el wizard "Nuevo cobro". */
export async function crearObligacion(input: {
  playerId: string;
  conceptId: string;
  title: string;
  amount: number;
  dueDate: string;
}): Promise<FinanceActionState & { obligationId?: string }> {
  const staff = await getCurrentStaffProfile();
  if (!staff) return { error: "Debes iniciar sesión para crear un cobro." };

  const academiaId = await getDefaultAcademiaId();
  if (!academiaId) return { error: "No se encontró la academia activa." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("obligations")
    .insert({
      academia_id: academiaId,
      player_id: input.playerId,
      concept_id: input.conceptId,
      title: input.title,
      amount: input.amount,
      due_date: input.dueDate,
      status: "Pendiente",
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("crearObligacion() falló:", error);
    return { error: "No se pudo crear el concepto de cobro. Intenta de nuevo." };
  }

  revalidatePath("/plataforma/finanzas");
  revalidatePath("/plataforma/finanzas/cuentas-por-cobrar");
  return { success: true, obligationId: data.id };
}

/**
 * Marca recordatorios como enviados (acción masiva) sobre un lote de
 * obligaciones pendientes/vencidas. Registra reminder_sent_at en la fila real
 * — reemplaza el estado "solo diseño" que tenía la pantalla de Recordatorios
 * retirada. El envío efectivo por WhatsApp sigue siendo manual (se abre
 * wa.me desde el cliente); esta acción persiste que ya se avisó.
 */
export async function enviarRecordatorios(obligationIds: string[]): Promise<FinanceActionState> {
  const staff = await getCurrentStaffProfile();
  if (!staff) return { error: "Debes iniciar sesión para enviar recordatorios." };
  if (obligationIds.length === 0) return { error: "Selecciona al menos una cuenta." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("obligations")
    .update({ reminder_sent_at: new Date().toISOString() })
    .in("id", obligationIds);

  if (error) {
    console.error("enviarRecordatorios() falló:", error);
    return { error: "No se pudieron registrar los recordatorios. Intenta de nuevo." };
  }

  revalidatePath("/plataforma/finanzas");
  revalidatePath("/plataforma/finanzas/cuentas-por-cobrar");
  return { success: true };
}
