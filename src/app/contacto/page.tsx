import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageHeaderBanner } from "@/components/layout/PageHeaderBanner";
import { navLinks } from "@/components/hero/hero.data";
import { ContactForm } from "@/components/contacto/ContactForm";
import { ContactInfoPanel } from "@/components/contacto/ContactInfoPanel";

export const metadata: Metadata = {
  title: "Contacto — Fuerzas Básicas de Jaguares de Córdoba FC",
  description: "Escríbenos — Fuerzas Básicas de Jaguares de Córdoba FC.",
};

export default function ContactoPage() {
  return (
    <>
      <Navbar links={navLinks} activeHref="/contacto" variant="solid" />
      <main>
        <PageHeaderBanner title="Contacto" breadcrumbLabel="Contacto" />
        <section className="bg-jaguar-white px-4 py-16 md:px-8 md:py-24 lg:px-12">
          <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-8 lg:grid-cols-[1fr_0.8fr] lg:gap-10">
            <ContactForm />
            <ContactInfoPanel />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
