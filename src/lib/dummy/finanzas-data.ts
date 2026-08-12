/**
 * Datos ficticios — módulo Gestión Financiera (fase de diseño UX/UI).
 *
 * Fuente única de verdad para todas las pantallas del módulo. La academia
 * actualmente tiene un único jugador registrado (Juan Camilo Pérez), por lo
 * que toda la información administrativa gira alrededor de él. No hay
 * conexión a base de datos ni lógica de negocio real: esto es contenido
 * de muestra para que las pantallas se vean y naveguen como producto real.
 */

export const financePlayer = {
  id: "player-1",
  name: "Juan Camilo Pérez",
  category: "Sub-15",
  status: "Activo" as const,
  joinedAt: "Enero 2026",
  jerseyNumber: 10,
  position: "Delantero",
  guardianName: "Marcela Pérez",
  guardianPhone: "+57 300 123 4567",
  initials: "JP",
};

export type ObligationConcept = "Inscripción" | "Mensualidad" | "Uniforme" | "Torneo" | "Otros";
export type ObligationStatus = "Pagado" | "Pendiente" | "Vencido";

export interface Obligation {
  id: string;
  concept: ObligationConcept;
  title: string;
  description: string;
  amount: number;
  issuedDate: string;
  dueDate: string;
  status: ObligationStatus;
  paidDate?: string;
  paymentMethod?: string;
  receiptNumber?: string;
}

/** Historia financiera de Juan Camilo Pérez — coherente en todas las pantallas. */
export const obligations: Obligation[] = [
  {
    id: "ob-1",
    concept: "Inscripción",
    title: "Inscripción 2026",
    description: "Pago único de ingreso a la academia — temporada 2026.",
    amount: 250000,
    issuedDate: "2026-01-05",
    dueDate: "2026-01-15",
    status: "Pagado",
    paidDate: "2026-01-10",
    paymentMethod: "Transferencia",
    receiptNumber: "REC-0001",
  },
  {
    id: "ob-2",
    concept: "Mensualidad",
    title: "Mensualidad Julio 2026",
    description: "Cuota mensual de formación deportiva — julio 2026.",
    amount: 120000,
    issuedDate: "2026-07-01",
    dueDate: "2026-07-05",
    status: "Pagado",
    paidDate: "2026-07-03",
    paymentMethod: "Efectivo",
    receiptNumber: "REC-0002",
  },
  {
    id: "ob-3",
    concept: "Torneo",
    title: "Torneo Liga Córdoba",
    description: "Inscripción al Torneo Liga Córdoba — categoría Sub-15.",
    amount: 180000,
    issuedDate: "2026-07-08",
    dueDate: "2026-07-15",
    status: "Pagado",
    paidDate: "2026-07-12",
    paymentMethod: "Nequi",
    receiptNumber: "REC-0003",
  },
  {
    id: "ob-4",
    concept: "Mensualidad",
    title: "Mensualidad Agosto 2026",
    description: "Cuota mensual de formación deportiva — agosto 2026.",
    amount: 120000,
    issuedDate: "2026-08-01",
    dueDate: "2026-08-05",
    status: "Pendiente",
  },
  {
    id: "ob-5",
    concept: "Uniforme",
    title: "Uniforme Oficial 2026",
    description: "Kit oficial de entrenamiento y partido — talla juvenil.",
    amount: 350000,
    issuedDate: "2026-08-01",
    dueDate: "2026-08-10",
    status: "Pendiente",
  },
];

export function getObligationById(id: string): Obligation | undefined {
  return obligations.find((o) => o.id === id);
}

export const paidObligations = obligations.filter((o) => o.status === "Pagado");
export const pendingObligations = obligations.filter((o) => o.status !== "Pagado");

export function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(
    amount,
  );
}

const monthNames = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

export function formatLongDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} de ${monthNames[(m ?? 1) - 1]} de ${y}`;
}

export function formatShortDate(iso: string): string {
  const monthShort = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${monthShort[(m ?? 1) - 1]} ${y}`;
}

export interface FinanceSummary {
  totalPorCobrar: number;
  totalRecaudado: number;
  pendientesCount: number;
  vencidosCount: number;
  vencidosAmount: number;
}

export function getFinanceSummary(): FinanceSummary {
  const totalRecaudado = paidObligations.reduce((sum, o) => sum + o.amount, 0);
  const totalPorCobrar = pendingObligations.reduce((sum, o) => sum + o.amount, 0);
  return {
    totalPorCobrar,
    totalRecaudado,
    pendientesCount: pendingObligations.length,
    vencidosCount: 0,
    vencidosAmount: 0,
  };
}

/** Desglose de métodos de pago — derivado de los pagos reales registrados (coherente, no inventado). */
export function getPaymentMethodBreakdown() {
  const total = paidObligations.reduce((sum, o) => sum + o.amount, 0);
  const byMethod = new Map<string, number>();
  for (const o of paidObligations) {
    const key = o.paymentMethod ?? "Otro";
    byMethod.set(key, (byMethod.get(key) ?? 0) + o.amount);
  }
  return [...byMethod.entries()]
    .map(([method, amount]) => ({ method, amount, pct: total > 0 ? Math.round((amount / total) * 100) : 0 }))
    .sort((a, b) => b.amount - a.amount);
}

export interface ConceptCard {
  id: string;
  name: ObligationConcept;
  status: "Activo" | "Inactivo";
  description: string;
  suggestedAmount: number;
  activeCount: number;
}

export const concepts: ConceptCard[] = [
  {
    id: "c-1",
    name: "Inscripción",
    status: "Activo",
    description: "Pago único al ingresar a la academia.",
    suggestedAmount: 250000,
    activeCount: 1,
  },
  {
    id: "c-2",
    name: "Mensualidad",
    status: "Activo",
    description: "Cuota mensual de formación deportiva.",
    suggestedAmount: 120000,
    activeCount: 2,
  },
  {
    id: "c-3",
    name: "Uniforme",
    status: "Activo",
    description: "Kit oficial de entrenamiento y partido.",
    suggestedAmount: 350000,
    activeCount: 1,
  },
  {
    id: "c-4",
    name: "Torneo",
    status: "Activo",
    description: "Inscripción a torneos y campeonatos.",
    suggestedAmount: 180000,
    activeCount: 1,
  },
  {
    id: "c-5",
    name: "Otros",
    status: "Activo",
    description: "Cobros varios no clasificados en las categorías anteriores.",
    suggestedAmount: 0,
    activeCount: 0,
  },
];

/** "Hoy" fijo de la maqueta — coherente con el calendario del resto de la plataforma. */
export const TODAY_ISO = "2026-08-05";
