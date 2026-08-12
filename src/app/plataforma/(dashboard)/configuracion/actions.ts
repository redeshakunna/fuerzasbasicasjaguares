"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentStaffProfile } from "@/lib/data/player-profile";
import { getPrimaryAcademia } from "@/lib/data/academia";
import type { Enums } from "@/lib/supabase/database.types";

export interface ConfigActionState {
  error?: string;
  success?: boolean;
}

/** Crea una nueva temporada para la academia activa. */
export async function createTemporada(input: {
  name: string;
  startDate: string;
  endDate: string;
}): Promise<ConfigActionState> {
  const staff = await getCurrentStaffProfile();
  if (!staff?.isAdmin) return { error: "Solo un administrador puede crear temporadas." };

  const academia = await getPrimaryAcademia();
  if (!academia) return { error: "No se encontró la academia activa." };

  const supabase = await createClient();
  const { error } = await supabase.from("temporadas").insert({
    academia_id: academia.id,
    name: input.name,
    start_date: input.startDate,
    end_date: input.endDate,
  });

  if (error) {
    console.error("createTemporada() falló:", error);
    return { error: error.message.includes("duplicate") ? "Ya existe una temporada con ese nombre." : "No se pudo crear la temporada." };
  }

  revalidatePath("/plataforma/configuracion");
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
