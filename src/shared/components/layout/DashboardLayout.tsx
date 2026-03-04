import { useMemo, useState, useCallback } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/shared/hooks/useAuth";
import { useKeyboardShortcuts } from "@/shared/hooks/useKeyboardShortcuts";
import { ModalProvider, useModalContext } from "@/shared/hooks/useModalContext";
import { SidebarProvider } from "@/shared/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { DemoModeBanner } from "@/shared/components/DemoMode";
import { CommandPalette } from "./command-palette/CommandPalette";
import { Loader2 } from "lucide-react";

const NAV_ROUTES = ["/spy", "/dashboard", "/ofertas", "/criativos", "/avatar", "/arsenal"];

function DashboardLayoutInner() {
  const { user, loading } = useAuth();
  const [commandOpen, setCommandOpen] = useState(false);
  const navigate = useNavigate();
  const { openModal } = useModalContext();

  const handleAltNav = useCallback(
    (index: number) => {
      if (index < NAV_ROUTES.length) {
        navigate(NAV_ROUTES[index]);
      }
    },
    [navigate]
  );

  const shortcuts = useMemo(
    () => [
      {
        key: "k",
        meta: true,
        handler: () => setCommandOpen((prev) => !prev),
        description: "Toggle Command Palette",
      },
      {
        key: "Escape",
        handler: () => setCommandOpen(false),
        description: "Close modals/palette",
      },
      // Global modal shortcuts
      {
        key: "i",
        ctrl: true,
        handler: () => openModal("import"),
        description: "Open Import CSV",
      },
      {
        key: "n",
        ctrl: true,
        handler: () => openModal("quickAdd"),
        description: "Quick Add Oferta",
      },
      {
        key: "e",
        ctrl: true,
        handler: () => openModal("exportCsv"),
        description: "Export CSV",
      },
      // Alt+number navigation
      { key: "1", alt: true, handler: () => handleAltNav(0), description: "Go to Spy Radar" },
      { key: "2", alt: true, handler: () => handleAltNav(1), description: "Go to Dashboard" },
      { key: "3", alt: true, handler: () => handleAltNav(2), description: "Go to Ofertas" },
      { key: "4", alt: true, handler: () => handleAltNav(3), description: "Go to Criativos" },
      { key: "5", alt: true, handler: () => handleAltNav(4), description: "Go to Avatares" },
      { key: "6", alt: true, handler: () => handleAltNav(5), description: "Go to Arsenal" },
      { key: "0", alt: true, handler: () => navigate("/briefing"), description: "Go to Briefing" },
    ],
    [openModal, handleAltNav, navigate]
  );

  useKeyboardShortcuts(shortcuts);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <AppHeader />
        <DemoModeBanner />
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <Outlet />
        </main>
      </div>
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </SidebarProvider>
  );
}

export function DashboardLayout() {
  return (
    <ModalProvider>
      <DashboardLayoutInner />
    </ModalProvider>
  );
}
