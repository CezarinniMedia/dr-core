import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Users, Sparkles, TrendingUp, ArrowRight, Rocket, CheckCircle, Clock, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [offersRes, avatarsRes, creativesRes, trafficRes] = await Promise.all([
        supabase.from("spied_offers").select("id", { count: "exact", head: true }),
        supabase.from("avatars").select("id", { count: "exact", head: true }),
        supabase.from("ad_creatives").select("id", { count: "exact", head: true }),
        supabase.from("offer_traffic_data").select("id", { count: "exact", head: true }),
      ]);
      return {
        offers: offersRes.count ?? 0,
        avatars: avatarsRes.count ?? 0,
        creatives: creativesRes.count ?? 0,
        trafficRecords: trafficRes.count ?? 0,
      };
    },
    staleTime: 60_000,
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
  const { data: stats, isLoading } = useDashboardStats();

  const statCards = [
    { label: "Ofertas Espionadas", value: isLoading ? "..." : formatCount(stats?.offers ?? 0), icon: Package, color: "text-primary" },
    { label: "Avatares", value: isLoading ? "..." : formatCount(stats?.avatars ?? 0), icon: Users, color: "text-success" },
    { label: "Criativos", value: isLoading ? "..." : formatCount(stats?.creatives ?? 0), icon: Sparkles, color: "text-accent" },
    { label: "Registros Tráfego", value: isLoading ? "..." : formatCount(stats?.trafficRecords ?? 0), icon: TrendingUp, color: "text-warning" },
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
              <div className="text-2xl font-bold">{stat.value}</div>
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
