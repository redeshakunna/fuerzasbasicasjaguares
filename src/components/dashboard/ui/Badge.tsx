import type { ReactNode } from "react";

type BadgeTone = "green" | "turquoise" | "violet" | "gold" | "maroon" | "neutral";

const toneClass: Record<BadgeTone, string> = {
  green: "bg-jaguar-green-50 text-jaguar-green-700",
  turquoise: "bg-jaguar-turquoise-500/10 text-jaguar-turquoise-600",
  violet: "bg-violet-500/10 text-violet-600",
  gold: "bg-jaguar-gold-500/15 text-jaguar-gold-600",
  maroon: "bg-jaguar-maroon-500/10 text-jaguar-maroon-600",
  neutral: "bg-jaguar-ink/6 text-jaguar-ink/60",
};

export function Badge({ tone = "neutral", children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] lg:text-[12px] font-semibold uppercase tracking-[0.03em] ${toneClass[tone]}`}
    >
      {children}
    </span>
  );
}
