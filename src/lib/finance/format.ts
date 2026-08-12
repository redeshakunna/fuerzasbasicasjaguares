/** Formateo puro — sin dependencia de Supabase, seguro para componentes cliente. */

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
