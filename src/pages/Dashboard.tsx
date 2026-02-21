import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Users, Sparkles, TrendingUp, ArrowRight, Rocket, CheckCircle, Clock, Search, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type MvDashboardStats = {
  total_offers: number;
  unique_domains: number;
  active_offers: number;
  potential_offers: number;
  last_updated: string | null;
};

function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      // mv_dashboard_stats: pre-calculado, refresh a cada 15min
      // avatars e ad_creatives: tabelas pequenas, COUNT direto aceitavel
      const [dashboardRes, avatarsRes, creativesRes] = await Promise.all([
        supabase.from("mv_dashboard_stats").select("total_offers, unique_domains, active_offers, potential_offers").maybeSingle<MvDashboardStats>(),
        supabase.from("avatars").select("id", { count: "exact", head: true }),
        supabase.from("ad_creatives").select("id", { count: "exact", head: true }),
      ]);
      const firstError = dashboardRes.error || avatarsRes.error || creativesRes.error;
      if (firstError) throw new Error(firstError.message);
      return {
        offers: dashboardRes.data?.total_offers ?? 0,
        uniqueDomains: dashboardRes.data?.unique_domains ?? 0,
        activeOffers: dashboardRes.data?.active_offers ?? 0,
        avatars: avatarsRes.count ?? 0,
        creatives: creativesRes.count ?? 0,
      };
    },
    staleTime: 15 * 60_000, // 15min — alinhado com refresh da materialized view
    retry: 2,
  });
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

const quickLinks = [
  { label: "Radar de Ofertas", href: "/spy", icon: Search },
  { label: "Nova Oferta", href: "/ofertas", icon: Package },
  { label: "Pesquisar Avatar", href: "/avatar", icon: Users },
  { label: "Criar Criativo", href: "/criativos", icon: Sparkles },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: stats, isLoading, isError } = useDashboardStats();

  const statCards = [
    { label: "Ofertas Espionadas", value: formatCount(stats?.offers ?? 0), icon: Package, color: "text-primary" },
    { label: "Domínios Únicos", value: formatCount(stats?.uniqueDomains ?? 0), icon: TrendingUp, color: "text-warning" },
    { label: "Avatares", value: formatCount(stats?.avatars ?? 0), icon: Users, color: "text-success" },
    { label: "Criativos", value: formatCount(stats?.creatives ?? 0), icon: Sparkles, color: "text-accent" },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Visão geral da sua operação DR
        </p>
      </div>

      {/* Stats Grid */}
      {isError && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-center gap-2 py-3 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Erro ao carregar estatísticas. Os dados podem estar desatualizados.
          </CardContent>
        </Card>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stat.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Ações Rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => navigate(link.href)}
              className="flex items-center gap-3 p-4 rounded-lg border border-border/50 bg-card hover:bg-muted/50 transition-colors text-left group"
            >
              <link.icon className="h-5 w-5 text-primary shrink-0" />
              <span className="text-sm font-medium flex-1">{link.label}</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>
          ))}
        </div>
      </div>

      {/* Setup Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Rocket className="h-5 w-5" /> Bem-vindo ao DR Operations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 inline" /> Foundation setup completo — Auth, Database, Layout</p>
          <p className="flex items-center gap-1.5"><Clock className="h-4 w-4 inline" /> Próximo: Configure suas ofertas e comece a operar</p>
        </CardContent>
      </Card>
    </div>
  );
}
