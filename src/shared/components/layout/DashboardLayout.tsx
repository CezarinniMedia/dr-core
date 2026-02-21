import { useMemo, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/shared/hooks/useAuth";
import { useKeyboardShortcuts } from "@/shared/hooks/useKeyboardShortcuts";
import { SidebarProvider } from "@/shared/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { CommandPalette } from "@/shared/components/command-palette/CommandPalette";
import { Loader2 } from "lucide-react";

export function DashboardLayout() {
  const { user, loading } = useAuth();
  const [commandOpen, setCommandOpen] = useState(false);

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
    ],
    []
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
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <Outlet />
        </main>
      </div>
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </SidebarProvider>
  );
}
