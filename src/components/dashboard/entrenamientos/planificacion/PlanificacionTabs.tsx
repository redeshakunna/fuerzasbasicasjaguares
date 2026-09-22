"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarRange, GitBranch, Plus, Repeat, Pencil } from "lucide-react";
import { Card } from "../../ui/Card";
import { Badge } from "../../ui/Badge";
import { createTemporada, updateTemporada } from "@/app/plataforma/(dashboard)/configuracion/actions";
import { createCiclo, updateCiclo, createMicrociclo, updateMicrociclo } from "@/app/plataforma/(dashboard)/entrenamientos/planificacion/actions";
import type { TemporadaRow } from "@/lib/data/academia";
import type { CicloRow } from "@/lib/data/ciclos";
import type { MicrocicloRow } from "@/lib/data/microciclos";
import type { StaffProfile } from "@/lib/data/staff";
import type { Enums } from "@/lib/supabase/database.types";
import { categories } from "@/lib/data/categories";

type PlanStatus = Enums<"plan_status">;
type MicrocicloType = Enums<"microciclo_type">;

const tabs = [
  { id: "temporadas", label: "Temporadas", icon: CalendarRange },
  { id: "ciclos", label: "Ciclos", icon: GitBranch },
  { id: "microciclos", label: "Microciclos", icon: Repeat },
] as const;

type TabId = (typeof tabs)[number]["id"];

const temporadaStatusLabel: Record<PlanStatus, string> = {
  planificado: "Planificada",
  activo: "Activa",
  finalizado: "Finalizada",
  archivado: "Archivada",
};

const cicloStatusLabel: Record<PlanStatus, string> = {
  planificado: "Planificado",
  activo: "Activo",
  finalizado: "Finalizado",
  archivado: "Archivado",
};

const statusTone: Record<PlanStatus, "neutral" | "green" | "gold" | "maroon"> = {
  planificado: "neutral",
  activo: "green",
  finalizado: "gold",
  archivado: "maroon",
};

const microcicloTypeLabel: Record<MicrocicloType, string> = {
  adaptacion: "Adaptación",
  carga: "Carga",
  desarrollo: "Desarrollo",
  competicion: "Competición",
  recuperacion: "Recuperación",
  descarga: "Descarga",
  transicion: "Transición",
  personalizado: "Personalizado",
};

const microcicloTypes = Object.keys(microcicloTypeLabel) as MicrocicloType[];
const planStatuses: PlanStatus[] = ["planificado", "activo", "finalizado", "archivado"];

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  const monthShort = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  return `${Number(d)} ${monthShort[Number(m) - 1]} ${y}`;
}

function daysBetween(startISO: string, endISO: string): number | null {
  if (!startISO || !endISO) return null;
  const start = new Date(`${startISO}T00:00:00`);
  const end = new Date(`${endISO}T00:00:00`);
  const diff = Math.round((end.getTime() - start.getTime()) / 86_400_000);
  return diff >= 0 ? diff + 1 : null;
}

const inputClass = "mt-1 w-full rounded-lg border border-jaguar-ink/10 bg-white px-3 py-2 text-[13px] lg:text-[14px]";
const labelClass = "text-[11.5px] lg:text-[12.5px] font-semibold text-jaguar-ink/55";

