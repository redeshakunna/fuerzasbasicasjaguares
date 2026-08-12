import Link from "next/link";
import type { ReactNode } from "react";

interface DashboardButtonProps {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "ghost";
  icon?: ReactNode;
  onClick?: () => void;
}

const variantClass = {
  primary:
    "bg-jaguar-green-600 text-white hover:bg-jaguar-green-700 shadow-[0_1px_2px_rgba(13,18,16,0.08)]",
  secondary:
    "border border-jaguar-ink/12 bg-white text-jaguar-ink hover:bg-jaguar-ink/[0.03]",
  ghost: "text-jaguar-ink/70 hover:bg-jaguar-ink/5",
};

export function DashboardButton({
  children,
  href,
  variant = "primary",
  icon,
  onClick,
}: DashboardButtonProps) {
  const className = `inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13.5px] lg:text-[15px] font-semibold transition-colors ${variantClass[variant]}`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {icon}
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {icon}
      {children}
    </button>
  );
}
