import { Suspense } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import Navbar from "./Navbar";
import Footer from "./Footer";
import BottomNav from "./BottomNav";
import CookieConsent from "./CookieConsent";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Suspense fallback={null}>
          <AppSidebar />
        </Suspense>
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar />
          <main className="flex-1 pb-16 md:pb-0">{children}</main>
          <Footer />
          <BottomNav />
          <CookieConsent />
        </div>
      </div>
    </SidebarProvider>
  );
}
