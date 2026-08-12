"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Building2, Calendar, LayoutGrid, Plus, ShieldCheck, Users } from "lucide-react";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Avatar } from "../ui/Avatar";
import { createTemporada, updateReportCadence, updateStaffRole } from "@/app/plataforma/(dashboard)/configuracion/actions";
import { categories, activeCategories } from "@/lib/data/categories";
import type { AcademiaRow, TemporadaRow } from "@/lib/data/academia";
import type { StaffProfile } from "@/lib/data/staff";
import type { Enums } from "@/lib/supabase/database.types";

const tabs = [
  { id: "organizacion", label: "Organización", icon: Building2 },
  { id: "categorias", label: "Categorías", icon: LayoutGrid },
  { id: "temporadas", label: "Temporadas", icon: Calendar },
  { id: "entrenadores", label: "Entrenadores", icon: Users },
  { id: "usuarios", label: "Usuarios y Permisos", icon: ShieldCheck },
] as const;

type TabId = (typeof tabs)[number]["id"];

const roleLabel: Record<Enums<"user_role">, string> = {
  admin: "Administrador",
  directivo: "Directivo",
  coordinador: "Coordinador",
  entrenador: "Entrenador",
  padre: "Padre de familia",
};

const roleOptions: Enums<"user_role">[] = ["admin", "directivo", "coordinador", "entrenador"];

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  const monthShort = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  return `${Number(d)} ${monthShort[Number(m) - 1]} ${y}`;
}

