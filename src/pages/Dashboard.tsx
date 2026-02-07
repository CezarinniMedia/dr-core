import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Users, Sparkles, TrendingUp, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const stats = [
  { label: "Ofertas Ativas", value: "0", icon: Package, color: "text-primary" },
  { label: "Avatares", value: "0", icon: Users, color: "text-success" },
  { label: "Criativos Ativos", value: "0", icon: Sparkles, color: "text-accent" },
  { label: "ROAS Médio", value: "—", icon: TrendingUp, color: "text-warning" },
];

const quickLinks = [
  { label: "Nova Oferta", href: "/ofertas", icon: Package },
  { label: "Pesquisar Avatar", href: "/avatar", icon: Users },
  { label: "Criar Criativo", href: "/criativos", icon: Sparkles },
  { label: "Espionar Concorrente", href: "/spy", icon: TrendingUp },
];

export default function DashboardPage() {
  const navigate = useNavigate();

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
        {stats.map((stat) => (
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
          <CardTitle className="text-lg">🚀 Bem-vindo ao DR Operations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>✅ Foundation setup completo — Auth, Database, Layout</p>
          <p>⏳ Próximo: Configure suas ofertas e comece a operar</p>
        </CardContent>
      </Card>
    </div>
  );
}
