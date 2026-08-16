import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Trophy } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageHeaderBanner } from "@/components/layout/PageHeaderBanner";
import { PageClosingCta } from "@/components/layout/PageClosingCta";
import { ShareBar } from "@/components/noticias/ShareBar";
import { navLinks } from "@/components/hero/hero.data";
import { getNewsItem, newsCategoryClass, newsItems } from "@/components/sections/news.data";
import { getSiteUrl } from "@/lib/site-url";

export function generateStaticParams() {
  return newsItems.filter((item) => item.body).map((item) => ({ id: item.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const item = getNewsItem(id);
  if (!item) return { title: "Noticia — Fuerzas Básicas de Jaguares de Córdoba FC" };

  const siteUrl = await getSiteUrl();
  const pageUrl = `${siteUrl}/noticias/${item.id}`;
  const imageUrl = `${siteUrl}${item.image.src}`;
  const description = item.excerpt ?? item.title;

  return {
    title: `${item.title} — Fuerzas Básicas de Jaguares de Córdoba FC`,
    description,
    openGraph: {
      title: item.title,
      description,
      url: pageUrl,
      siteName: "Fuerzas Básicas de Jaguares de Córdoba FC",
      images: [{ url: imageUrl, width: 1200, height: 675, alt: item.image.alt }],
      locale: "es_CO",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: item.title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function NoticiaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = getNewsItem(id);
  if (!item || !item.body) notFound();

  const siteUrl = await getSiteUrl();
  const pageUrl = `${siteUrl}/noticias/${item.id}`;

  return (
    <>
      <Navbar links={navLinks} activeHref="/noticias" variant="solid" />
      <main>
        <PageHeaderBanner title={item.title} breadcrumbLabel="Noticias" />

        <article className="px-4 py-12 md:px-8 md:py-16 lg:px-12">
          <div className="mx-auto max-w-[860px]">
            <Link
              href="/noticias"
              className="group inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.08em] text-jaguar-green-600"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-0.5" strokeWidth={2.25} aria-hidden />
              Volver a noticias
            </Link>

            <div className="mt-5 flex items-center gap-3">
              <span
                className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.06em] text-jaguar-white ${newsCategoryClass(item.category)}`}
              >
                {item.category}
              </span>
              <span className="flex items-center gap-1.5 text-[12.5px] font-medium text-jaguar-ink/50">
                <CalendarDays className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden />
                {item.date}
              </span>
            </div>

            <div className="mt-5">
              <ShareBar title={item.title} url={pageUrl} />
            </div>

            <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-3xl">
              <Image src={item.image.src} alt={item.image.alt} fill sizes="860px" className="object-cover" priority />
            </div>

            {item.matchReport ? (
              <div className="mt-8 rounded-3xl border border-jaguar-ink/8 bg-jaguar-mist/40 p-6 md:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[13px] font-bold uppercase tracking-[0.06em] text-jaguar-ink/60">
                    Jaguares vs. {item.matchReport.opponent}
                  </p>
                  <p className="font-display text-3xl leading-none tracking-tight text-jaguar-green-600 md:text-4xl">
                    {item.matchReport.score}
                  </p>
                </div>

                <div className="mt-6 border-t border-jaguar-ink/8 pt-5">
                  <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.08em] text-jaguar-ink/55">
                    <Trophy className="h-3.5 w-3.5 text-jaguar-gold-600" strokeWidth={1.8} aria-hidden />
                    Goleadores
                  </p>
                  <ul className="mt-3 space-y-2">
                    {item.matchReport.scorers.map((scorer) => (
                      <li
                        key={scorer.name}
                        className="flex items-center justify-between rounded-xl bg-jaguar-white px-4 py-2.5 text-[13.5px] font-semibold text-jaguar-ink"
                      >
                        <span>{scorer.name}</span>
                        <span className="text-jaguar-ink/45">
                          {scorer.goals} {scorer.goals === 1 ? "gol" : "goles"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}

            <div className="prose-jaguar mt-8 space-y-5">
              {item.body.map((paragraph, i) => (
                <p key={i} className="text-[15px] leading-relaxed text-jaguar-ink/80 md:text-[16px]">
                  {paragraph}
                </p>
              ))}
            </div>

            {item.matchReport ? (
              <div className="mt-8 flex items-center gap-3 rounded-2xl border border-jaguar-green-500/25 bg-jaguar-green-50 px-5 py-4">
                <CalendarDays className="h-5 w-5 shrink-0 text-jaguar-green-600" strokeWidth={1.8} aria-hidden />
                <p className="text-[13.5px] font-semibold text-jaguar-green-600">{item.matchReport.nextMatch}</p>
              </div>
            ) : null}

            <div className="mt-10 border-t border-jaguar-ink/8 pt-6">
              <ShareBar title={item.title} url={pageUrl} />
            </div>
          </div>
        </article>

        <PageClosingCta
          title={
            <>
              Formamos futbolistas,
              <br />
              formamos personas
            </>
          }
          description="Cada resultado en la cancha es el reflejo del trabajo diario en la formación de nuestros jugadores."
          ctaLabel="Conoce la Sub-15"
          ctaHref="/jugadores?categoria=Sub-15"
        />
      </main>
      <Footer />
    </>
  );
}
