import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Plataforma — Fuerzas Básicas de Jaguares de Córdoba FC",
  description: "Gestión deportiva Sub-15 — plataforma interna.",
};

/**
 * Layout raíz de /plataforma — deliberadamente sin chrome (sidebar/header):
 * el shell del dashboard vive en el grupo (dashboard) y no se aplica a
 * /plataforma/login, que necesita una pantalla limpia.
 */
export default function PlataformaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
