import Image from "next/image";

/** Franja muy delgada al pie de la plataforma — lema + jaguar en baja opacidad. */
export function DashboardFooter() {
  return (
    <div className="relative flex h-12 items-center justify-center overflow-hidden border-t border-jaguar-ink/8">
      <Image
        src="/brand/logo-fuerzas-basicas.png"
        alt=""
        width={28}
        height={28}
        aria-hidden
        className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 object-contain opacity-[0.04]"
      />
      <p className="relative text-[11px] lg:text-[12px] font-semibold uppercase tracking-[0.14em] text-jaguar-ink/35">
        Aquí nace el futuro.
      </p>
    </div>
  );
}
