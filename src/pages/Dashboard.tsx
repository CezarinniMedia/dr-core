import { Package, Flame, TrendingUp, Zap, Clock, AlertTriangle, ArrowRight, Search, Users, Sparkles } from "lucide-react";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { DataMetricCard } from "@/shared/design-system/components/DataMetricCard";
import { StatusDistributionChart } from "@/features/dashboard/components/StatusDistributionChart";
import { SpikeAlertCard } from "@/features/dashboard/components/SpikeAlertCard";
import { ActivityFeed } from "@/features/dashboard/components/ActivityFeed";
import { HeatmapCalendar } from "@/features/dashboard/components/HeatmapCalendar";
import {
  useDashboardMetrics,
  useDashboardActivity,
} from "@/features/dashboard/hooks/useDashboardMetrics";
import { useSpikeAlerts } from "@/features/dashboard/hooks/useSpikeAlerts";
import { useActivityHeatmap } from "@/features/dashboard/hooks/useActivityHeatmap";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatNumber } from "@/shared/lib/utils";

function formatTimeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: ptBR });
  } catch {
    return "—";
  }
}

const quickLinks = [
  { label: "Radar de Ofertas", href: "/spy", icon: Search },
  { label: "Nova Oferta", href: "/ofertas", icon: Package },
  { label: "Pesquisar Avatar", href: "/avatar", icon: Users },
  { label: "Criar Criativo", href: "/criativos", icon: Sparkles },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: metrics, isLoading, isError } = useDashboardMetrics();
  const { data: spikes, isLoading: spikesLoading } = useSpikeAlerts();
  const { data: activities, isLoading: activitiesLoading } = useDashboardActivity(8);
  const { data: heatmapData, isLoading: heatmapLoading } = useActivityHeatmap(3);

  return (
    <div className="space-y-[var(--space-section-gap)] max-w-[var(--content-max-width)]">
      {/* Header */}
      <div>
        <h1 className="text-[length:var(--text-page-title)] font-[var(--font-bold)] text-[color:var(--text-primary)] tracking-tight">
          Dashboard
        </h1>
        <p className="text-[length:var(--text-body-size)] text-[color:var(--text-secondary)] mt-1">
          Intelligence center — visao geral da operacao
        </p>
      </div>

      {/* Error Banner */}
      {isError && (
        <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--semantic-error)]/30 bg-[var(--semantic-error)]/5 px-4 py-3 text-[length:var(--text-body-size)] text-[color:var(--semantic-error)]">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          Erro ao carregar metricas. Dados podem estar desatualizados.
        </div>
      )}

      {/* KPI Row — 5 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-[var(--space-card-gap)]">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-[var(--space-card-padding)]"
            >
              <Skeleton className="h-4 w-20 mb-3" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))
        ) : (
          <>
            <DataMetricCard
              label="Total no Radar"
              value={formatNumber(metrics?.total_active_offers ?? 0)}
              icon={<Package className="w-4 h-4" />}
            />
            <DataMetricCard
              label="Ofertas Hot"
              value={metrics?.hot_offers ?? 0}
              icon={<Flame className="w-4 h-4" style={{ color: "var(--semantic-hot)" }} />}
              className="hover:shadow-[var(--glow-error)]"
            />
            <DataMetricCard
              label="Scaling"
              value={metrics?.scaling_offers ?? 0}
              icon={<TrendingUp className="w-4 h-4" style={{ color: "var(--semantic-success)" }} />}
              className="hover:shadow-[var(--glow-success)]"
            />
            <DataMetricCard
              label="Spikes (30d)"
              value={metrics?.spikes_last_30d ?? 0}
              icon={<Zap className="w-4 h-4" style={{ color: "var(--semantic-spike)" }} />}
              className="hover:shadow-[0_0_20px_rgba(249,115,22,0.15)]"
            />
            <DataMetricCard
              label="Ultimo Update"
              value={formatTimeAgo(metrics?.last_offer_updated)}
              icon={<Clock className="w-4 h-4" />}
            />
          </>
        )}
      </div>

      {/* Main Content Grid: Spike Feed + Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[var(--space-card-gap)]">
        {/* Spike Alerts — 2 cols */}
        <div className="lg:col-span-2 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-[var(--space-card-padding)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[length:var(--text-card-title)] font-[var(--font-semibold)] text-[color:var(--text-primary)]">
              Spike Alerts
            </h2>
            {spikes && spikes.length > 0 && (
              <span className="text-[length:var(--text-caption)] text-[color:var(--semantic-spike)] font-medium">
                {spikes.length} detectados
              </span>
            )}
          </div>

          {spikesLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-shimmer rounded-lg h-16" />
              ))}
            </div>
          ) : spikes && spikes.length > 0 ? (
            <div className="space-y-2 max-h-[360px] overflow-y-auto">
              {spikes.slice(0, 8).map((spike) => (
                <SpikeAlertCard
                  key={`${spike.spied_offer_id}-${spike.domain}-${spike.period_date}`}
                  spike={spike}
                  onClick={(id) => navigate(`/spy/${id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[120px] text-[color:var(--text-muted)] text-[length:var(--text-label)]">
              Nenhum spike detectado recentemente
            </div>
          )}
        </div>

        {/* Status Distribution — 1 col */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-[var(--space-card-padding)]">
          <h2 className="text-[length:var(--text-card-title)] font-[var(--font-semibold)] text-[color:var(--text-primary)] mb-4">
            Status Distribution
          </h2>
          {isLoading ? (
            <div className="flex items-center justify-center h-[160px]">
              <Skeleton className="h-[140px] w-[140px] rounded-full" />
            </div>
          ) : metrics ? (
            <StatusDistributionChart metrics={metrics} />
          ) : (
            <div className="flex items-center justify-center h-[160px] text-[color:var(--text-muted)] text-[length:var(--text-label)]">
              Sem dados
            </div>
          )}
        </div>
      </div>

      {/* Activity Feed + Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[var(--space-card-gap)]">
        {/* Activity Feed — 2 cols */}
        <div className="lg:col-span-2 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-[var(--space-card-padding)]">
          <h2 className="text-[length:var(--text-card-title)] font-[var(--font-semibold)] text-[color:var(--text-primary)] mb-4">
            Atividade Recente
          </h2>
          <ActivityFeed activities={activities ?? []} isLoading={activitiesLoading} />
        </div>

        {/* Quick Links — 1 col */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-[var(--space-card-padding)]">
          <h2 className="text-[length:var(--text-card-title)] font-[var(--font-semibold)] text-[color:var(--text-primary)] mb-4">
            Acoes Rapidas
          </h2>
          <div className="space-y-2">
            {quickLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => navigate(link.href)}
                className="w-full flex items-center gap-3 p-3 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] hover:bg-[var(--bg-raised)] transition-colors text-left group"
              >
                <link.icon className="h-4 w-4 text-[color:var(--accent-primary)] shrink-0" />
                <span className="text-[length:var(--text-body-size)] text-[color:var(--text-body)] font-medium flex-1">
                  {link.label}
                </span>
                <ArrowRight className="h-4 w-4 text-[color:var(--text-muted)] group-hover:text-[color:var(--accent-primary)] transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Heatmap Calendar */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-[var(--space-card-padding)]">
        <h2 className="text-[length:var(--text-card-title)] font-[var(--font-semibold)] text-[color:var(--text-primary)] mb-4">
          Mapa de Atividade
        </h2>
        {heatmapLoading ? (
          <div className="flex gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[120px] w-[200px]" />
            ))}
          </div>
        ) : (
          <HeatmapCalendar data={heatmapData ?? []} months={3} />
        )}
      </div>
    </div>
  );
}
