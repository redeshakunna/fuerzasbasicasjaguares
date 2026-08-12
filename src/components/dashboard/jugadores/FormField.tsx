import type { ReactNode } from "react";

/** Estilos e input compartidos entre RegisterPlayerDialog y EditPlayerDialog. */
export const inputClass =
  "w-full rounded-xl border border-jaguar-ink/10 bg-jaguar-mist/40 px-3.5 py-2.5 text-[13.5px] lg:text-[15px] text-jaguar-ink placeholder:text-jaguar-ink/35 focus:border-jaguar-green-500/40 focus:outline-none focus:ring-2 focus:ring-jaguar-green-500/10";

export const labelClass = "text-[12.5px] lg:text-[13.5px] font-semibold text-jaguar-ink/70";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
