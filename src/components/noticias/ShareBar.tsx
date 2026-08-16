"use client";

import { useState } from "react";

interface ShareBarProps {
  title: string;
  /** URL absoluta de la noticia (armada en el server con getSiteUrl()). */
  url: string;
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
      <path d="M17.47 14.38c-.29-.15-1.73-.85-2-.95-.27-.1-.46-.15-.66.15-.2.29-.76.95-.93 1.14-.17.2-.34.22-.63.07-.29-.15-1.22-.45-2.33-1.44-.86-.77-1.44-1.71-1.61-2-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.51.15-.17.2-.29.29-.49.1-.2.05-.37-.02-.51-.07-.15-.66-1.59-.9-2.18-.24-.57-.48-.5-.66-.51-.17-.01-.37-.01-.56-.01-.2 0-.51.07-.78.37-.27.29-1.02 1-1.02 2.44s1.05 2.83 1.19 3.03c.15.2 2.06 3.14 4.99 4.4.7.3 1.24.48 1.67.61.7.22 1.34.19 1.84.12.56-.08 1.73-.71 1.98-1.39.24-.68.24-1.27.17-1.39-.07-.13-.27-.2-.56-.34z" />
      <path d="M12.02 2.5c-5.25 0-9.5 4.25-9.5 9.5 0 1.7.45 3.29 1.23 4.66l-1.3 4.76 4.88-1.28a9.44 9.44 0 0 0 4.69 1.26h.01c5.25 0 9.5-4.25 9.5-9.5s-4.26-9.4-9.51-9.4zm5.55 15.04a7.9 7.9 0 0 1-5.55 2.3h-.01a7.87 7.87 0 0 1-4.02-1.1l-.29-.17-2.9.76.77-2.82-.19-.29a7.87 7.87 0 0 1-1.21-4.22c0-4.36 3.55-7.9 7.91-7.9a7.87 7.87 0 0 1 5.59 2.32 7.86 7.86 0 0 1 2.31 5.58 7.9 7.9 0 0 1-2.41 5.54z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
      <path d="M13.5 21v-8.1h2.72l.41-3.15h-3.13V7.75c0-.91.25-1.53 1.56-1.53h1.66V3.4c-.29-.04-1.27-.12-2.42-.12-2.4 0-4.04 1.46-4.04 4.15v2.32H7.53v3.15h2.73V21h3.24z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
      <path d="M13.9 10.66 21.3 2h-1.75l-6.42 7.52L7.98 2H2.5l7.76 11.03L2.5 22h1.75l6.79-7.94L16.52 22h5.48l-8.1-11.34zm-2.4 2.81-.79-1.1L5.1 3.3h2.69l5.04 7.06.79 1.1 6.55 9.17h-2.69l-5.98-8.16z" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden>
      <path d="M9.5 14.5 14.5 9.5" strokeLinecap="round" />
      <path d="M11 6.5l1.5-1.5a3.54 3.54 0 0 1 5 5L16 11.5" strokeLinecap="round" />
      <path d="M13 17.5 11.5 19a3.54 3.54 0 0 1-5-5L8 12.5" strokeLinecap="round" />
    </svg>
  );
}

/** Barra de botones para compartir una noticia en WhatsApp, Facebook, X, o copiar el enlace. */
export function ShareBar({ title, url }: ShareBarProps) {
  const [copied, setCopied] = useState(false);

  const waHref = `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`;
  const fbHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  const xHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex items-center gap-2.5">
      <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-jaguar-ink/45">Compartir</span>

      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Compartir en WhatsApp"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366] text-white transition-transform hover:scale-105"
      >
        <WhatsAppIcon />
      </a>
      <a
        href={fbHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Compartir en Facebook"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1877F2] text-white transition-transform hover:scale-105"
      >
        <FacebookIcon />
      </a>
      <a
        href={xHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Compartir en X"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-jaguar-ink text-white transition-transform hover:scale-105"
      >
        <XIcon />
      </a>
      <button
        type="button"
        onClick={copyLink}
        aria-label="Copiar enlace"
        className="flex h-9 items-center gap-1.5 rounded-full border border-jaguar-ink/15 px-3.5 text-[12px] font-semibold text-jaguar-ink/70 transition-colors hover:bg-jaguar-ink/[0.04]"
      >
        <LinkIcon />
        {copied ? "¡Copiado!" : "Copiar enlace"}
      </button>
    </div>
  );
}
