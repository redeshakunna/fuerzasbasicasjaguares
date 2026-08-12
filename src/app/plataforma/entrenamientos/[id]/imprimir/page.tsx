import { notFound } from "next/navigation";
import { getTrainingById } from "@/lib/data/trainings";
import { blankSessionPlan } from "@/lib/training/session-generator";
import { PrintSession } from "@/components/dashboard/entrenamientos/PrintSession";
import type { SessionPlan } from "@/lib/training/session-types";

export const dynamic = "force-dynamic";

interface ImprimirPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Vista de impresión — fuera del grupo (dashboard) a propósito: sin
 * sidebar/header, lista para "Guardar como PDF" desde el navegador.
 */
export default async function ImprimirSesionPage({ params }: ImprimirPageProps) {
  const { id } = await params;
  const training = await getTrainingById(id);
  if (!training) notFound();

  const session =
    (training.session as SessionPlan | null) ??
    blankSessionPlan({ objectives: (training.objective ?? "Técnica").split(", "), category: training.category });

  return <PrintSession training={training} session={session} />;
}
