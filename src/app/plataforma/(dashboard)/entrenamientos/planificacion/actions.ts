"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentStaffProfile } from "@/lib/data/player-profile";
import { getPrimaryAcademia } from "@/lib/data/academia";
import type { Enums } from "@/lib/supabase/database.types";

export interface PlanActionState {
  error?: string;
  success?: boolean;
}

/** Temporadas y ciclos los administra admin o coordinador — es planificación estratégica de la academia. */
async function requireCicloStaff() {
  const staff = await getCurrentStaffProfile();
  if (!staff || !(staff.isAdmin || staff.role === "coordinador")) return null;
  return staff;
}

/** Los microciclos también los puede crear un entrenador — es su plan de trabajo del día a día. */
async function requireMicrocicloStaff() {
  const staff = await getCurrentStaffProfile();
  if (!staff || !(staff.isAdmin || staff.role === "coordinador" || staff.role === "entrenador")) return null;
  return staff;
}

export interface CicloInput {
  temporadaId: string;
  name: string;
  startDate: string;
  endDate: string;
  objective?: string | null;
  observaciones?: string | null;
  responsibleId?: string | null;
  status?: Enums<"plan_status">;
}

/** Crea un ciclo de trabajo (Pretemporada, Competición, etc.) dentro de una temporada. */
export async function createCiclo(input: CicloInput): Promise<PlanActionState> {
  const staff = await requireCicloStaff();
  if (!staff) return { error: "Solo un administrador o coordinador puede crear ciclos." };
  if (!input.name.trim() || !input.temporadaId || !input.startDate || !input.endDate) {
    return { error: "Nombre, temporada y fechas son obligatorios." };
  }

  const academia = await getPrimaryAcademia();
  if (!academia) return { error: "No se encontró la academia activa." };

  const supabase = await createClient();
  const { error } = await supabase.from("ciclos").insert({
    academia_id: academia.id,
    temporada_id: input.temporadaId,
    name: input.name.trim(),
    start_date: input.startDate,
    end_date: input.endDate,
    objective: input.objective ?? null,
    observaciones: input.observaciones ?? null,
    responsible_id: input.responsibleId ?? null,
    status: input.status ?? "planificado",
  });

  if (error) {
    console.error("createCiclo() falló:", error);
    return { error: "No se pudo crear el ciclo." };
  }

  revalidatePath("/plataforma/entrenamientos/planificacion");
  return { success: true };
}

/** Edita un ciclo existente. */
export async function updateCiclo(id: string, input: Partial<CicloInput>): Promise<PlanActionState> {
  const staff = await requireCicloStaff();
  if (!staff) return { error: "Solo un administrador o coordinador puede editar ciclos." };

  const supabase = await createClient();
  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) patch.name = input.name.trim();
  if (input.startDate !== undefined) patch.start_date = input.startDate;
  if (input.endDate !== undefined) patch.end_date = input.endDate;
  if (input.objective !== undefined) patch.objective = input.objective;
  if (input.observaciones !== undefined) patch.observaciones = input.observaciones;
  if (input.responsibleId !== undefined) patch.responsible_id = input.responsibleId;
  if (input.status !== undefined) patch.status = input.status;

  const { error } = await supabase.from("ciclos").update(patch as never).eq("id", id);
  if (error) {
    console.error("updateCiclo() falló:", error);
    return { error: "No se pudo actualizar el ciclo." };
  }

  revalidatePath("/plataforma/entrenamientos/planificacion");
  return { success: true };
}

export interface MicrocicloInput {
  cicloId: string;
  name: string;
  type: Enums<"microciclo_type">;
  startDate: string;
  endDate: string;
  objectiveMain?: string | null;
  objectivesSecondary?: string[];
  observaciones?: string | null;
  responsibleId?: string | null;
  status?: Enums<"plan_status">;
}

/** Crea un microciclo (agrupación de entrenamientos con un objetivo concreto) dentro de un ciclo. */
export async function createMicrociclo(input: MicrocicloInput): Promise<PlanActionState> {
  const staff = await requireMicrocicloStaff();
  if (!staff) return { error: "Solo un administrador, coordinador o entrenador puede crear microciclos." };
  if (!input.name.trim() || !input.cicloId || !input.startDate || !input.endDate) {
    return { error: "Nombre, ciclo y fechas son obligatorios." };
  }

  const academia = await getPrimaryAcademia();
  if (!academia) return { error: "No se encontró la academia activa." };

  const supabase = await createClient();
  const { error } = await supabase.from("microciclos").insert({
    academia_id: academia.id,
    ciclo_id: input.cicloId,
    name: input.name.trim(),
    type: input.type,
    start_date: input.startDate,
    end_date: input.endDate,
    objective_main: input.objectiveMain ?? null,
    objectives_secondary: input.objectivesSecondary ?? [],
    observaciones: input.observaciones ?? null,
    responsible_id: input.responsibleId ?? null,
    status: input.status ?? "planificado",
  });

  if (error) {
    console.error("createMicrociclo() falló:", error);
    return { error: "No se pudo crear el microciclo." };
  }

  revalidatePath("/plataforma/entrenamientos/planificacion");
  return { success: true };
}

/** Edita un microciclo existente. */
export async function updateMicrociclo(id: string, input: Partial<MicrocicloInput>): Promise<PlanActionState> {
  const staff = await requireMicrocicloStaff();
  if (!staff) return { error: "Solo un administrador, coordinador o entrenador puede editar microciclos." };

  const supabase = await createClient();
  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) patch.name = input.name.trim();
  if (input.type !== undefined) patch.type = input.type;
  if (input.startDate !== undefined) patch.start_date = input.startDate;
  if (input.endDate !== undefined) patch.end_date = input.endDate;
  if (input.objectiveMain !== undefined) patch.objective_main = input.objectiveMain;
  if (input.objectivesSecondary !== undefined) patch.objectives_secondary = input.objectivesSecondary;
  if (input.observaciones !== undefined) patch.observaciones = input.observaciones;
  if (input.responsibleId !== undefined) patch.responsible_id = input.responsibleId;
  if (input.status !== undefined) patch.status = input.status;

  const { error } = await supabase.from("microciclos").update(patch as never).eq("id", id);
  if (error) {
    console.error("updateMicrociclo() falló:", error);
    return { error: "No se pudo actualizar el microciclo." };
  }

  revalidatePath("/plataforma/entrenamientos/planificacion");
  return { success: true };
}
