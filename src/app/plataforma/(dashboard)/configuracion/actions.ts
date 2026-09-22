"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentStaffProfile } from "@/lib/data/player-profile";
import { getPrimaryAcademia } from "@/lib/data/academia";
import { getSiteUrl } from "@/lib/site-url";
import type { Enums } from "@/lib/supabase/database.types";

export interface ConfigActionState {
  error?: string;
  success?: boolean;
}

/** Quién puede administrar la planificación deportiva (temporadas/ciclos): admin y coordinador. */
async function requirePlanningStaff() {
  const staff = await getCurrentStaffProfile();
  if (!staff || !(staff.isAdmin || staff.role === "coordinador")) return null;
  return staff;
}

export interface TemporadaInput {
  name: string;
  startDate: string;
  endDate: string;
  category?: string | null;
  objective?: string | null;
  responsibleId?: string | null;
  status?: Enums<"plan_status">;
}

/** Crea una nueva temporada para la academia activa (admin o coordinador). */
export async function createTemporada(input: TemporadaInput): Promise<ConfigActionState> {
  const staff = await requirePlanningStaff();
  if (!staff) return { error: "Solo un administrador o coordinador puede crear temporadas." };

  const academia = await getPrimaryAcademia();
  if (!academia) return { error: "No se encontró la academia activa." };

  const supabase = await createClient();
  const insertPayload: Record<string, unknown> = {
    academia_id: academia.id,
    name: input.name,
    start_date: input.startDate,
    end_date: input.endDate,
    category: input.category ?? null,
    objective: input.objective ?? null,
    responsible_id: input.responsibleId ?? null,
  };
  // Solo tocamos status/is_active si vinieron explícitos — si no, dejamos que la
  // base de datos aplique su valor por defecto, igual que antes de este cambio.
  if (input.status !== undefined) {
    insertPayload.status = input.status;
    insertPayload.is_active = input.status === "activo";
  }
  const { error } = await supabase.from("temporadas").insert(insertPayload as never);

  if (error) {
    console.error("createTemporada() falló:", error);
    return { error: error.message.includes("duplicate") ? "Ya existe una temporada con ese nombre." : "No se pudo crear la temporada." };
  }

  revalidatePath("/plataforma/configuracion");
  revalidatePath("/plataforma/entrenamientos/planificacion");
  return { success: true };
}

/** Edita una temporada existente (admin o coordinador). */
export async function updateTemporada(id: string, input: Partial<TemporadaInput>): Promise<ConfigActionState> {
  const staff = await requirePlanningStaff();
  if (!staff) return { error: "Solo un administrador o coordinador puede editar temporadas." };

  const supabase = await createClient();
  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.startDate !== undefined) patch.start_date = input.startDate;
  if (input.endDate !== undefined) patch.end_date = input.endDate;
  if (input.category !== undefined) patch.category = input.category;
  if (input.objective !== undefined) patch.objective = input.objective;
  if (input.responsibleId !== undefined) patch.responsible_id = input.responsibleId;
  if (input.status !== undefined) {
    patch.status = input.status;
    patch.is_active = input.status === "activo";
  }

  const { error } = await supabase.from("temporadas").update(patch as never).eq("id", id);

  if (error) {
    console.error("updateTemporada() falló:", error);
    return { error: "No se pudo actualizar la temporada." };
  }

  revalidatePath("/plataforma/configuracion");
  revalidatePath("/plataforma/entrenamientos/planificacion");
  return { success: true };
}

