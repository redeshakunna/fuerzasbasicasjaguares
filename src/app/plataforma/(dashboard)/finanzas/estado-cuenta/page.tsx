import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";
import { Card } from "@/components/dashboard/ui/Card";
import { Avatar } from "@/components/dashboard/ui/Avatar";
import { Badge } from "@/components/dashboard/ui/Badge";
import { FinanceSectionHeader } from "@/components/dashboard/finanzas/shared";
import { PlayerAccountTimeline } from "@/components/dashboard/finanzas/PlayerAccountTimeline";
import { getPlayers } from "@/lib/data/players";
import { getFullName } from "@/lib/data/players-stats";
import { getObligations } from "@/lib/data/finance";
import { formatCOP } from "@/lib/finance/format";

export const dynamic = "force-dynamic";

/** Estado de cuenta de un jugador — vista de tarjetas/timeline, no una tabla grande. */
export default async function EstadoCuentaPage() {
  const players = await getPlayers();
  const player = players[0] ?? null;
  const allObligations = player ? await getObligations() : [];
  const obligations = allObligations.filter((o) => o.playerId === player?.id);

  const totalRecaudado = obligations.filter((o) => o.status === "Pagado").reduce((s, o) => s + o.amount, 0);
  const totalPorCobrar = obligations.filter((o) => o.status !== "Pagado").reduce((s, o) => s + o.amount, 0);
  const initials = player ? `${player.first_name[0] ?? ""}${player.last_name[0] ?? ""}`.toUpperCase() : "—";

  return (
    <div className="space-y-6">
      <FinanceSectionHeader title="Estado de cuenta" subtitle="Historial financiero completo de un jugador." />

      {!player ? (
        <Card className="flex flex-col items-center gap-2 px-6 py-16 text-center">
          <p className="text-[13.5px] lg:text-[15px] font-bold text-jaguar-ink">Aún no hay jugadores registrados.</p>
        </Card>
      ) : (
        <>
          <Card className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <Avatar initials={initials} size={56} photoUrl={player.photo_url} />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[17px] lg:text-[18.5px] font-extrabold text-jaguar-ink">{getFullName(player)}</p>
                    <Badge tone="green">{player.status}</Badge>
                  </div>
                  <p className="mt-0.5 text-[13px] lg:text-[14px] text-jaguar-ink/50">
                    {player.category}
                    {player.jersey_number ? ` · #${player.jersey_number}` : ""}
                  </p>
                  {player.guardian_name ? (
                    <p className="mt-1 flex items-center gap-1.5 text-[12px] lg:text-[13px] text-jaguar-ink/40">
                      <Phone className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                      Acudiente: {player.guardian_name}
                      {player.guardian_phone ? ` · ${player.guardian_phone}` : ""}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="flex gap-6">
                <div className="text-right">
                  <p className="text-[11px] lg:text-[12px] font-bold uppercase tracking-[0.03em] text-jaguar-ink/40">Pagado</p>
                  <p className="mt-1 text-[18px] lg:text-[20px] font-extrabold text-jaguar-green-700">{formatCOP(totalRecaudado)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] lg:text-[12px] font-bold uppercase tracking-[0.03em] text-jaguar-ink/40">Pendiente</p>
                  <p className="mt-1 text-[18px] lg:text-[20px] font-extrabold text-jaguar-gold-600">{formatCOP(totalPorCobrar)}</p>
                </div>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2 border-t border-jaguar-ink/6 pt-4">
              <Link
                href="/plataforma/finanzas/registrar-pago"
                className="rounded-xl bg-jaguar-green-600 px-4 py-2 text-[12.5px] lg:text-[13.5px] font-semibold text-white transition-colors hover:bg-jaguar-green-700"
              >
                Registrar pago
              </Link>
              <Link
                href="/plataforma/finanzas/cuentas-por-cobrar"
                className="inline-flex items-center gap-1.5 rounded-xl border border-jaguar-ink/10 px-4 py-2 text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-ink/70 transition-colors hover:bg-jaguar-ink/[0.03]"
              >
                <MessageCircle className="h-3.5 w-3.5" strokeWidth={2.1} aria-hidden />
                Enviar recordatorio
              </Link>
            </div>
          </Card>

          {obligations.length === 0 ? (
            <Card className="flex flex-col items-center gap-2 px-6 py-14 text-center">
              <p className="text-[13px] lg:text-[14px] font-semibold text-jaguar-ink/50">Este jugador aún no tiene cargos registrados.</p>
            </Card>
          ) : (
            <PlayerAccountTimeline obligations={obligations} />
          )}
        </>
      )}
    </div>
  );
}
