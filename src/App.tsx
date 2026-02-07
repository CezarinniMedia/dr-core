import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Ofertas from "./pages/Ofertas";
import OfertaDetail from "./pages/OfertaDetail";
import AvatarList from "./pages/AvatarList";
import AvatarDetail from "./pages/AvatarDetail";
import PlaceholderPage from "./pages/PlaceholderPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ErrorBoundary>
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/ofertas" element={<Ofertas />} />
              <Route path="/ofertas/:id" element={<OfertaDetail />} />
              <Route path="/avatar" element={<AvatarList />} />
              <Route path="/avatar/:id" element={<AvatarDetail />} />
              <Route path="/spy" element={<PlaceholderPage title="Espionagem" description="Monitore concorrentes e tendências" />} />
              <Route path="/criativos" element={<PlaceholderPage title="Criativos" description="Gerencie seus criativos de campanha" />} />
              <Route path="/paginas" element={<PlaceholderPage title="Páginas" description="Landing pages e funis" />} />
              <Route path="/analytics" element={<PlaceholderPage title="Analytics" description="Métricas e performance" />} />
              <Route path="/prompts" element={<PlaceholderPage title="Prompts & Agents" description="Seus prompts e agentes de IA" />} />
              <Route path="/settings" element={<PlaceholderPage title="Configurações" description="Configurações do workspace" />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
  </ErrorBoundary>
);

export default App;
