import Link from "next/link";
import { Dumbbell, Sparkles } from "lucide-react";
import { TrainingCard } from "@/components/dashboard/entrenamientos/TrainingCard";
import { getTrainings } from "@/lib/data/trainings";

export const dynamic = "force-dynamic";

/**
 * Entrenamientos — sesiones de la categoría Sub-15. Cada sesión es el punto
 * de partida para registrar la evaluación de cada jugador (ver sesión →
 * roster → "Evaluar").
 */
export default async function EntrenamientosPage() {
  const trainings = await getTrainings();
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = trainings.filter((t) => t.session_date >= today);
  const past = trainings.filter((t) => t.session_date < today);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold leading-snug text-jaguar-ink lg:text-[30px]">
            <span className="text-jaguar-green-600">Entrenamientos</span>
          </h1>
          <p className="mt-1.5 max-w-md text-[14px] lg:text-[15.5px] text-jaguar-ink/55">
            Programa sesiones y registra la evaluación de cada jugador — categoría Sub-15.
          </p>
        </div>
        <Link
          href="/plataforma/entrenamientos/nueva"
          className="inline-flex items-center gap-2 rounded-xl bg-jaguar-green-600 px-4 py-2.5 text-[13.5px] lg:text-[15px] font-semibold text-white shadow-[0_1px_2px_rgba(13,18,16,0.08)] transition-colors hover:bg-jaguar-green-700"
        >
          <Sparkles className="h-4 w-4" strokeWidth={2.25} aria-hidden />
          Nueva sesión
        </Link>
      </div>

      {trainings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[18px] border border-dashed border-jaguar-ink/12 py-16 text-center">
          <Dumbbell className="h-8 w-8 text-jaguar-ink/20" strokeWidth={1.6} aria-hidden />
          <p className="mt-3 text-[14px] lg:text-[15.5px] font-semibold text-jaguar-ink/60">Aún no hay sesiones programadas.</p>
          <p className="mt-1 text-[13px] lg:text-[14px] text-jaguar-ink/40">Crea la primera con &ldquo;Nueva sesión&rdquo;.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {upcoming.length > 0 ? (
            <section>
              <h2 className="mb-3 text-[13px] lg:text-[14px] font-bold uppercase tracking-[0.03em] text-jaguar-ink/45">
                Próximas sesiones
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {upcoming.map((training) => (
                  <TrainingCard key={training.id} training={training} />
                ))}
              </div>
            </section>
          ) : null}

          {past.length > 0 ? (
            <section>
              <h2 className="mb-3 text-[13px] lg:text-[14px] font-bold uppercase tracking-[0.03em] text-jaguar-ink/45">
                Sesiones anteriores
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {past.map((training) => (
                  <TrainingCard key={training.id} training={training} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}
