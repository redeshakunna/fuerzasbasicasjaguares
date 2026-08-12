import { redirect, notFound } from "next/navigation";
import { getTrainingById } from "@/lib/data/trainings";

export const dynamic = "force-dynamic";

interface EvaluarRedirectPageProps {
  params: Promise<{ id: string; playerId: string }>;
}

/**
 * Ruta heredada — las Evaluaciones ahora viven como módulo propio (`/plataforma/evaluaciones`),
 * con el Drawer de 5 indicadores y resumen asistido. Este enlace sigue funcionando: entra
 * directo a esa sesión (el jugador se abre desde la lista, ya no hace falta la ruta por jugador).
 */
export default async function EvaluarRedirectPage({ params }: EvaluarRedirectPageProps) {
  const { id } = await params;
  const training = await getTrainingById(id);
  if (!training) notFound();

  redirect(`/plataforma/evaluaciones?categoria=${training.category}&sesion=${id}`);
}
