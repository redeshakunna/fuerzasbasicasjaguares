import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/database.types";
import { categories, type Category } from "@/lib/data/categories";

/** Catálogo fijo de métodos de pago que la plataforma sabe manejar (Registrar pago, Configuración). */
export const ALL_PAYMENT_METHODS = ["Efectivo", "Transferencia", "Nequi / Daviplata", "Tarjeta"] as const;
export type PaymentMethod = (typeof ALL_PAYMENT_METHODS)[number];

export type ObligationStatus = "Pendiente" | "Pagado" | "Vencido" | "Parcial";

export interface ObligationRow {
  id: string;
  playerId: string;
  playerName: string;
  playerInitials: string;
  conceptId: string;
  concept: string;
  title: string;
  description: string | null;
  amount: number;
  issuedDate: string;
  dueDate: string;
  status: ObligationStatus;
  paidDate: string | null;
  paymentMethod: string | null;
  receiptNumber: string | null;
  reminderSentAt: string | null;
}

export interface ConceptRow {
  id: string;
  name: string;
  status: "Activo" | "Inactivo";
  description: string | null;
  suggestedAmount: number;
  isRecurring: boolean;
  activeCount: number;
}

function initialsOf(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "—";
}

/**
 * Módulo financiero — datos reales desde Supabase (obligations/payments/payment_concepts).
 * Se hacen consultas planas y se combinan en JS en vez de usar select anidado,
 * siguiendo el mismo patrón ya usado en match-callups.ts para evitar la
 * fragilidad de tipos de los selects anidados de supabase-js.
 */
export async function getObligations(): Promise<ObligationRow[]> {
  const supabase = await createClient();

  const { data: obligations, error } = await supabase.from("obligations").select("*").order("issued_date");
  if (error) {
    console.error("getObligations() falló:", error);
    return [];
  }
  if (!obligations || obligations.length === 0) return [];

  const playerIds = [...new Set(obligations.map((o) => o.player_id))];
  const conceptIds = [...new Set(obligations.map((o) => o.concept_id))];

  const [{ data: players }, { data: concepts }, { data: payments }] = await Promise.all([
    supabase.from("players").select("id, first_name, last_name").in("id", playerIds),
    supabase.from("payment_concepts").select("id, name").in("id", conceptIds),
    supabase
      .from("payments")
      .select("*")
      .in(
        "obligation_id",
        obligations.map((o) => o.id),
      )
      .order("created_at", { ascending: false }),
  ]);

  const playerById = new Map((players ?? []).map((p) => [p.id, `${p.first_name} ${p.last_name}`]));
  const conceptNameById = new Map((concepts ?? []).map((c) => [c.id, c.name]));
  const latestPaymentByObligation = new Map<string, Tables<"payments">>();
  for (const payment of payments ?? []) {
    if (!latestPaymentByObligation.has(payment.obligation_id)) {
      latestPaymentByObligation.set(payment.obligation_id, payment);
    }
  }

  return obligations.map((o) => {
    const payment = latestPaymentByObligation.get(o.id) ?? null;
    const playerName = playerById.get(o.player_id) ?? "Jugador";
    return {
      id: o.id,
      playerId: o.player_id,
      playerName,
      playerInitials: initialsOf(playerName),
      conceptId: o.concept_id,
      concept: conceptNameById.get(o.concept_id) ?? "Otros",
      title: o.title,
      description: o.description,
      amount: Number(o.amount),
      issuedDate: o.issued_date,
      dueDate: o.due_date,
      status: o.status as ObligationStatus,
      paidDate: payment?.paid_at ?? null,
      paymentMethod: payment?.method ?? null,
      receiptNumber: payment?.receipt_number ?? null,
      reminderSentAt: o.reminder_sent_at,
    };
  });
}

export async function getObligationById(id: string): Promise<ObligationRow | null> {
  const all = await getObligations();
  return all.find((o) => o.id === id) ?? null;
}

export interface FinanceSummary {
  totalPorCobrar: number;
  totalRecaudado: number;
  pendientesCount: number;
  vencidosCount: number;
  vencidosAmount: number;
}

