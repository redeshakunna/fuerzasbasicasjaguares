/**
 * Catálogo de métodos de pago — vive aquí (sin dependencias de servidor) porque
 * componentes cliente como FinanceSettingsTabs y RegistrarPagoForm lo necesitan
 * como valor en tiempo de ejecución. Importarlo desde lib/data/finance.ts
 * arrastraría "@/lib/supabase/server" (usa next/headers) al bundle del cliente
 * y rompe el build ("You're importing a component that needs next/headers").
 */
export const ALL_PAYMENT_METHODS = ["Efectivo", "Transferencia", "Nequi / Daviplata", "Tarjeta"] as const;
export type PaymentMethod = (typeof ALL_PAYMENT_METHODS)[number];
