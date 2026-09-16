import { createClient } from "@/lib/supabase/server";

export type InjurySeverity = "Leve" | "Moderada" | "Severa";

export interface InjuryRow {
  id: string;
  playerId: string;
  injuryType: string;
  severity: InjurySeverity;
  startDate: string;
  expectedRecoveryDate: string | null;
  recoveredAt: string | null;
  notes: string | null;
  createdByName: string | null;
  createdAt: string;
}

/** Historial de lesiones de un jugador — más reciente primero. */
export async function getPlayerInjuries(playerId: string): Promise<InjuryRow[]> {
  const supabase = await createClient();
  const { data: injuries, error } = await supabase
    .from("player_injuries")
    .select("*")
    .eq("player_id", playerId)
    .order("start_date", { ascending: false });

  if (error || !injuries) {
    console.error("getPlayerInjuries() falló:", error);
    return [];
  }
  if (injuries.length === 0) return [];

  const creatorIds = [...new Set(injuries.map((i) => i.created_by).filter((id): id is string => !!id))];
  const nameById = new Map<string, string>();
  if (creatorIds.length > 0) {
    const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", creatorIds);
    for (const p of profiles ?? []) nameById.set(p.id, p.full_name);
  }

  return injuries.map((i) => ({
    id: i.id,
    playerId: i.player_id,
    injuryType: i.injury_type,
    severity: i.severity as InjurySeverity,
    startDate: i.start_date,
    expectedRecoveryDate: i.expected_recovery_date,
    recoveredAt: i.recovered_at,
    notes: i.notes,
    createdByName: i.created_by ? (nameById.get(i.created_by) ?? null) : null,
    createdAt: i.created_at,
  }));
}

/** Lesión activa (sin recuperar) más reciente, si existe. */
export async function getActiveInjury(playerId: string): Promise<InjuryRow | null> {
  const all = await getPlayerInjuries(playerId);
  return all.find((i) => !i.recoveredAt) ?? null;
}
