"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentStaffProfile } from "@/lib/data/player-profile";

/** Marca el onboarding guiado como visto — no vuelve a aparecer para este usuario. */
export async function markOnboarded(): Promise<void> {
  const staff = await getCurrentStaffProfile();
  if (!staff) return;

  const supabase = await createClient();
  await supabase.from("profiles").update({ onboarded_at: new Date().toISOString() }).eq("id", staff.id);

  revalidatePath("/plataforma");
}
