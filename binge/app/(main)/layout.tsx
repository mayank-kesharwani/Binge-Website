import Header from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/AppSidebar";
import { SidebarProvider } from "@/context/SidebarContext";
import { Toaster } from "sonner";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Header />

        <div className="flex">
          <Sidebar />

          <main className="min-w-0 flex-1 overflow-x-hidden bg-background transition-colors">
            {children}
          </main>
        </div>

        <Toaster
          position="top-right"
          richColors
          closeButton
        />
      </div>
    </SidebarProvider>
  );
}