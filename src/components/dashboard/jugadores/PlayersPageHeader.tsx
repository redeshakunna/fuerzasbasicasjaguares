import Image from "next/image";
import { Download, Upload } from "lucide-react";
import { DashboardButton } from "../ui/Button";
import { RegisterPlayerDialog } from "./RegisterPlayerDialog";
import { CategorySelector } from "../CategorySelector";
import type { Category } from "@/lib/data/categories";

/** Encabezado de "Gestión de Jugadores" — título, selector de categoría, foto del plantel y acciones. */
export function PlayersPageHeader({ category }: { category: Category }) {
  return (
    <div>
      <div className="relative overflow-hidden rounded-[18px]">
        <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h1 className="text-[26px] font-extrabold leading-snug text-jaguar-ink lg:text-[30px]">
                Gestión de <span className="text-jaguar-green-600">Jugadores</span>
              </h1>
              <CategorySelector active={category} basePath="/plataforma/jugadores" />
            </div>
            <p className="mt-1.5 max-w-md text-[14px] lg:text-[15.5px] text-jaguar-ink/55">
              Administra, evalúa y realiza seguimiento al desarrollo de cada futbolista.
            </p>
          </div>

          <div className="relative hidden h-[150px] overflow-hidden rounded-[18px] lg:block">
            <Image
              src="/brand/Banner Central Dashboard.png"
              alt="Plantel Sub-15 Fuerzas Básicas Jaguares"
              fill
              sizes="360px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-jaguar-mist/95 via-jaguar-mist/10 to-transparent" />
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <RegisterPlayerDialog />
        <DashboardButton variant="secondary" icon={<Upload className="h-4 w-4" strokeWidth={2} />}>
          Importar jugadores
        </DashboardButton>
        <DashboardButton variant="secondary" icon={<Download className="h-4 w-4" strokeWidth={2} />}>
          Exportar
        </DashboardButton>
      </div>
    </div>
  );
}