/** Cambia la cadencia de recordatorio de informes (mensual/quincenal) — el envío siempre lo confirma el técnico a mano. */
export async function updateReportCadence(cadence: "mensual" | "quincenal"): Promise<ConfigActionState> {
  const staff = await getCurrentStaffProfile();
  if (!staff?.isAdmin) return { error: "Solo un administrador puede cambiar la cadencia de informes." };

  const academia = await getPrimaryAcademia();
  if (!academia) return { error: "No se encontró la academia activa." };

  const supabase = await createClient();
  const { error } = await supabase.from("academias").update({ report_cadence: cadence }).eq("id", academia.id);

  if (error) {
    console.error("updateReportCadence() falló:", error);
    return { error: "No se pudo actualizar la cadencia de informes." };
  }

  revalidatePath("/plataforma/configuracion");
  revalidatePath("/plataforma/informes");
  return { success: true };
}

/** Cambia el rol de un miembro del staff — solo administradores. */
export async function updateStaffRole(profileId: string, role: Enums<"user_role">): Promise<ConfigActionState> {
  const staff = await getCurrentStaffProfile();
  if (!staff?.isAdmin) return { error: "Solo un administrador puede cambiar roles." };

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ role }).eq("id", profileId);

  if (error) {
    console.error("updateStaffRole() falló:", error);
    return { error: "No se pudo actualizar el rol." };
  }

  revalidatePath("/plataforma/configuracion");
  return { success: true };
}