export async function getFinanceSummary(): Promise<FinanceSummary> {
  const obligations = await getObligations();
  const pending = obligations.filter((o) => o.status !== "Pagado");
  const paid = obligations.filter((o) => o.status === "Pagado");
  const overdue = obligations.filter((o) => o.status === "Vencido");
  return {
    totalPorCobrar: pending.reduce((sum, o) => sum + o.amount, 0),
    totalRecaudado: paid.reduce((sum, o) => sum + o.amount, 0),
    pendientesCount: pending.length,
    vencidosCount: overdue.length,
    vencidosAmount: overdue.reduce((sum, o) => sum + o.amount, 0),
  };
}

export async function getPaymentMethodBreakdown(): Promise<{ method: string; amount: number; pct: number }[]> {
  const obligations = await getObligations();
  const paid = obligations.filter((o) => o.status === "Pagado" && o.paymentMethod);
  const total = paid.reduce((sum, o) => sum + o.amount, 0);
  const byMethod = new Map<string, number>();
  for (const o of paid) {
    const key = o.paymentMethod ?? "Otro";
    byMethod.set(key, (byMethod.get(key) ?? 0) + o.amount);
  }
  return [...byMethod.entries()]
    .map(([method, amount]) => ({ method, amount, pct: total > 0 ? Math.round((amount / total) * 100) : 0 }))
    .sort((a, b) => b.amount - a.amount);
}

export async function getConcepts(): Promise<ConceptRow[]> {
  const supabase = await createClient();
  const [{ data: concepts, error }, { data: obligations }] = await Promise.all([
    supabase.from("payment_concepts").select("*").order("name"),
    supabase.from("obligations").select("concept_id"),
  ]);
  if (error || !concepts) {
    console.error("getConcepts() falló:", error);
    return [];
  }
  const countByConcept = new Map<string, number>();
  for (const o of obligations ?? []) {
    countByConcept.set(o.concept_id, (countByConcept.get(o.concept_id) ?? 0) + 1);
  }
  return concepts.map((c) => ({
    id: c.id,
    name: c.name,
    status: c.status as "Activo" | "Inactivo",
    description: c.description,
    suggestedAmount: Number(c.suggested_amount),
    isRecurring: c.is_recurring,
    activeCount: countByConcept.get(c.id) ?? 0,
  }));
}

/** Única academia activa hoy — usado como tenant por defecto hasta que exista selector de academia. */
export async function getDefaultAcademiaId(): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("academias").select("id").eq("slug", "jaguares-cordoba").maybeSingle();
  if (error) {
    console.error("getDefaultAcademiaId() falló:", error);
    return null;
  }
  return data?.id ?? null;
}

export interface FinanceSettingsRow {
  id: string;
  dueDay: number;
  reminderDaysBefore: number;
  enabledPaymentMethods: PaymentMethod[];
}

/** Configuración financiera de la academia — día de vencimiento, aviso previo, métodos de pago habilitados. */
export async function getFinanceSettings(): Promise<FinanceSettingsRow | null> {
  const supabase = await createClient();
  const academiaId = await getDefaultAcademiaId();
  if (!academiaId) return null;

  const { data, error } = await supabase
    .from("academia_finance_settings")
    .select("*")
    .eq("academia_id", academiaId)
    .maybeSingle();

  if (error || !data) {
    console.error("getFinanceSettings() falló:", error);
    return null;
  }

  return {
    id: data.id,
    dueDay: data.due_day,
    reminderDaysBefore: data.reminder_days_before,
    enabledPaymentMethods: data.enabled_payment_methods as PaymentMethod[],
  };
}

export interface CategoryFeeRow {
  category: Category;
  monthlyAmount: number;
  activePlayers: number;
}

