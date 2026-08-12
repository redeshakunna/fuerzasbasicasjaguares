import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Instagram, Facebook, Youtube } from "lucide-react";
import { navLinks } from "@/components/hero/hero.data";
import { contactLines, footerValues } from "./footer.data";

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
      <path d="M16.5 2h-3.1v13.6a3 3 0 1 1-2.5-2.96V9.5a6 6 0 1 0 5.6 6V8.9a7.6 7.6 0 0 0 4.5 1.45V7.24A4.6 4.6 0 0 1 16.5 2Z" />
    </svg>
  );
}

const socialLinks = [
  { id: "instagram", label: "Instagram", href: "#", Icon: Instagram },
  { id: "facebook", label: "Facebook", href: "#", Icon: Facebook },
  { id: "tiktok", label: "TikTok", href: "#", Icon: TikTokIcon },
  { id: "youtube", label: "YouTube", href: "#", Icon: Youtube },
];

/**
 * Footer — parte superior (marca / navegación / contacto / síguenos +
 * franja de valores). La barra inferior vinotinto se agrega aparte.
 */
function FooterTop() {
  return (
    <div className="relative overflow-hidden bg-jaguar-white">
      <Image
        src="/brand/FondoFooter2.png"
        alt=""
        fill
        sizes="100vw"
        className="pointer-events-none object-cover"
        aria-hidden
      />
      <div className="relative mx-auto max-w-[1600px] px-6 py-16 md:px-10 lg:px-14 lg:py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,340px)_1fr]">
          {/* Columna de marca */}
          <div>
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/brand/logo-fuerzas-basicas.png"
                alt="Fuerzas Básicas de Jaguares de Córdoba FC"
                width={72}
                height={72}
                className="h-14 w-14 shrink-0 object-contain md:h-16 md:w-16"
              />
              <span className="flex flex-col leading-none">
                <span className="text-base font-extrabold uppercase tracking-[0.03em] text-jaguar-green-600 md:text-lg">
                  Fuerzas Básicas de Jaguares
                </span>
                <span className="mt-0.5 text-base font-extrabold uppercase tracking-[0.03em] text-jaguar-green-600 md:text-lg">
                  de Córdoba FC
                </span>
                <span className="mt-1 text-[9px] font-medium uppercase tracking-[0.14em] text-jaguar-ink/45">
                  Formamos talento, construimos sueños
                </span>
              </span>
            </Link>

            <p className="mt-6 max-w-xs text-[13.5px] leading-relaxed text-jaguar-ink/65">
              Formamos personas íntegras y futbolistas con disciplina, pasión
              y propósito.{" "}
              <span className="font-semibold text-jaguar-ink">
                Aquí nace el futuro del fútbol.
              </span>
            </p>

            <p className="mt-8 font-display text-3xl uppercase leading-[0.95] text-jaguar-green-600">
              #Somos
              <br />
              Jaguares
            </p>
          </div>

          {/* Navegación / Contacto / Síguenos */}
          <div>
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
              <div>
                <h3 className="relative inline-block text-[13px] font-extrabold uppercase tracking-[0.1em] text-jaguar-green-600">
                  Navegación
                  <span
                    aria-hidden
                    className="absolute -bottom-1.5 left-0 h-[2px] w-6 rounded-full bg-jaguar-green-500"
                  />
                </h3>
                <ul className="mt-5 space-y-3">
                  {navLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="group flex items-center gap-1 text-[13.5px] font-medium text-jaguar-ink/75 transition-colors hover:text-jaguar-green-600"
                      >
                        {link.label}
                        <ChevronRight
                          className="h-3.5 w-3.5 text-jaguar-ink/30 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-jaguar-green-600"
                          strokeWidth={2}
                          aria-hidden
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="relative inline-block text-[13px] font-extrabold uppercase tracking-[0.1em] text-jaguar-green-600">
                  Contacto
                  <span
                    aria-hidden
                    className="absolute -bottom-1.5 left-0 h-[2px] w-6 rounded-full bg-jaguar-green-500"
                  />
                </h3>
                <ul className="mt-5 space-y-3.5">
                  {contactLines.map((line) => {
                    const Icon = line.icon;
                    return (
                      <li key={line.id} className="flex items-start gap-2.5">
                        <Icon
                          className="mt-0.5 h-4 w-4 shrink-0 text-jaguar-green-600"
                          strokeWidth={1.8}
                          aria-hidden
                        />
                        <span className="whitespace-pre-line text-[13.5px] leading-snug text-jaguar-ink/75">
                          {line.text}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div>
                <h3 className="relative inline-block text-[13px] font-extrabold uppercase tracking-[0.1em] text-jaguar-green-600">
                  Síguenos
                  <span
                    aria-hidden
                    className="absolute -bottom-1.5 left-0 h-[2px] w-6 rounded-full bg-jaguar-green-500"
                  />
                </h3>
                <div className="mt-5 flex items-center gap-3">
                  {socialLinks.map(({ id, label, href, Icon }) => (
                    <Link
                      key={id}
                      href={href}
                      aria-label={label}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-jaguar-green-500/40 text-jaguar-green-600 transition-colors hover:bg-jaguar-green-600 hover:text-jaguar-white"
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Franja de valores institucionales */}
            <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-jaguar-ink/8 pt-10 sm:grid-cols-4">
              {footerValues.map((value) => {
                const Icon = value.icon;
                return (
                  <div key={value.id}>
                    <Icon
                      className="h-6 w-6 text-jaguar-green-600"
                      strokeWidth={1.6}
                      aria-hidden
                    />
                    <h4 className="mt-3 text-[13px] font-bold uppercase tracking-[0.04em] text-jaguar-ink">
                      {value.title}
                    </h4>
                    <p className="mt-1.5 max-w-[180px] text-[12.5px] leading-relaxed text-jaguar-ink/55">
                      {value.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Franja vinotinto — el lema "Aquí nace el futuro!" ya viene integrado
 * a la imagen (FondoVinotinto.png), incluida su línea dorada superior
 * e inferior. Altura fija de 250px.
 */
function FooterBanner() {
  return (
    <div className="relative h-[250px] w-full overflow-hidden bg-jaguar-maroon-500">
      <Image
        src="/brand/FondoVinotinto.png"
        alt="Aquí nace el futuro"
        fill
        sizes="100vw"
        className="object-cover"
      />
    </div>
  );
}

/** Barra de copyright. */
function FooterCopyright() {
  const year = new Date().getFullYear();
  return (
    <div className="bg-jaguar-ink">
      <div className="mx-auto flex max-w-[1600px] flex-col items-center gap-2 px-6 py-5 text-center md:flex-row md:justify-between md:px-10 md:text-left lg:px-14">
        <p className="text-[12px] text-jaguar-white/55">
          © {year} Fuerzas Básicas de Jaguares de Córdoba FC. Todos los derechos
          reservados.
        </p>
        <p className="text-[12px] text-jaguar-white/55">
          Diseñado y administrado por{" "}
          <Link
            href="https://hakunnadigital.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-jaguar-green-500 transition-colors hover:text-jaguar-green-400"
          >
            Hakunna Digital
          </Link>
        </p>
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer>
      <FooterTop />
      <FooterBanner />
      <FooterCopyright />
    </footer>
  );
}
