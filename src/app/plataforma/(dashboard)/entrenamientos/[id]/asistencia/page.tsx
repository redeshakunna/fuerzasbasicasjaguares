import { redirect, notFound } from "next/navigation";
import { getTrainingById } from "@/lib/data/trainings";

export const dynamic = "force-dynamic";

interface AsistenciaRedirectPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Ruta heredada — la Asistencia ahora vive como módulo propio (`/plataforma/asistencia`),
 * con historial y KPIs. Este enlace sigue funcionando: entra directo a esa sesión.
 */
export default async function AsistenciaRedirectPage({ params }: AsistenciaRedirectPageProps) {
  const { id } = await params;
  const training = await getTrainingById(id);
  if (!training) notFound();

  redirect(`/plataforma/asistencia?categoria=${training.category}&sesion=${id}`);
}
