import type { Metadata } from "next";
import { Anton, Manrope } from "next/font/google";
import "./globals.css";

/**
 * Tipografía de marca:
 * - Anton: display condensado de alto impacto para titulares del Hero
 *   (mismo espíritu que las campañas Nike/EA Sports FC).
 * - Manrope: grotesca moderna para navbar, cuerpo de texto y UI.
 * Ambas se auto-hospedan vía next/font (sin flash de fuente, sin
 * llamadas externas) y se exponen como variables CSS para Tailwind.
 */
const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fuerzas Básicas de Jaguares de Córdoba FC",
  description:
    "Formación de futbolistas y personas. Fuerzas Básicas de Jaguares de Córdoba FC.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${anton.variable} ${manrope.variable}`}>
      <body>{children}</body>
    </html>
  );
}
