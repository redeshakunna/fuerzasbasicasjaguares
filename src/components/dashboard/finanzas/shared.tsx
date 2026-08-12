import type { ReactNode } from "react";
import { BadgeCheck, Clock, GraduationCap, Shirt, Trophy, Wallet } from "lucide-react";
import { Badge } from "../ui/Badge";
import type { ObligationStatus } from "@/lib/data/finance";

export const statusTone: Record<ObligationStatus, "green" | "gold" | "maroon" | "turquoise"> = {
  Pagado: "green",
  Pendiente: "gold",
  Vencido: "maroon",
  Parcial: "turquoise",
};

export function ObligationStatusBadge({ status }: { status: ObligationStatus }) {
  return <Badge tone={statusTone[status]}>{status}</Badge>;
}

const conceptIconMap: Record<string, typeof Wallet> = {
  Inscripción: BadgeCheck,
  Mensualidad: Clock,
  Uniforme: Shirt,
  Torneo: Trophy,
  Otros: GraduationCap,
};

const conceptIconClassMap: Record<string, string> = {
  Inscripción: "bg-jaguar-turquoise-500/10 text-jaguar-turquoise-600",
  Mensualidad: "bg-jaguar-green-50 text-jaguar-green-600",
  Uniforme: "bg-jaguar-gold-500/15 text-jaguar-gold-600",
  Torneo: "bg-violet-500/10 text-violet-600",
  Otros: "bg-jaguar-ink/6 text-jaguar-ink/50",
};

export function conceptIcon(concept: string): typeof Wallet {
  return conceptIconMap[concept] ?? Wallet;
}

export function conceptIconClass(concept: string): string {
  return conceptIconClassMap[concept] ?? "bg-jaguar-ink/6 text-jaguar-ink/50";
}

/** Encabezado consistente para todas las pantallas de Gestión Financiera. */
export function FinanceSectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-[26px] font-extrabold leading-snug text-jaguar-ink lg:text-[30px]">
          <span className="text-jaguar-green-600">{title}</span>
        </h1>
        <p className="mt-1.5 max-w-md text-[14px] lg:text-[15.5px] text-jaguar-ink/55">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}
