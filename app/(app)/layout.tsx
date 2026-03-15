import MobileContainer from "@/components/layout/MobileContainer";
import AmbientGlow from "@/components/layout/AmbientGlow";
import BottomNav from "@/components/layout/BottomNav";
import AuthProvider from "@/components/providers/AuthProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <MobileContainer>
        <AmbientGlow />
        <main className="pb-[140px]">{children}</main>
        <BottomNav />
      </MobileContainer>
    </AuthProvider>
  );
}
