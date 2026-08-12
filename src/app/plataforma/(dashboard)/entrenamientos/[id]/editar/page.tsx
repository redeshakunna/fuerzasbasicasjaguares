import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { SessionEditor } from "@/components/dashboard/entrenamientos/SessionEditor";
import { getTrainingById } from "@/lib/data/trainings";
import { blankSessionPlan } from "@/lib/training/session-generator";
import type { SessionPlan } from "@/lib/training/session-types";

export const dynamic = "force-dynamic";

interface EditarSesionPageProps {
  params: Promise<{ id: string }>;
}

/** Editor de la sesión — usado tanto para completar una sesión manual como para ajustar una generada. */
export default async function EditarSesionPage({ params }: EditarSesionPageProps) {
  const { id } = await params;
  const training = await getTrainingById(id);
  if (!training) notFound();

  const session =
    (training.session as SessionPlan | null) ??
    blankSessionPlan({ objectives: (training.objective ?? "Técnica").split(", "), category: training.category });

  return (
    <div className="mx-auto max-w-[880px] space-y-6">
      <div className="flex items-center gap-2 text-[13px] lg:text-[14px] text-jaguar-ink/50">
        <Link
          href={`/plataforma/entrenamientos/${id}`}
          className="flex items-center gap-1 font-semibold text-jaguar-ink/60 hover:text-jaguar-green-600"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2.25} aria-hidden />
          {training.title}
        </Link>
        <span className="text-jaguar-ink/25">/</span>
        <span className="font-semibold text-jaguar-ink">Editar sesión</span>
      </div>

      <h1 className="text-[22px] lg:text-[24px] font-extrabold text-jaguar-ink">Editar sesión</h1>

      <SessionEditor trainingId={id} initialSession={session} />
    </div>
  );
}
