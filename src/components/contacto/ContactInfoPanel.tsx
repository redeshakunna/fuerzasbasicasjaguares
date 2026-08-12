"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Facebook, Instagram, Youtube } from "lucide-react";
import { contactLines } from "@/components/layout/footer.data";

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

/** Panel de información de contacto — mismos datos que el Footer, versión ampliada. */
export function ContactInfoPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-[24px] bg-jaguar-green-900 p-8 text-jaguar-white md:p-10"
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.06] [background:repeating-linear-gradient(115deg,white_0px,white_2px,transparent_2px,transparent_18px)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-jaguar-green-600/40 blur-3xl"
      />

      <div className="relative">
        <h2 className="font-display text-2xl uppercase leading-none tracking-tight md:text-3xl">
          Información de contacto
        </h2>

        <ul className="mt-8 space-y-6">
          {contactLines.map((line) => {
            const Icon = line.icon;
            return (
              <li key={line.id} className="flex items-start gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-jaguar-white/10">
                  <Icon className="h-4.5 w-4.5" strokeWidth={1.8} aria-hidden />
                </span>
                <span className="whitespace-pre-line pt-1.5 text-[14px] leading-snug text-jaguar-white/85">
                  {line.text}
                </span>
              </li>
            );
          })}
        </ul>

        <div className="mt-10 border-t border-jaguar-white/15 pt-8">
          <span className="text-[12px] font-bold uppercase tracking-[0.1em] text-jaguar-white/55">Síguenos</span>
          <div className="mt-4 flex items-center gap-3">
            {socialLinks.map(({ id, label, href, Icon }) => (
              <Link
                key={id}
                href={href}
                aria-label={label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-jaguar-white/25 text-jaguar-white transition-colors hover:bg-jaguar-white hover:text-jaguar-green-600"
              >
                <Icon className="h-4 w-4" aria-hidden />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
