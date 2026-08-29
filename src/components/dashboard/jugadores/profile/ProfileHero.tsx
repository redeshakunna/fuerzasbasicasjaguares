import Image from "next/image";
import { Badge } from "../../ui/Badge";
import { Card } from "../../ui/Card";
import { StarRating } from "../../ui/StarRating";
import { PerformanceGroupToggle } from "./PerformanceGroupToggle";
import { PromotionToggle } from "./PromotionToggle";
import { getFullName } from "@/lib/data/players-stats";
import { getPositionCoordinates } from "@/lib/data/player-profile-view";
import { nextCategory as getNextCategory } from "@/lib/data/categories";
import type { Tables } from "@/lib/supabase/database.types";
import type { EstadoGeneral } from "@/lib/data/player-profile-view";

type PlayerRow = Tables<"players">;

const statusDotClass: Record<PlayerRow["status"], string> = {
  Disponible: "bg-jaguar-green-500",
  Suspendido: "bg-jaguar-gold-500",
  Lesionado: "bg-jaguar-maroon-500",
};

const ringToneClass: Record<EstadoGeneral["tone"], string> = {
  green: "stroke-jaguar-green-500",
  gold: "stroke-jaguar-gold-500",
  maroon: "stroke-jaguar-maroon-500",
};

function formatBirthDate(birthDate: string) {
  const [y, m, d] = birthDate.split("-");
  return `${d}/${m}/${y}`;
}

interface ProfileHeroProps {
  player: PlayerRow;
  age: number;
  evaluationsUpToDate: boolean;
  estadoGeneral: EstadoGeneral;
  canEditPerformanceGroup: boolean;
  canEditPromotion: boolean;
}

