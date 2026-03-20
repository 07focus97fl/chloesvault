import MobileContainer from "@/components/layout/MobileContainer";
import AmbientGlow from "@/components/layout/AmbientGlow";
import BottomNav from "@/components/layout/BottomNav";
import AuthProvider from "@/components/providers/AuthProvider";
import ServiceWorkerProvider from "@/components/providers/ServiceWorkerProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ServiceWorkerProvider>
        <MobileContainer>
          <AmbientGlow />
          <main className="pb-[140px]">{children}</main>
          <BottomNav />
        </MobileContainer>
      </ServiceWorkerProvider>
    </AuthProvider>
  );
}
