import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { TrainingWizard } from "@/components/dashboard/entrenamientos/TrainingWizard";
import { getTrainingTemplates } from "@/lib/data/training-templates";
import { getCurrentStaffProfile } from "@/lib/data/player-profile";

export const dynamic = "force-dynamic";

/** Wizard de creación de sesión — genera con IA, desde plantilla, o desde cero. */
export default async function NuevaSesionPage() {
  const [templates, staff] = await Promise.all([getTrainingTemplates(), getCurrentStaffProfile()]);

  return (
    <div className="space-y-6">
      <Link
        href="/plataforma/entrenamientos"
        className="inline-flex items-center gap-1 text-[13px] lg:text-[14px] font-semibold text-jaguar-ink/60 hover:text-jaguar-green-600"
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={2.25} aria-hidden />
        Entrenamientos
      </Link>

      <TrainingWizard templates={templates} coachName={staff?.fullName ?? "Entrenador"} />
    </div>
  );
}
