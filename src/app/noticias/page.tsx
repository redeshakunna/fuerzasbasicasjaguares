import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageHeaderBanner } from "@/components/layout/PageHeaderBanner";
import { PageClosingCta } from "@/components/layout/PageClosingCta";
import { navLinks } from "@/components/hero/hero.data";
import { newsCategoryClass, newsItems, type NewsItem } from "@/components/sections/news.data";

export const metadata: Metadata = {
  title: "Noticias — Fuerzas Básicas de Jaguares de Córdoba FC",
  description: "Resultados, convocatorias y novedades de las Fuerzas Básicas de Jaguares de Córdoba FC.",
};

/** "#noticias" (ancla del inicio) fuera de la home necesita el "/" delante para funcionar. */
function resolveHref(href: string): string {
  return href.startsWith("#") ? `/${href}` : href;
}

function NewsGridCard({ item }: { item: NewsItem }) {
  return (
    <Link href={resolveHref(item.href)} className="group flex flex-col gap-3.5">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
        <Image
          src={item.image.src}
          alt={item.image.alt}
          fill
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 90vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span
          className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.06em] text-jaguar-white ${newsCategoryClass(item.category)}`}
        >
          {item.category}
        </span>
      </div>
      <div>
        <h3 className="text-[15.5px] font-bold leading-snug text-jaguar-ink transition-colors group-hover:text-jaguar-green-600 md:text-[16.5px]">
          {item.title}
        </h3>
        {item.excerpt ? (
          <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-jaguar-ink/55">{item.excerpt}</p>
        ) : null}
        <p className="mt-2 flex items-center gap-1.5 text-[12px] text-jaguar-ink/45">
          <CalendarDays className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden />
          {item.date}
        </p>
      </div>
    </Link>
  );
}

/**
 * Grid completo de noticias — mismo lenguaje visual que la tarjeta del
 * carrusel de inicio (components/sections/MatchAndNewsSection.tsx), pero en
 * cuadrícula para navegar el historial completo. Las noticias con `body`
 * llevan a su página de detalle en /noticias/[id]; las de ejemplo sin
 * artículo (placeholders del diseño) siguen apuntando al carrusel de inicio.
 */
export default function NoticiasPage() {
  return (
    <>
      <Navbar links={navLinks} activeHref="/noticias" variant="solid" />
      <main>
        <PageHeaderBanner title="Noticias" breadcrumbLabel="Noticias" />

        <section className="px-4 py-12 md:px-8 md:py-16 lg:px-12">
          <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {newsItems.map((item) => (
              <NewsGridCard key={item.id} item={item} />
            ))}
          </div>
        </section>

        <PageClosingCta
          title={
            <>
              No te pierdas
              <br />
              ni un partido
            </>
          }
          description="Resultados, convocatorias y novedades de nuestras categorías formativas, siempre al día."
          ctaLabel="Ver próximo partido"
          ctaHref="/#proximo-partido"
        />
      </main>
      <Footer />
    </>
  );
}
