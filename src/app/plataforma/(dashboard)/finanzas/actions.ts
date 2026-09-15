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

export interface ConceptInput {
  name: string;
  description: string;
  suggestedAmount: number;
  isRecurring: boolean;
}

/** Crea un concepto de cobro nuevo en el catálogo de la academia. */
export async function crearConcepto(input: ConceptInput): Promise<FinanceActionState & { conceptId?: string }> {
  const staff = await getCurrentStaffProfile();
  if (!staff) return { error: "Debes iniciar sesión para crear un concepto." };

  const name = input.name.trim();
  if (!name) return { error: "El concepto necesita un nombre." };
  if (input.suggestedAmount < 0) return { error: "El valor sugerido no puede ser negativo." };

  const academiaId = await getDefaultAcademiaId();
  if (!academiaId) return { error: "No se encontró la academia activa." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payment_concepts")
    .insert({
      academia_id: academiaId,
      name,
      description: input.description.trim() || null,
      suggested_amount: input.suggestedAmount,
      is_recurring: input.isRecurring,
      status: "Activo",
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("crearConcepto() falló:", error);
    return { error: "No se pudo crear el concepto. Intenta de nuevo." };
  }

  revalidatePath("/plataforma/finanzas/conceptos");
  revalidatePath("/plataforma/finanzas/configuracion");
  return { success: true, conceptId: data.id };
}

/** Edita un concepto existente (nombre, descripción, valor sugerido, recurrencia). */
export async function actualizarConcepto(conceptId: string, input: ConceptInput): Promise<FinanceActionState> {
  const staff = await getCurrentStaffProfile();
  if (!staff) return { error: "Debes iniciar sesión para editar un concepto." };

  const name = input.name.trim();
  if (!name) return { error: "El concepto necesita un nombre." };
  if (input.suggestedAmount < 0) return { error: "El valor sugerido no puede ser negativo." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("payment_concepts")
    .update({
      name,
      description: input.description.trim() || null,
      suggested_amount: input.suggestedAmount,
      is_recurring: input.isRecurring,
    })
    .eq("id", conceptId);

  if (error) {
    console.error("actualizarConcepto() falló:", error);
    return { error: "No se pudo guardar el concepto. Intenta de nuevo." };
  }

  revalidatePath("/plataforma/finanzas/conceptos");
  revalidatePath("/plataforma/finanzas/configuracion");
  return { success: true };
}

/** Activa/inactiva un concepto — alternativa segura a borrar cuando ya tiene cobros asociados. */
export async function alternarEstadoConcepto(conceptId: string, activo: boolean): Promise<FinanceActionState> {
  const staff = await getCurrentStaffProfile();
  if (!staff) return { error: "Debes iniciar sesión para cambiar el estado del concepto." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("payment_concepts")
    .update({ status: activo ? "Activo" : "Inactivo" })
    .eq("id", conceptId);

  if (error) {
    console.error("alternarEstadoConcepto() falló:", error);
    return { error: "No se pudo cambiar el estado. Intenta de nuevo." };
  }

  revalidatePath("/plataforma/finanzas/conceptos");
  revalidatePath("/plataforma/finanzas/configuracion");
  return { success: true };
}

/**
 * Elimina un concepto del catálogo. Si ya tiene cobros (obligations) creados
 * con ese concepto, el borrado se bloquea en la base de datos (integridad
 * referencial) — en ese caso se devuelve un error claro sugiriendo inactivarlo
 * en su lugar, en vez de dejar pasar un error de Postgres sin traducir.
 */
export async function eliminarConcepto(conceptId: string): Promise<FinanceActionState> {
  const staff = await getCurrentStaffProfile();
  if (!staff) return { error: "Debes iniciar sesión para eliminar un concepto." };

  const supabase = await createClient();

  const { count } = await supabase
    .from("obligations")
    .select("id", { count: "exact", head: true })
    .eq("concept_id", conceptId);

  if (count && count > 0) {
    return { error: "Este concepto ya tiene cobros asociados — no se puede eliminar. Puedes inactivarlo en su lugar." };
  }

  const { error } = await supabase.from("payment_concepts").delete().eq("id", conceptId);

  if (error) {
    console.error("eliminarConcepto() falló:", error);
    return { error: "No se pudo eliminar el concepto. Intenta de nuevo." };
  }

  revalidatePath("/plataforma/finanzas/conceptos");
  revalidatePath("/plataforma/finanzas/configuracion");
  return { success: true };
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