/** Crea un cargo/profesión nuevo en el catálogo de la academia (ej. "Psicólogo", "Preparador Físico") — solo administradores. */
export async function createCargo(nombre: string): Promise<ConfigActionState & { cargoId?: string }> {
  const staff = await getCurrentStaffProfile();
  if (!staff?.isAdmin) return { error: "Solo un administrador puede crear cargos." };

  const trimmed = nombre.trim();
  if (!trimmed) return { error: "Escribe el nombre del cargo." };

  const academia = await getPrimaryAcademia();
  if (!academia) return { error: "No se encontró la academia activa." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cargos")
    .insert({ academia_id: academia.id, nombre: trimmed })
    .select("id")
    .single();

  if (error) {
    console.error("createCargo() falló:", error);
    return { error: error.message.includes("duplicate") ? "Ya existe un cargo con ese nombre." : "No se pudo crear el cargo." };
  }

  revalidatePath("/plataforma/configuracion");
  return { success: true, cargoId: data.id };
}

export interface CreateStaffState {
  error?: string;
  success?: boolean;
  grantedAccess?: boolean;
}

/**
 * Crea la ficha de un profesional nuevo (entrenador, psicólogo, nutricionista, etc.)
 * en el cuerpo técnico. Por defecto NO le da acceso a la plataforma: se crea una
 * cuenta de Supabase Auth "oculta" (sin correo, sin contraseña conocida, email sin
 * confirmar) solo para poder vincular su ficha — el profesional no puede iniciar
 * sesión con ella. Esto existe porque `profiles.id` siempre debe ser el id de una
 * cuenta real de auth.users; no hay forma de tener una ficha de staff totalmente
 * desligada de una cuenta.
 *
 * Si se marca "Dar acceso a la plataforma ahora" (`grant_access`), en cambio se
 * envía la invitación real por correo (le llega un correo para poner su
 * contraseña, nunca la manejamos nosotros) — el mismo flujo de siempre, pero
 * ahora opcional. Solo administradores.
 */
export async function createStaffMember(_prevState: CreateStaffState, formData: FormData): Promise<CreateStaffState> {
  const staff = await getCurrentStaffProfile();
  if (!staff?.isAdmin) return { error: "Solo un administrador puede agregar profesionales." };

  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "") as Enums<"user_role">;
  const grantAccess = formData.get("grant_access") === "on" || formData.get("grant_access") === "true";
  let cargoId = String(formData.get("cargo_id") ?? "").trim() || null;
  const nuevoCargoNombre = String(formData.get("nuevo_cargo_nombre") ?? "").trim();

  if (!fullName || !email) {
    return { error: "Nombre y correo son obligatorios." };
  }
  if (!(["admin", "directivo", "coordinador", "entrenador"] as string[]).includes(role)) {
    return { error: "Selecciona un nivel de acceso válido." };
  }

  const academia = await getPrimaryAcademia();
  if (!academia) return { error: "No se encontró la academia activa." };

  // Si escribió un cargo nuevo en vez de elegir uno de la lista, lo creamos primero.
  if (!cargoId && nuevoCargoNombre) {
    const cargoResult = await createCargo(nuevoCargoNombre);
    if (cargoResult.error || !cargoResult.cargoId) {
      return { error: cargoResult.error ?? "No se pudo crear el cargo nuevo." };
    }
    cargoId = cargoResult.cargoId;
  }

  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch (err) {
    console.error("createStaffMember() sin service role key:", err);
    return { error: "Falta configurar la llave de administrador de Supabase (SUPABASE_SERVICE_ROLE_KEY) en el servidor." };
  }

  let userId: string;

  if (grantAccess) {
    const siteUrl = await getSiteUrl();
    const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${siteUrl}/plataforma/restablecer`,
    });
    if (inviteError || !invited?.user) {
      console.error("createStaffMember() invite falló:", inviteError);
      const alreadyExists = inviteError?.message?.toLowerCase().includes("already been registered");
      return { error: alreadyExists ? "Ya existe una cuenta con ese correo." : "No se pudo enviar la invitación." };
    }
    userId = invited.user.id;
  } else {
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      email_confirm: false,
      user_metadata: { full_name: fullName },
    });
    if (createError || !created?.user) {
      console.error("createStaffMember() createUser falló:", createError);
      const alreadyExists = createError?.message?.toLowerCase().includes("already registered");
      return { error: alreadyExists ? "Ya existe una cuenta con ese correo." : "No se pudo crear el profesional." };
    }
    userId = created.user.id;
  }

  const { error: profileError } = await admin
    .from("profiles")
    .upsert({ id: userId, academia_id: academia.id, full_name: fullName, role, cargo_id: cargoId });

  if (profileError) {
    console.error("createStaffMember() profiles falló:", profileError);
    return {
      error: grantAccess
        ? "La invitación se envió, pero no se pudo guardar el perfil. Avísale a soporte."
        : "Se creó la cuenta, pero no se pudo guardar el perfil. Avísale a soporte.",
    };
  }

  revalidatePath("/plataforma/configuracion");
  return { success: true, grantedAccess: grantAccess };
}

export interface UpdateStaffState {
  error?: string;
  success?: boolean;
}

/**
 * Edita los datos de un profesional ya existente: nombre, cargo y nivel de
 * acceso. Permite crear un cargo nuevo al vuelo, igual que al invitar.
 * Solo administradores.
 */
export async function updateStaffMember(profileId: string, formData: FormData): Promise<UpdateStaffState> {
  const staff = await getCurrentStaffProfile();
  if (!staff?.isAdmin) return { error: "Solo un administrador puede editar profesionales." };

  const fullName = String(formData.get("full_name") ?? "").trim();
  const role = String(formData.get("role") ?? "") as Enums<"user_role">;
  let cargoId = String(formData.get("cargo_id") ?? "").trim() || null;
  const nuevoCargoNombre = String(formData.get("nuevo_cargo_nombre") ?? "").trim();

  if (!fullName) return { error: "El nombre es obligatorio." };
  if (!(["admin", "directivo", "coordinador", "entrenador"] as string[]).includes(role)) {
    return { error: "Selecciona un nivel de acceso válido." };
  }

  if (!cargoId && nuevoCargoNombre) {
    const cargoResult = await createCargo(nuevoCargoNombre);
    if (cargoResult.error || !cargoResult.cargoId) {
      return { error: cargoResult.error ?? "No se pudo crear el cargo nuevo." };
    }
    cargoId = cargoResult.cargoId;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, role, cargo_id: cargoId })
    .eq("id", profileId);

  if (error) {
    console.error("updateStaffMember() falló:", error);
    return { error: "No se pudo guardar los cambios." };
  }

  revalidatePath("/plataforma/configuracion");
  return { success: true };
}
