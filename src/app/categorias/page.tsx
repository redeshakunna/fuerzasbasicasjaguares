import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageHeaderBanner } from "@/components/layout/PageHeaderBanner";
import { navLinks } from "@/components/hero/hero.data";
import { CategoriesIntro } from "@/components/categorias/CategoriesIntro";
import { CategoriesList } from "@/components/categorias/CategoriesList";

export const metadata: Metadata = {
  title: "Categorías — Fuerzas Básicas de Jaguares de Córdoba FC",
  description: "Sub-13, Sub-15 y Sub-17 — las categorías formativas de Fuerzas Básicas de Jaguares de Córdoba FC.",
};

/** Página "Categorías" — Sub-13 / Sub-15 / Sub-17, contenido dirigido por categorias.data.ts. */
export default function CategoriasPage() {
  return (
    <>
      <Navbar links={navLinks} activeHref="/categorias" variant="solid" />
      <main>
        <PageHeaderBanner title="Categorías" breadcrumbLabel="Categorías" />
        <CategoriesIntro />
        <CategoriesList />
      </main>
      <Footer />
    </>
  );
}
