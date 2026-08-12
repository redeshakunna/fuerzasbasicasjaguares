"use server";

import { redirect } from "next/navigation";
import { createClient } from "./server";

/** Server Action — cierra la sesión y vuelve al login. */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/plataforma/login");
}
