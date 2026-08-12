import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/**
 * Primitiva de tarjeta — estilo SaaS premium (Stripe/Linear/Notion):
 * bordes suaves de 18px, sombra muy ligera, sin degradados.
 */
export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-[18px] border border-jaguar-ink/8 bg-white shadow-[0_1px_2px_rgba(13,18,16,0.04)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 px-6 pt-6 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div>
        <h3 className="text-[15px] lg:text-[16.5px] font-bold text-jaguar-ink">{title}</h3>
        {subtitle ? <p className="mt-0.5 text-[13px] lg:text-[14px] text-jaguar-ink/50">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}