export function PlanificacionTabs({
  temporadas,
  ciclos,
  microciclos,
  staff,
  canManageCiclos,
  canManageMicrociclos,
}: {
  temporadas: TemporadaRow[];
  ciclos: CicloRow[];
  microciclos: MicrocicloRow[];
  staff: StaffProfile[];
  canManageCiclos: boolean;
  canManageMicrociclos: boolean;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("temporadas");

  const staffName = useMemo(() => {
    const map = new Map(staff.map((s) => [s.id, s.full_name]));
    return (id: string | null) => (id ? map.get(id) ?? "—" : "—");
  }, [staff]);

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
      </div>

      <Card className="p-6">
        {tab === "temporadas" ? (
          <TemporadasTab temporadas={temporadas} staff={staff} staffName={staffName} canManage={canManageCiclos} router={router} />
        ) : null}
        {tab === "ciclos" ? (
          <CiclosTab temporadas={temporadas} ciclos={ciclos} staff={staff} staffName={staffName} canManage={canManageCiclos} router={router} />
        ) : null}
        {tab === "microciclos" ? (
          <MicrociclosTab ciclos={ciclos} microciclos={microciclos} staff={staff} staffName={staffName} canManage={canManageMicrociclos} router={router} />
        ) : null}
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Temporadas                                                          */
/* ------------------------------------------------------------------ */

function TemporadasTab({
  temporadas,
  staff,
  staffName,
  canManage,
  router,
}: {
  temporadas: TemporadaRow[];
  staff: StaffProfile[];
  staffName: (id: string | null) => string;
  canManage: boolean;
  router: ReturnType<typeof useRouter>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [objective, setObjective] = useState("");
  const [responsibleId, setResponsibleId] = useState("");
  const [status, setStatus] = useState<PlanStatus>("planificado");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function resetForm() {
    setName("");
    setCategory("");
    setStartDate("");
    setEndDate("");
    setObjective("");
    setResponsibleId("");
    setStatus("planificado");
    setError(null);
  }

  function startCreate() {
    resetForm();
    setEditingId(null);
    setShowForm(true);
  }

  function startEdit(t: TemporadaRow) {
    setEditingId(t.id);
    setName(t.name);
    setCategory(t.category ?? "");
    setStartDate(t.start_date);
    setEndDate(t.end_date);
    setObjective(t.objective ?? "");
    setResponsibleId(t.responsible_id ?? "");
    setStatus(t.status);
    setError(null);
    setShowForm(true);
  }

  function submit() {
    setError(null);
    if (!name.trim() || !startDate || !endDate) {
      setError("Nombre y fechas son obligatorios.");
      return;
    }
    startTransition(async () => {
      const input = {
        name: name.trim(),
        startDate,
        endDate,
        category: category || null,
        objective: objective.trim() || null,
        responsibleId: responsibleId || null,
        status,
      };
      const result = editingId ? await updateTemporada(editingId, input) : await createTemporada(input);
      if (result.error) {
        setError(result.error);
        return;
      }
      setShowForm(false);
      setEditingId(null);
      resetForm();
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[14px] lg:text-[15.5px] font-bold text-jaguar-ink">Temporadas</p>
          <p className="text-[12.5px] lg:text-[13.5px] text-jaguar-ink/45">
            El nivel más alto de la planificación — por ejemplo &ldquo;Temporada 2026&rdquo;.
          </p>
        </div>
        {canManage ? (
          <button
            type="button"
            onClick={startCreate}
            className="inline-flex items-center gap-1.5 rounded-xl border border-jaguar-ink/10 px-3 py-1.5 text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-ink/70 hover:bg-jaguar-ink/[0.03]"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
            Nueva temporada
          </button>
        ) : null}
      </div>

      {showForm ? (
        <div className="rounded-2xl border border-jaguar-ink/10 bg-jaguar-mist/40 p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className={labelClass}>Nombre</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Temporada 2026" className={inputClass} />
            </label>
            <label className="block">
              <span className={labelClass}>Categoría</span>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
                <option value="">Todas las categorías</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={labelClass}>Inicio</span>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
            </label>
            <label className="block">
              <span className={labelClass}>Fin</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
            </label>
            <label className="block">
              <span className={labelClass}>Responsable</span>
              <select value={responsibleId} onChange={(e) => setResponsibleId(e.target.value)} className={inputClass}>
                <option value="">Sin asignar</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={labelClass}>Estado</span>
              <select value={status} onChange={(e) => setStatus(e.target.value as PlanStatus)} className={inputClass}>
                {planStatuses.map((s) => (
                  <option key={s} value={s}>
                    {temporadaStatusLabel[s]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className={labelClass}>Objetivo general</span>
              <textarea
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                rows={2}
                placeholder="Ej: Consolidar el modelo de juego y preparar la base para el ascenso a la categoría superior."
                className={inputClass}
              />
            </label>
          </div>
          {error ? <p className="mt-2 text-[11.5px] lg:text-[12.5px] font-medium text-jaguar-maroon-600">{error}</p> : null}
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
              className="rounded-lg px-3 py-1.5 text-[12px] lg:text-[13px] font-semibold text-jaguar-ink/55 hover:bg-jaguar-ink/[0.04]"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={isPending || !name || !startDate || !endDate}
              className="rounded-lg bg-jaguar-green-600 px-3.5 py-1.5 text-[12px] lg:text-[13px] font-semibold text-white hover:bg-jaguar-green-700 disabled:opacity-60"
            >
              {isPending ? "Guardando…" : editingId ? "Guardar cambios" : "Crear temporada"}
            </button>
          </div>
        </div>
      ) : null}

      <div className="mt-2 space-y-2.5">
        {temporadas.length === 0 ? (
          <p className="text-[12.5px] lg:text-[13.5px] text-jaguar-ink/45">Aún no hay temporadas creadas.</p>
        ) : (
          temporadas.map((t) => (
            <div key={t.id} className="flex items-center justify-between gap-3 rounded-xl border border-jaguar-ink/8 px-4 py-3.5">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-[13px] lg:text-[14px] font-semibold text-jaguar-ink">{t.name}</p>
                  {t.category ? <Badge tone="neutral">{t.category}</Badge> : null}
                  <Badge tone={statusTone[t.status]}>{temporadaStatusLabel[t.status]}</Badge>
                </div>
                <p className="mt-0.5 text-[11.5px] lg:text-[12.5px] text-jaguar-ink/45">
                  {formatDate(t.start_date)} – {formatDate(t.end_date)}
                  {t.responsible_id ? ` · Responsable: ${staffName(t.responsible_id)}` : ""}
                </p>
                {t.objective ? <p className="mt-1 text-[11.5px] lg:text-[12.5px] text-jaguar-ink/55">{t.objective}</p> : null}
              </div>
              {canManage ? (
                <button
                  type="button"
                  onClick={() => startEdit(t)}
                  className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12px] lg:text-[13px] font-semibold text-jaguar-ink/50 hover:bg-jaguar-ink/[0.05] hover:text-jaguar-ink"
                >
                  <Pencil className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                  Editar
                </button>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Ciclos                                                               */
/* ------------------------------------------------------------------ */

function CiclosTab({
  temporadas,
  ciclos,
  staff,
  staffName,
  canManage,
  router,
}: {
  temporadas: TemporadaRow[];
  ciclos: CicloRow[];
  staff: StaffProfile[];
  staffName: (id: string | null) => string;
  canManage: boolean;
  router: ReturnType<typeof useRouter>;
}) {
  const [filterTemporada, setFilterTemporada] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [temporadaId, setTemporadaId] = useState("");
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [objective, setObjective] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [responsibleId, setResponsibleId] = useState("");
  const [status, setStatus] = useState<PlanStatus>("planificado");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const temporadaName = useMemo(() => {
    const map = new Map(temporadas.map((t) => [t.id, t.name]));
    return (id: string) => map.get(id) ?? "—";
  }, [temporadas]);

  const visibleCiclos = filterTemporada ? ciclos.filter((c) => c.temporada_id === filterTemporada) : ciclos;

  function resetForm() {
    setTemporadaId(filterTemporada || temporadas[0]?.id || "");
    setName("");
    setStartDate("");
    setEndDate("");
    setObjective("");
    setObservaciones("");
    setResponsibleId("");
    setStatus("planificado");
    setError(null);
  }

  function startCreate() {
    resetForm();
    setEditingId(null);
    setShowForm(true);
  }

  function startEdit(c: CicloRow) {
    setEditingId(c.id);
    setTemporadaId(c.temporada_id);
    setName(c.name);
    setStartDate(c.start_date);
    setEndDate(c.end_date);
    setObjective(c.objective ?? "");
    setObservaciones(c.observaciones ?? "");
    setResponsibleId(c.responsible_id ?? "");
    setStatus(c.status);
    setError(null);
    setShowForm(true);
  }

  function submit() {
    setError(null);
    if (!name.trim() || !temporadaId || !startDate || !endDate) {
      setError("Nombre, temporada y fechas son obligatorios.");
      return;
    }
    startTransition(async () => {
      const input = {
        temporadaId,
        name: name.trim(),
        startDate,
        endDate,
        objective: objective.trim() || null,
        observaciones: observaciones.trim() || null,
        responsibleId: responsibleId || null,
        status,
      };
      const result = editingId ? await updateCiclo(editingId, input) : await createCiclo(input);
      if (result.error) {
        setError(result.error);
        return;
      }
      setShowForm(false);
      setEditingId(null);
      resetForm();
      router.refresh();
    });
  }

  if (temporadas.length === 0) {
    return (
      <div className="space-y-2">
        <p className="text-[14px] lg:text-[15.5px] font-bold text-jaguar-ink">Ciclos</p>
        <p className="text-[12.5px] lg:text-[13.5px] text-jaguar-ink/45">
          Primero creá una temporada en la pestaña &ldquo;Temporadas&rdquo; — un ciclo siempre vive dentro de una.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[14px] lg:text-[15.5px] font-bold text-jaguar-ink">Ciclos</p>
          <p className="text-[12.5px] lg:text-[13.5px] text-jaguar-ink/45">
            Bloques de trabajo dentro de una temporada — Pretemporada, Competición, etc. El nombre lo elegís vos.
          </p>
        </div>
        {canManage ? (
          <button
            type="button"
            onClick={startCreate}
            className="inline-flex items-center gap-1.5 rounded-xl border border-jaguar-ink/10 px-3 py-1.5 text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-ink/70 hover:bg-jaguar-ink/[0.03]"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
            Nuevo ciclo
          </button>
        ) : null}
      </div>

      <label className="block max-w-xs">
        <span className={labelClass}>Filtrar por temporada</span>
        <select value={filterTemporada} onChange={(e) => setFilterTemporada(e.target.value)} className={inputClass}>
          <option value="">Todas las temporadas</option>
          {temporadas.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </label>

      {showForm ? (
        <div className="rounded-2xl border border-jaguar-ink/10 bg-jaguar-mist/40 p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className={labelClass}>Temporada</span>
              <select value={temporadaId} onChange={(e) => setTemporadaId(e.target.value)} className={inputClass}>
                {temporadas.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={labelClass}>Nombre</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Pretemporada" className={inputClass} />
            </label>
            <label className="block">
              <span className={labelClass}>Inicio</span>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
            </label>
            <label className="block">
              <span className={labelClass}>Fin</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
            </label>
            <label className="block">
              <span className={labelClass}>Responsable</span>
              <select value={responsibleId} onChange={(e) => setResponsibleId(e.target.value)} className={inputClass}>
                <option value="">Sin asignar</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={labelClass}>Estado</span>
              <select value={status} onChange={(e) => setStatus(e.target.value as PlanStatus)} className={inputClass}>
                {planStatuses.map((s) => (
                  <option key={s} value={s}>
                    {cicloStatusLabel[s]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className={labelClass}>Objetivo</span>
              <textarea value={objective} onChange={(e) => setObjective(e.target.value)} rows={2} className={inputClass} />
            </label>
            <label className="block sm:col-span-2">
              <span className={labelClass}>Observaciones</span>
              <textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} rows={2} className={inputClass} />
            </label>
          </div>
          {error ? <p className="mt-2 text-[11.5px] lg:text-[12.5px] font-medium text-jaguar-maroon-600">{error}</p> : null}
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
              className="rounded-lg px-3 py-1.5 text-[12px] lg:text-[13px] font-semibold text-jaguar-ink/55 hover:bg-jaguar-ink/[0.04]"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={isPending || !name || !temporadaId || !startDate || !endDate}
              className="rounded-lg bg-jaguar-green-600 px-3.5 py-1.5 text-[12px] lg:text-[13px] font-semibold text-white hover:bg-jaguar-green-700 disabled:opacity-60"
            >
              {isPending ? "Guardando…" : editingId ? "Guardar cambios" : "Crear ciclo"}
            </button>
          </div>
        </div>
      ) : null}

      <div className="mt-2 space-y-2.5">
        {visibleCiclos.length === 0 ? (
          <p className="text-[12.5px] lg:text-[13.5px] text-jaguar-ink/45">No hay ciclos para mostrar todavía.</p>
        ) : (
          visibleCiclos.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-3 rounded-xl border border-jaguar-ink/8 px-4 py-3.5">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-[13px] lg:text-[14px] font-semibold text-jaguar-ink">{c.name}</p>
                  <Badge tone="neutral">{temporadaName(c.temporada_id)}</Badge>
                  <Badge tone={statusTone[c.status]}>{cicloStatusLabel[c.status]}</Badge>
                </div>
                <p className="mt-0.5 text-[11.5px] lg:text-[12.5px] text-jaguar-ink/45">
                  {formatDate(c.start_date)} – {formatDate(c.end_date)}
                  {c.responsible_id ? ` · Responsable: ${staffName(c.responsible_id)}` : ""}
                </p>
                {c.objective ? <p className="mt-1 text-[11.5px] lg:text-[12.5px] text-jaguar-ink/55">{c.objective}</p> : null}
              </div>
              {canManage ? (
                <button
                  type="button"
                  onClick={() => startEdit(c)}
                  className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12px] lg:text-[13px] font-semibold text-jaguar-ink/50 hover:bg-jaguar-ink/[0.05] hover:text-jaguar-ink"
                >
                  <Pencil className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                  Editar
                </button>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Microciclos                                                         */
/* ------------------------------------------------------------------ */

function MicrociclosTab({
  ciclos,
  microciclos,
  staff,
  staffName,
  canManage,
  router,
}: {
  ciclos: CicloRow[];
  microciclos: MicrocicloRow[];
  staff: StaffProfile[];
  staffName: (id: string | null) => string;
  canManage: boolean;
  router: ReturnType<typeof useRouter>;
}) {
  const [filterCiclo, setFilterCiclo] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [cicloId, setCicloId] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState<MicrocicloType>("personalizado");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [objectiveMain, setObjectiveMain] = useState("");
  const [objectivesSecondary, setObjectivesSecondary] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [responsibleId, setResponsibleId] = useState("");
  const [status, setStatus] = useState<PlanStatus>("planificado");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const cicloName = useMemo(() => {
    const map = new Map(ciclos.map((c) => [c.id, c.name]));
    return (id: string) => map.get(id) ?? "—";
  }, [ciclos]);

  const visibleMicrociclos = filterCiclo ? microciclos.filter((m) => m.ciclo_id === filterCiclo) : microciclos;
  const formDuration = daysBetween(startDate, endDate);

  function resetForm() {
    setCicloId(filterCiclo || ciclos[0]?.id || "");
    setName("");
    setType("personalizado");
    setStartDate("");
    setEndDate("");
    setObjectiveMain("");
    setObjectivesSecondary("");
    setObservaciones("");
    setResponsibleId("");
    setStatus("planificado");
    setError(null);
  }

  function startCreate() {
    resetForm();
    setEditingId(null);
    setShowForm(true);
  }

  function startEdit(m: MicrocicloRow) {
    setEditingId(m.id);
    setCicloId(m.ciclo_id);
    setName(m.name);
    setType(m.type);
    setStartDate(m.start_date);
    setEndDate(m.end_date);
    setObjectiveMain(m.objective_main ?? "");
    setObjectivesSecondary((m.objectives_secondary ?? []).join(", "));
    setObservaciones(m.observaciones ?? "");
    setResponsibleId(m.responsible_id ?? "");
    setStatus(m.status);
    setError(null);
    setShowForm(true);
  }

  function submit() {
    setError(null);
    if (!name.trim() || !cicloId || !startDate || !endDate) {
      setError("Nombre, ciclo y fechas son obligatorios.");
      return;
    }
    if (daysBetween(startDate, endDate) === null) {
      setError("La fecha final no puede ser anterior a la de inicio.");
      return;
    }
    startTransition(async () => {
      const input = {
        cicloId,
        name: name.trim(),
        type,
        startDate,
        endDate,
        objectiveMain: objectiveMain.trim() || null,
        objectivesSecondary: objectivesSecondary
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        observaciones: observaciones.trim() || null,
        responsibleId: responsibleId || null,
        status,
      };
      const result = editingId ? await updateMicrociclo(editingId, input) : await createMicrociclo(input);
      if (result.error) {
        setError(result.error);
        return;
      }
      setShowForm(false);
      setEditingId(null);
      resetForm();
      router.refresh();
    });
  }

  if (ciclos.length === 0) {
    return (
      <div className="space-y-2">
        <p className="text-[14px] lg:text-[15.5px] font-bold text-jaguar-ink">Microciclos</p>
        <p className="text-[12.5px] lg:text-[13.5px] text-jaguar-ink/45">
          Primero creá un ciclo en la pestaña &ldquo;Ciclos&rdquo; — un microciclo siempre vive dentro de uno.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[14px] lg:text-[15.5px] font-bold text-jaguar-ink">Microciclos</p>
          <p className="text-[12.5px] lg:text-[13.5px] text-jaguar-ink/45">
            Agrupan entrenamientos con un objetivo concreto, en cualquier rango de fechas — no tienen que durar 7 días.
          </p>
        </div>
        {canManage ? (
          <button
            type="button"
            onClick={startCreate}
            className="inline-flex items-center gap-1.5 rounded-xl border border-jaguar-ink/10 px-3 py-1.5 text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-ink/70 hover:bg-jaguar-ink/[0.03]"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
            Nuevo microciclo
          </button>
        ) : null}
      </div>

      <label className="block max-w-xs">
        <span className={labelClass}>Filtrar por ciclo</span>
        <select value={filterCiclo} onChange={(e) => setFilterCiclo(e.target.value)} className={inputClass}>
          <option value="">Todos los ciclos</option>
          {ciclos.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      {showForm ? (
        <div className="rounded-2xl border border-jaguar-ink/10 bg-jaguar-mist/40 p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className={labelClass}>Ciclo</span>
              <select value={cicloId} onChange={(e) => setCicloId(e.target.value)} className={inputClass}>
                {ciclos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={labelClass}>Nombre</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Microciclo 04" className={inputClass} />
            </label>
            <label className="block">
              <span className={labelClass}>Tipo</span>
              <select value={type} onChange={(e) => setType(e.target.value as MicrocicloType)} className={inputClass}>
                {microcicloTypes.map((t) => (
                  <option key={t} value={t}>
                    {microcicloTypeLabel[t]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={labelClass}>Responsable</span>
              <select value={responsibleId} onChange={(e) => setResponsibleId(e.target.value)} className={inputClass}>
                <option value="">Sin asignar</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={labelClass}>Inicio</span>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
            </label>
            <label className="block">
              <span className={labelClass}>
                Fin {formDuration !== null ? <span className="font-normal text-jaguar-ink/40">— {formDuration} día{formDuration === 1 ? "" : "s"}</span> : null}
              </span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
            </label>
            <label className="block sm:col-span-2">
              <span className={labelClass}>Objetivo principal</span>
              <input
                value={objectiveMain}
                onChange={(e) => setObjectiveMain(e.target.value)}
                placeholder="Preparación para el partido del fin de semana"
                className={inputClass}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className={labelClass}>Objetivos secundarios (separados por coma)</span>
              <input
                value={objectivesSecondary}
                onChange={(e) => setObjectivesSecondary(e.target.value)}
                placeholder="Velocidad, finalización"
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className={labelClass}>Estado</span>
              <select value={status} onChange={(e) => setStatus(e.target.value as PlanStatus)} className={inputClass}>
                {planStatuses.map((s) => (
                  <option key={s} value={s}>
                    {cicloStatusLabel[s]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className={labelClass}>Observaciones</span>
              <textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} rows={2} className={inputClass} />
            </label>
          </div>
          {error ? <p className="mt-2 text-[11.5px] lg:text-[12.5px] font-medium text-jaguar-maroon-600">{error}</p> : null}
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
              className="rounded-lg px-3 py-1.5 text-[12px] lg:text-[13px] font-semibold text-jaguar-ink/55 hover:bg-jaguar-ink/[0.04]"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={isPending || !name || !cicloId || !startDate || !endDate}
              className="rounded-lg bg-jaguar-green-600 px-3.5 py-1.5 text-[12px] lg:text-[13px] font-semibold text-white hover:bg-jaguar-green-700 disabled:opacity-60"
            >
              {isPending ? "Guardando…" : editingId ? "Guardar cambios" : "Crear microciclo"}
            </button>
          </div>
        </div>
      ) : null}

      <div className="mt-2 space-y-2.5">
        {visibleMicrociclos.length === 0 ? (
          <p className="text-[12.5px] lg:text-[13.5px] text-jaguar-ink/45">No hay microciclos para mostrar todavía.</p>
        ) : (
          visibleMicrociclos.map((m) => {
            const duration = daysBetween(m.start_date, m.end_date);
            return (
              <div key={m.id} className="flex items-center justify-between gap-3 rounded-xl border border-jaguar-ink/8 px-4 py-3.5">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] lg:text-[14px] font-semibold text-jaguar-ink">{m.name}</p>
                    <Badge tone="turquoise">{microcicloTypeLabel[m.type]}</Badge>
                    <Badge tone="neutral">{cicloName(m.ciclo_id)}</Badge>
                    <Badge tone={statusTone[m.status]}>{cicloStatusLabel[m.status]}</Badge>
                  </div>
                  <p className="mt-0.5 text-[11.5px] lg:text-[12.5px] text-jaguar-ink/45">
                    {formatDate(m.start_date)} – {formatDate(m.end_date)}
                    {duration !== null ? ` · ${duration} día${duration === 1 ? "" : "s"}` : ""}
                    {m.responsible_id ? ` · Responsable: ${staffName(m.responsible_id)}` : ""}
                  </p>
                  {m.objective_main ? <p className="mt-1 text-[11.5px] lg:text-[12.5px] text-jaguar-ink/55">{m.objective_main}</p> : null}
                </div>
                {canManage ? (
                  <button
                    type="button"
                    onClick={() => startEdit(m)}
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12px] lg:text-[13px] font-semibold text-jaguar-ink/50 hover:bg-jaguar-ink/[0.05] hover:text-jaguar-ink"
                  >
                    <Pencil className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                    Editar
                  </button>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
