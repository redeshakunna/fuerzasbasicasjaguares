import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, Users, Dumbbell, Trophy, ClipboardList, ClipboardCheck, FileBarChart2, Wallet, Settings } from "lucide-react";

export interface DashboardNavChild {
  id: string;
  label: string;
  href: string;
  /** Etiqueta corta opcional junto al ítem — ej. "Próximamente" para categorías sin plantel activo aún. */
  badge?: string;
}

export interface DashboardNavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  children?: DashboardNavChild[];
}

/** Navegación fija del sidebar — MVP alcance Sub-15. */
export const dashboardNavItems: DashboardNavItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/plataforma", icon: LayoutDashboard },
  {
    id: "categorias",
    label: "Categorías",
    href: "/plataforma/jugadores?categoria=Sub-15",
    icon: Users,
    children: [
      { id: "categoria-sub13", label: "Sub-13", href: "/plataforma/jugadores?categoria=Sub-13", badge: "Próximamente" },
      { id: "categoria-sub15", label: "Sub-15", href: "/plataforma/jugadores?categoria=Sub-15" },
      { id: "categoria-sub17", label: "Sub-17", href: "/plataforma/jugadores?categoria=Sub-17", badge: "Próximamente" },
      { id: "jugadores-solicitudes", label: "Solicitudes de inscripción", href: "/plataforma/jugadores/solicitudes" },
    ],
  },
  { id: "entrenamientos", label: "Entrenamientos", href: "/plataforma/entrenamientos", icon: Dumbbell },
  { id: "partidos", label: "Partidos", href: "/plataforma/partidos", icon: Trophy },
  { id: "evaluaciones", label: "Evaluaciones", href: "/plataforma/evaluaciones", icon: ClipboardList },
  { id: "asistencia", label: "Asistencia", href: "/plataforma/asistencia", icon: ClipboardCheck },
  { id: "informes", label: "Informes", href: "/plataforma/informes", icon: FileBarChart2 },
  {
    id: "finanzas",
    label: "Gestión Financiera",
    href: "/plataforma/finanzas",
    icon: Wallet,
    children: [
      { id: "finanzas-dashboard", label: "Dashboard", href: "/plataforma/finanzas" },
      { id: "finanzas-cxc", label: "Cuentas por cobrar", href: "/plataforma/finanzas/cuentas-por-cobrar" },
      { id: "finanzas-estado-cuenta", label: "Estado de cuenta", href: "/plataforma/finanzas/estado-cuenta" },
      { id: "finanzas-registrar-pago", label: "Registrar pago", href: "/plataforma/finanzas/registrar-pago" },
      { id: "finanzas-historial", label: "Historial de pagos", href: "/plataforma/finanzas/historial" },
      { id: "finanzas-configuracion", label: "Configuración", href: "/plataforma/finanzas/configuracion" },
    ],
  },
  { id: "configuracion", label: "Configuración", href: "/plataforma/configuracion", icon: Settings },
];

/** Subconjunto para la navegación inferior en mobile (5 más usados). */
export const mobileNavItemIds = ["dashboard", "categorias", "entrenamientos", "asistencia", "configuracion"];