export function ProfileHero({
  player,
  age,
  evaluationsUpToDate,
  estadoGeneral,
  canEditPerformanceGroup,
  canEditPromotion,
}: ProfileHeroProps) {
  const circumference = 2 * Math.PI * 42;
  const progress = (estadoGeneral.score / 10) * circumference;
  const fullName = getFullName(player);
  const nextCategory = getNextCategory(player.category);

  // La cancha del header va en horizontal (arco propio ↔ arco rival), así que
  // invertimos la profundidad (y) de la coordenada vertical que ya usa la
  // versión de la pestaña "Información general".
  const position = getPositionCoordinates(player.position, player.position_group);
  const pitchLeft = 100 - position.y;
  const pitchTop = position.x;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <Card className="p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-stretch">
          <div className="flex flex-1 flex-col gap-5 sm:flex-row sm:items-start">
            <div className="flex shrink-0 items-start gap-3">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-jaguar-mist ring-1 ring-jaguar-ink/8">
                <Image src={player.photo_url || "/brand/default-avatar.png"} alt={fullName} fill sizes="96px" className="object-cover" />
                <span
                  className={`absolute bottom-1.5 right-1.5 h-3.5 w-3.5 rounded-full ring-2 ring-white ${statusDotClass[player.status]}`}
                  title={player.status}
                />
              </div>

              <div
                className="flex h-24 w-[72px] shrink-0 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-jaguar-green-500 via-jaguar-green-600 to-jaguar-turquoise-500 text-white shadow-[0_10px_28px_-10px_rgba(20,92,44,0.55)] ring-1 ring-white/10"
                title="Dorsal"
              >
                <span className="text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.1em] text-white/55">Dorsal</span>
                <span className="text-[36px] font-black leading-none tabular-nums">
                  {player.jersey_number ?? "—"}
                </span>
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-[22px] lg:text-[24px] font-extrabold leading-tight text-jaguar-ink">{fullName}</h1>
                {player.nickname ? (
                  <span className="text-[15px] lg:text-[16.5px] font-semibold italic text-jaguar-green-600/80">
                    &ldquo;{player.nickname}&rdquo;
                  </span>
                ) : null}
                <Badge tone="green">{player.category}</Badge>
                <Badge tone="turquoise">{player.position}</Badge>
                <PerformanceGroupToggle
                  playerId={player.id}
                  initialGroup={player.performance_group}
                  editable={canEditPerformanceGroup}
                />
              </div>
              <p className="mt-1.5 text-[12.5px] lg:text-[13.5px] text-jaguar-ink/45">
                {age} años · {formatBirthDate(player.birth_date)}
              </p>
              <div className="mt-2">
                <PromotionToggle
                  playerId={player.id}
                  initialReady={player.promotion_ready}
                  nextCategory={nextCategory}
                  editable={canEditPromotion}
                />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-jaguar-ink/6 pt-4 sm:grid-cols-4">
                <div>
                  <p className="text-[10.5px] lg:text-[11.5px] font-medium uppercase tracking-[0.03em] text-jaguar-ink/40">Altura</p>
                  <p className="mt-0.5 text-[13px] lg:text-[14px] font-semibold text-jaguar-ink">
                    {player.height_cm ? `${(player.height_cm / 100).toFixed(2)} m` : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10.5px] lg:text-[11.5px] font-medium uppercase tracking-[0.03em] text-jaguar-ink/40">Peso</p>
                  <p className="mt-0.5 text-[13px] lg:text-[14px] font-semibold text-jaguar-ink">
                    {player.weight_kg ? `${player.weight_kg} kg` : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10.5px] lg:text-[11.5px] font-medium uppercase tracking-[0.03em] text-jaguar-ink/40">Pie hábil</p>
                  <p className="mt-0.5 text-[13px] lg:text-[14px] font-semibold text-jaguar-ink">{player.dominant_foot ?? "—"}</p>
                </div>
                <div>
                  <p className="text-[10.5px] lg:text-[11.5px] font-medium uppercase tracking-[0.03em] text-jaguar-ink/40">Escolaridad</p>
                  <p className="mt-0.5 text-[13px] lg:text-[14px] font-semibold text-jaguar-ink">{player.school_grade ?? "—"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-jaguar-ink/6 pt-5 md:w-[250px] md:shrink-0 md:border-l md:border-t-0 md:pl-6 md:pt-0">
            <p className="text-[10.5px] lg:text-[11.5px] font-medium uppercase tracking-[0.03em] text-jaguar-ink/40">
              Posición en la cancha
            </p>
            <div className="relative mt-2.5 aspect-[16/10] overflow-hidden rounded-xl bg-jaguar-green-600">
              <svg viewBox="0 0 160 100" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
                <rect x="3" y="3" width="154" height="94" fill="none" stroke="white" strokeOpacity="0.35" strokeWidth="1.2" />
                <line x1="80" y1="3" x2="80" y2="97" stroke="white" strokeOpacity="0.35" strokeWidth="1.2" />
                <circle cx="80" cy="50" r="15" fill="none" stroke="white" strokeOpacity="0.35" strokeWidth="1.2" />
                <rect x="3" y="26" width="18" height="48" fill="none" stroke="white" strokeOpacity="0.35" strokeWidth="1.2" />
                <rect x="139" y="26" width="18" height="48" fill="none" stroke="white" strokeOpacity="0.35" strokeWidth="1.2" />
              </svg>
              <div
                className="absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-jaguar-gold-400 ring-2 ring-white shadow-[0_0_0_4px_rgba(255,255,255,0.15)]"
                style={{ left: `${pitchLeft}%`, top: `${pitchTop}%` }}
                title={player.position}
              />
            </div>
            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-[11.5px] lg:text-[12.5px] text-jaguar-ink/50">Principal</span>
              <span className="text-[12px] lg:text-[13px] font-bold text-jaguar-ink">{player.position}</span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <p className="text-[12.5px] lg:text-[13.5px] font-bold uppercase tracking-[0.03em] text-jaguar-ink/45">Estado General</p>
        <div className="mt-3 flex items-center gap-4">
          <div className="relative flex h-[92px] w-[92px] shrink-0 items-center justify-center">
            <svg viewBox="0 0 96 96" className="h-full w-full -rotate-90">
              <circle cx="48" cy="48" r="42" fill="none" strokeWidth="7" className="stroke-jaguar-ink/8" />
              <circle
                cx="48"
                cy="48"
                r="42"
                fill="none"
                strokeWidth="7"
                strokeLinecap="round"
                className={ringToneClass[estadoGeneral.tone]}
                strokeDasharray={`${progress} ${circumference}`}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-[20px] lg:text-[22px] font-extrabold text-jaguar-ink">{estadoGeneral.score.toFixed(1)}</span>
              <span className="text-[9.5px] lg:text-[10.5px] font-semibold text-jaguar-ink/40">/ 10</span>
            </div>
          </div>
          <p className="text-[13.5px] lg:text-[15px] font-bold text-jaguar-ink">{estadoGeneral.label}</p>
        </div>

        <div className="mt-5 space-y-2.5 border-t border-jaguar-ink/6 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] lg:text-[13.5px] text-jaguar-ink/55">Rendimiento</span>
            <StarRating value={player.rating ?? 0} size={12} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] lg:text-[13.5px] text-jaguar-ink/55">Estado físico</span>
            <span className="flex items-center gap-1.5 text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-ink">
              <span className={`h-1.5 w-1.5 rounded-full ${statusDotClass[player.status]}`} />
              {player.status}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] lg:text-[13.5px] text-jaguar-ink/55">Asistencia</span>
            <span className="text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-ink/40">Sin registros</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] lg:text-[13.5px] text-jaguar-ink/55">Evaluaciones</span>
            <span className="text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-ink">
              {evaluationsUpToDate ? "Al día" : "Pendientes"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] lg:text-[13.5px] text-jaguar-ink/55">Documentación</span>
            <Badge tone={player.documents_status === "Completo" ? "green" : "gold"}>
              {player.documents_status}
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}
