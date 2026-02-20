import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";

// Login não é lazy — carrega imediatamente para evitar flash
import Login from "./pages/Login";

// Code splitting por rota — cada página carrega sob demanda
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Ofertas = lazy(() => import("./pages/Ofertas"));
const OfertaDetail = lazy(() => import("./pages/OfertaDetail"));
const AvatarList = lazy(() => import("./pages/AvatarList"));
const AvatarDetail = lazy(() => import("./pages/AvatarDetail"));
const SpyRadar = lazy(() => import("./pages/SpyRadar"));
const SpyOfferDetail = lazy(() => import("./pages/SpyOfferDetail"));
const CriativosPage = lazy(() => import("./pages/CriativosPage"));
const PlaceholderPage = lazy(() => import("./pages/PlaceholderPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-[60vh] w-full">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

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
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/ofertas" element={<Ofertas />} />
                <Route path="/ofertas/:id" element={<OfertaDetail />} />
                <Route path="/avatar" element={<AvatarList />} />
                <Route path="/avatar/:id" element={<AvatarDetail />} />
                <Route path="/spy" element={<SpyRadar />} />
                <Route path="/spy/:id" element={<SpyOfferDetail />} />
                <Route path="/criativos" element={<CriativosPage />} />
                <Route path="/paginas" element={<PlaceholderPage title="Páginas" description="Landing pages e funis" />} />
                <Route path="/analytics" element={<PlaceholderPage title="Analytics" description="Métricas e performance" />} />
                <Route path="/prompts" element={<PlaceholderPage title="Prompts & Agents" description="Seus prompts e agentes de IA" />} />
                <Route path="/settings" element={<PlaceholderPage title="Configurações" description="Configurações do workspace" />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
  </ErrorBoundary>
);

export default App;