/** Valor de mensualidad por categoría formativa, con el conteo real de jugadores activos en cada una. */
export async function getCategoryFees(): Promise<CategoryFeeRow[]> {
  const supabase = await createClient();
  const academiaId = await getDefaultAcademiaId();
  if (!academiaId) return [];

  const [{ data: fees, error }, { data: players }] = await Promise.all([
    supabase.from("category_fees").select("category, monthly_amount").eq("academia_id", academiaId),
    supabase.from("players").select("category").eq("status", "Disponible"),
  ]);

  if (error) {
    console.error("getCategoryFees() falló:", error);
    return [];
  }

  const feeByCategory = new Map((fees ?? []).map((f) => [f.category, Number(f.monthly_amount)]));
  const countByCategory = new Map<string, number>();
  for (const p of players ?? []) {
    countByCategory.set(p.category, (countByCategory.get(p.category) ?? 0) + 1);
  }

  return categories.map((category) => ({
    category,
    monthlyAmount: feeByCategory.get(category) ?? 0,
    activePlayers: countByCategory.get(category) ?? 0,
  }));
}

const monthNamesCap = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

/**
 * Automatización de mensualidad: crea la obligación de mensualidad del mes
 * actual para cada jugador activo, si todavía no existe. Se ejecuta de forma
 * "perezosa" (idempotente) cuando alguien visita el Dashboard financiero —
 * evita depender de un cron/Edge Function que este proyecto no tiene todavía,
 * pero logra el mismo resultado para el usuario: la secretaria nunca tiene
 * que generar la mensualidad a mano desde el wizard.
 *
 * El monto usa el valor real por categoría (`category_fees`, editable en
 * Configuración financiera) y la fecha límite usa el día configurado en
 * `academia_finance_settings` — ya no son valores fijos en el código.
 */
export async function ensureCurrentMonthMensualidades(): Promise<void> {
  const supabase = await createClient();
  const now = new Date();
  const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthLabel = `${monthNamesCap[now.getMonth()]} ${now.getFullYear()}`;

  const academia = await getDefaultAcademiaId();
  if (!academia) return;

  const [{ data: concept }, { data: players }, { data: fees }, settings] = await Promise.all([
    supabase
      .from("payment_concepts")
      .select("id")
      .eq("academia_id", academia)
      .eq("name", "Mensualidad")
      .eq("is_recurring", true)
      .maybeSingle(),
    supabase.from("players").select("id, category").eq("status", "Disponible"),
    supabase.from("category_fees").select("category, monthly_amount").eq("academia_id", academia),
    getFinanceSettings(),
  ]);
  if (!concept || !players || players.length === 0) return;

  const dueDay = String(settings?.dueDay ?? 5).padStart(2, "0");
  const dueDate = `${period}-${dueDay}`;
  const amountByCategory = new Map((fees ?? []).map((f) => [f.category, Number(f.monthly_amount)]));

  const { data: existing } = await supabase
    .from("obligations")
    .select("player_id")
    .eq("concept_id", concept.id)
    .gte("due_date", `${period}-01`)
    .lt("due_date", `${period}-31`);

  const playersWithMensualidad = new Set((existing ?? []).map((o) => o.player_id));
  const missing = players.filter((p) => !playersWithMensualidad.has(p.id));
  if (missing.length === 0) return;

  await supabase.from("obligations").insert(
    missing.map((p) => ({
      academia_id: academia,
      player_id: p.id,
      concept_id: concept.id,
      title: `Mensualidad ${monthLabel}`,
      description: `Cuota mensual de formación deportiva — ${monthLabel.toLowerCase()}.`,
      amount: amountByCategory.get(p.category) ?? 0,
      due_date: dueDate,
      status: "Pendiente",
    })),
  );
}

/**
 * Automatización de vencidos: toda obligación "Pendiente" cuya fecha límite
 * ya pasó se marca como "Vencido". Se ejecuta de forma perezosa (idempotente)
 * en cada visita a las pantallas de cobro — mismo patrón que
 * ensureCurrentMonthMensualidades(). Esto es lo que le da base real al
 * disparo automático de recordatorios: sin esto, "Vencido" solo existía si
 * alguien lo escribía a mano.
 */
export async function markOverdueObligations(): Promise<void> {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  await supabase.from("obligations").update({ status: "Vencido" }).eq("status", "Pendiente").lt("due_date", today);
}