export function ConfiguracionTabs({
  academia,
  temporadas,
  staff,
  isAdmin,
}: {
  academia: AcademiaRow | null;
  temporadas: TemporadaRow[];
  staff: StaffProfile[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("organizacion");
  const [isPending, startTransition] = useTransition();
  const [showNewTemporada, setShowNewTemporada] = useState(false);
  const [temporadaName, setTemporadaName] = useState("");
  const [temporadaStart, setTemporadaStart] = useState("");
  const [temporadaEnd, setTemporadaEnd] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submitTemporada() {
    setError(null);
    startTransition(async () => {
      const result = await createTemporada({ name: temporadaName, startDate: temporadaStart, endDate: temporadaEnd });
      if (result.error) {
        setError(result.error);
        return;
      }
      setShowNewTemporada(false);
      setTemporadaName("");
      setTemporadaStart("");
      setTemporadaEnd("");
      router.refresh();
    });
  }

  function changeRole(profileId: string, role: Enums<"user_role">) {
    startTransition(async () => {
      await updateStaffRole(profileId, role);
      router.refresh();
    });
  }

  function changeCadence(cadence: "mensual" | "quincenal") {
    startTransition(async () => {
      await updateReportCadence(cadence);
      router.refresh();
    });
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
      <div className="space-y-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-[13px] lg:text-[14px] font-semibold transition-colors ${
                active ? "bg-jaguar-green-600 text-white" : "text-jaguar-ink/60 hover:bg-jaguar-ink/[0.04]"
              }`}
            >
              <Icon className="h-4 w-4" strokeWidth={1.9} aria-hidden />
              {t.label}
            </button>
          );
        })}
        <Link
          href="/plataforma/finanzas/conceptos"
          className="flex w-full items-center justify-between gap-2.5 rounded-xl px-3.5 py-2.5 text-[13px] lg:text-[14px] font-semibold text-jaguar-ink/60 transition-colors hover:bg-jaguar-ink/[0.04]"
        >
          Conceptos de cobro
          <ArrowRight className="h-3.5 w-3.5 text-jaguar-ink/30" strokeWidth={2.25} aria-hidden />
        </Link>
      </div>

      <Card className="p-6">
        {tab === "organizacion" ? (
          <div className="space-y-3">
            <p className="text-[14px] lg:text-[15.5px] font-bold text-jaguar-ink">Datos de la academia</p>
            {academia ? (
              <div className="mt-2 space-y-2.5">
                <div className="flex items-center justify-between rounded-xl border border-jaguar-ink/8 px-4 py-3.5">
                  <p className="text-[12.5px] lg:text-[13.5px] text-jaguar-ink/50">Nombre</p>
                  <p className="text-[13px] lg:text-[14px] font-semibold text-jaguar-ink">{academia.name}</p>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-jaguar-ink/8 px-4 py-3.5">
                  <p className="text-[12.5px] lg:text-[13.5px] text-jaguar-ink/50">Identificador</p>
                  <p className="text-[13px] lg:text-[14px] font-semibold text-jaguar-ink">{academia.slug}</p>
                </div>
              </div>
            ) : (
              <p className="text-[12.5px] lg:text-[13.5px] text-jaguar-ink/45">No se encontró información de la academia.</p>
            )}
            <p className="mt-2 text-[11.5px] lg:text-[12.5px] text-jaguar-ink/35">
              Edición de identidad institucional y multi-academia — próximamente.
            </p>

            <div className="mt-5 border-t border-jaguar-ink/8 pt-5">
              <p className="text-[14px] lg:text-[15.5px] font-bold text-jaguar-ink">Cadencia de informes</p>
              <p className="mt-1 text-[12.5px] lg:text-[13.5px] text-jaguar-ink/45">
                Define cada cuánto la plataforma recuerda generar los informes de evolución. El envío a las familias
                siempre lo confirma el técnico a mano — esto solo controla el recordatorio.
              </p>
              <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {(["mensual", "quincenal"] as const).map((c) => {
                  const active = (academia?.report_cadence ?? "mensual") === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      disabled={!isAdmin || isPending}
                      onClick={() => changeCadence(c)}
                      className={`rounded-xl border px-4 py-3.5 text-left transition-colors ${
                        active
                          ? "border-jaguar-green-500/30 bg-jaguar-green-50"
                          : "border-jaguar-ink/8 hover:bg-jaguar-ink/[0.03]"
                      } ${!isAdmin ? "cursor-not-allowed opacity-60" : ""}`}
                    >
                      <p className={`text-[13px] lg:text-[14px] font-semibold ${active ? "text-jaguar-green-700" : "text-jaguar-ink"}`}>
                        {c === "mensual" ? "Mensual" : "Quincenal"}
                      </p>
                      <p className="mt-0.5 text-[11.5px] lg:text-[12.5px] text-jaguar-ink/45">
                        {c === "mensual" ? "Un recordatorio al mes, por categoría." : "Un recordatorio cada 15 días, por categoría."}
                      </p>
                    </button>
                  );
                })}
              </div>
              {!isAdmin ? (
                <p className="mt-2 text-[11.5px] lg:text-[12.5px] text-jaguar-ink/35">Solo un administrador puede cambiar esta configuración.</p>
              ) : null}
            </div>
          </div>
        ) : null}

        {tab === "categorias" ? (
          <div className="space-y-3">
            <p className="text-[14px] lg:text-[15.5px] font-bold text-jaguar-ink">Categorías formativas</p>
            <p className="text-[12.5px] lg:text-[13.5px] text-jaguar-ink/45">La plataforma inicia con Sub-15 activa; el resto se irá habilitando.</p>
            <div className="mt-2 space-y-2.5">
              {categories.map((cat) => (
                <div key={cat} className="flex items-center justify-between rounded-xl border border-jaguar-ink/8 px-4 py-3.5">
                  <p className="text-[13px] lg:text-[14px] font-semibold text-jaguar-ink">{cat}</p>
                  {activeCategories.includes(cat) ? (
                    <Badge tone="green">Activa</Badge>
                  ) : (
                    <Badge tone="neutral">Próximamente</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {tab === "temporadas" ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[14px] lg:text-[15.5px] font-bold text-jaguar-ink">Temporadas</p>
                <p className="text-[12.5px] lg:text-[13.5px] text-jaguar-ink/45">Cada temporada agrupa entrenamientos, partidos y evaluaciones.</p>
              </div>
              {isAdmin ? (
                <button
                  type="button"
                  onClick={() => setShowNewTemporada((v) => !v)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-jaguar-ink/10 px-3 py-1.5 text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-ink/70 hover:bg-jaguar-ink/[0.03]"
                >
                  <Plus className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
                  Nueva
                </button>
              ) : null}
            </div>

            {showNewTemporada ? (
              <div className="rounded-2xl border border-jaguar-ink/10 bg-jaguar-mist/40 p-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <label className="block">
                    <span className="text-[11.5px] lg:text-[12.5px] font-semibold text-jaguar-ink/55">Nombre</span>
                    <input
                      value={temporadaName}
                      onChange={(e) => setTemporadaName(e.target.value)}
                      placeholder="2027"
                      className="mt-1 w-full rounded-lg border border-jaguar-ink/10 bg-white px-3 py-2 text-[13px] lg:text-[14px]"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[11.5px] lg:text-[12.5px] font-semibold text-jaguar-ink/55">Inicio</span>
                    <input
                      type="date"
                      value={temporadaStart}
                      onChange={(e) => setTemporadaStart(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-jaguar-ink/10 bg-white px-3 py-2 text-[13px] lg:text-[14px]"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[11.5px] lg:text-[12.5px] font-semibold text-jaguar-ink/55">Fin</span>
                    <input
                      type="date"
                      value={temporadaEnd}
                      onChange={(e) => setTemporadaEnd(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-jaguar-ink/10 bg-white px-3 py-2 text-[13px] lg:text-[14px]"
                    />
                  </label>
                </div>
                {error ? <p className="mt-2 text-[11.5px] lg:text-[12.5px] font-medium text-jaguar-maroon-600">{error}</p> : null}
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNewTemporada(false)}
                    className="rounded-lg px-3 py-1.5 text-[12px] lg:text-[13px] font-semibold text-jaguar-ink/55 hover:bg-jaguar-ink/[0.04]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={submitTemporada}
                    disabled={isPending || !temporadaName || !temporadaStart || !temporadaEnd}
                    className="rounded-lg bg-jaguar-green-600 px-3.5 py-1.5 text-[12px] lg:text-[13px] font-semibold text-white hover:bg-jaguar-green-700 disabled:opacity-60"
                  >
                    {isPending ? "Creando…" : "Crear temporada"}
                  </button>
                </div>
              </div>
            ) : null}

            <div className="mt-2 space-y-2.5">
              {temporadas.length === 0 ? (
                <p className="text-[12.5px] lg:text-[13.5px] text-jaguar-ink/45">Aún no hay temporadas creadas.</p>
              ) : (
                temporadas.map((t) => (
                  <div key={t.id} className="flex items-center justify-between rounded-xl border border-jaguar-ink/8 px-4 py-3.5">
                    <div>
                      <p className="text-[13px] lg:text-[14px] font-semibold text-jaguar-ink">Temporada {t.name}</p>
                      <p className="text-[11.5px] lg:text-[12.5px] text-jaguar-ink/45">
                        {formatDate(t.start_date)} – {formatDate(t.end_date)}
                      </p>
                    </div>
                    {t.is_active ? <Badge tone="green">Activa</Badge> : <Badge tone="neutral">Cerrada</Badge>}
                  </div>
                ))
              )}
            </div>
          </div>
        ) : null}

        {tab === "entrenadores" ? (
          <div className="space-y-3">
            <p className="text-[14px] lg:text-[15.5px] font-bold text-jaguar-ink">Cuerpo técnico</p>
            <p className="text-[12.5px] lg:text-[13.5px] text-jaguar-ink/45">Entrenadores, coordinadores y directivos de la academia.</p>
            <div className="mt-2 space-y-2">
              {staff.length === 0 ? (
                <p className="text-[12.5px] lg:text-[13.5px] text-jaguar-ink/45">Aún no hay staff registrado.</p>
              ) : (
                staff
                  .filter((s) => s.role !== "admin")
                  .map((s) => (
                    <div key={s.id} className="flex items-center gap-3 rounded-xl border border-jaguar-ink/8 px-4 py-3">
                      <Avatar initials={s.full_name.slice(0, 2).toUpperCase()} size={36} photoUrl={s.avatar_url} />
                      <div className="flex-1">
                        <p className="text-[13px] lg:text-[14px] font-semibold text-jaguar-ink">{s.full_name}</p>
                        <p className="text-[11.5px] lg:text-[12.5px] text-jaguar-ink/45">{roleLabel[s.role]}</p>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        ) : null}

        {tab === "usuarios" ? (
          <div className="space-y-3">
            <p className="text-[14px] lg:text-[15.5px] font-bold text-jaguar-ink">Usuarios y permisos</p>
            <p className="text-[12.5px] lg:text-[13.5px] text-jaguar-ink/45">
              {isAdmin ? "Como administrador puedes cambiar el rol de cada usuario." : "Solo un administrador puede modificar roles."}
            </p>
            <div className="mt-2 space-y-2">
              {staff.map((s) => (
                <div key={s.id} className="flex items-center gap-3 rounded-xl border border-jaguar-ink/8 px-4 py-3">
                  <Avatar initials={s.full_name.slice(0, 2).toUpperCase()} size={36} photoUrl={s.avatar_url} />
                  <div className="flex-1">
                    <p className="text-[13px] lg:text-[14px] font-semibold text-jaguar-ink">{s.full_name}</p>
                  </div>
                  {isAdmin ? (
                    <select
                      defaultValue={s.role}
                      onChange={(e) => changeRole(s.id, e.target.value as Enums<"user_role">)}
                      disabled={isPending}
                      className="rounded-lg border border-jaguar-ink/10 bg-white px-2.5 py-1.5 text-[12px] lg:text-[13px] font-semibold text-jaguar-ink"
                    >
                      {roleOptions.map((r) => (
                        <option key={r} value={r}>
                          {roleLabel[r]}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Badge tone="neutral">{roleLabel[s.role]}</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
