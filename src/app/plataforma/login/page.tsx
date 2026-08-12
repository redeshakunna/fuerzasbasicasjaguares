import Image from "next/image";
import type { Metadata } from "next";
import { LoginForm } from "@/components/dashboard/login/LoginForm";

export const metadata: Metadata = {
  title: "Iniciar sesión — Plataforma Jaguares",
};

interface LoginPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-jaguar-mist/60 px-6 py-12">
      <div className="w-full max-w-[400px]">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/brand/logo-fuerzas-basicas.png"
            alt="Fuerzas Básicas de Jaguares de Córdoba"
            width={72}
            height={88}
            className="h-[72px] w-auto object-contain"
          />
          <h1 className="mt-4 text-[20px] lg:text-[22px] font-extrabold text-jaguar-ink">
            Acceso a la <span className="text-jaguar-green-600">Plataforma</span>
          </h1>
          <p className="mt-1 text-[13px] lg:text-[14px] text-jaguar-ink/55">
            Fuerzas Básicas de Jaguares de Córdoba FC — Sub-15
          </p>
        </div>

        <div className="mt-7 rounded-[18px] border border-jaguar-ink/8 bg-white p-6 shadow-[0_1px_2px_rgba(13,18,16,0.04)]">
          <LoginForm next={next ?? "/plataforma"} />
        </div>

        <p className="mt-5 text-center text-[12px] lg:text-[13px] text-jaguar-ink/40">
          Acceso exclusivo para cuerpo técnico y directivos.
        </p>
      </div>
    </div>
  );
}
