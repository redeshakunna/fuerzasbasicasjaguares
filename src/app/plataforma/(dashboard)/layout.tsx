import { Header } from "@/components/dashboard/Header";
import { MobileNav } from "@/components/dashboard/MobileNav";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { OnboardingWelcome } from "@/components/dashboard/OnboardingWelcome";
import { TourProvider } from "@/components/dashboard/tour/TourContext";
import { ChatPanel } from "@/components/dashboard/chat/ChatPanel";
import { getCurrentStaffProfile } from "@/lib/data/player-profile";

/**
 * Shell de la plataforma interna (sidebar + header). Vive en el grupo de
 * rutas (dashboard) para que /plataforma/login quede fuera — un login no
 * debe mostrar la navegación de una sesión que todavía no existe.
 */
export default async function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  const staff = await getCurrentStaffProfile();
  const showOnboarding = !!staff && staff.role !== "padre" && !staff.onboardedAt;

  return (
    <TourProvider>
      <div className="min-h-screen bg-gradient-to-b from-jaguar-green-50/80 via-jaguar-mist to-jaguar-mist">
        <Sidebar />
        <div className="lg:pl-64">
          <Header />
          <main className="mx-auto max-w-[1600px] px-5 pb-24 pt-6 lg:px-8 lg:pb-8">{children}</main>
        </div>
        <MobileNav />
        <ChatPanel />
        {showOnboarding && staff ? (
          <OnboardingWelcome fullName={staff.fullName} role={staff.role as Exclude<typeof staff.role, "padre">} />
        ) : null}
      </div>
    </TourProvider>
  );
}
