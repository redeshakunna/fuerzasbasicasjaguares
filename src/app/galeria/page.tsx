import type { Metadata } from "next";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageHeaderBanner } from "@/components/layout/PageHeaderBanner";
import { navLinks } from "@/components/hero/hero.data";

export const metadata: Metadata = {
  title: "Galería — Fuerzas Básicas de Jaguares de Córdoba FC",
  description: "Fotos de Fuerzas Básicas de Jaguares de Córdoba FC.",
};

// Fotos reales ya disponibles en el sitio — se amplía cuando conectemos
// el álbum completo de partidos y entrenamientos.
const photos = [
  { src: "/brand/Slider Banner.png", alt: "Plantel Sub-15 de Fuerzas Básicas Jaguares de Córdoba" },
  { src: "/hero/slide-01-origen.jpg", alt: "Jugadores en plena acción" },
  { src: "/hero/slide-02-proposito.jpg", alt: "Entrenamiento de arqueros" },
  { src: "/brand/stadium-stock.jpg", alt: "Estadio" },
];

export default function GaleriaPage() {
  return (
    <>
      <Navbar links={navLinks} activeHref="/galeria" variant="solid" />
      <main>
        <PageHeaderBanner title="Galería" breadcrumbLabel="Galería" />
        <section className="bg-jaguar-white px-4 py-16 md:px-8 md:py-24 lg:px-12">
          <div className="mx-auto max-w-[1600px]">
            <div className="max-w-lg">
              <h2 className="font-display text-3xl uppercase leading-[0.95] tracking-tight text-jaguar-ink md:text-4xl">
                Nuestros <span className="text-jaguar-green-600">momentos</span>
              </h2>
              <p className="mt-4 text-[14.5px] leading-relaxed text-jaguar-ink/60">
                Estamos armando el álbum completo de partidos y entrenamientos. Mientras tanto, estas son algunas
                fotos del club.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {photos.map((photo) => (
                <div key={photo.src} className="relative aspect-[4/5] overflow-hidden rounded-2xl">
                  <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
