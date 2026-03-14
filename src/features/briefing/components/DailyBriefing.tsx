import { useNavigate } from "react-router-dom";
import {
  Package,
  Zap,
  Upload,
  Search,
  Plus,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  Clock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Button } from "@/shared/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { DataMetricCard } from "@/shared/design-system/components/DataMetricCard";
import { SpikeAlertCard } from "@/shared/design-system/components/SpikeAlertCard";
import { AmbientGlow } from "@/shared/design-system/primitives/AmbientGlow";
import { formatNumber } from "@/shared/lib/utils";
import { useAuth } from "@/shared/hooks/useAuth";
import {
  useBriefingMetrics,
  useBriefingSpikeAlerts,
} from "../hooks/useDailyBriefing";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

function formatDateHeader(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

function formatTimeAgo(dateStr: string): string {
  if (!dateStr) return "";
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: false, locale: ptBR });
  } catch {
    return "";
  }
}

function KPISkeleton() {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-[var(--space-card-padding)] h-24">
      <Skeleton className="h-3 w-20 mb-3" />
      <Skeleton className="h-9 w-16" />
    </div>
  );
}

function SpikeCardSkeleton() {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-4">
      <div className="flex items-start gap-3">
        <Skeleton className="h-2 w-2 rounded-full mt-2" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
}

interface PendingAction {
  key: string;
  icon: typeof AlertTriangle;
  iconColor: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  urgent: boolean;
  count: number;
}

export function DailyBriefing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: metrics, isLoading: metricsLoading } = useBriefingMetrics();
  const { data: spikes, isLoading: spikesLoading } = useBriefingSpikeAlerts(3);

  const userName = user?.user_metadata?.full_name?.split(" ")[0]
    ?? user?.email?.split("@")[0]
    ?? "Operador";

  // Build pending actions list — only show if count > 0
  const pendingActions: PendingAction[] = [];

  if (metrics) {
    if (metrics.creativesStale > 0) {
      pendingActions.push({
        key: "creatives",
        icon: AlertTriangle,
        iconColor: "var(--semantic-warning)",
        title: `${metrics.creativesStale} criativo${metrics.creativesStale > 1 ? "s" : ""} em TEST > 72h`,
        subtitle: "Precisam decisao WIN/KILL",
        ctaLabel: "Revisar Criativos",
        ctaHref: "/criativos",
        urgent: true,
        count: metrics.creativesStale,
      });
    }
    if (metrics.pendingImports > 0) {
      pendingActions.push({
        key: "imports",
        icon: Package,
        iconColor: "var(--accent-teal)",
        title: `${metrics.pendingImports} import${metrics.pendingImports > 1 ? "s" : ""} CSV aguardando`,
        subtitle: "Processamento pendente",
        ctaLabel: "Processar Imports",
        ctaHref: "/spy",
        urgent: false,
        count: metrics.pendingImports,
      });
    }
    if (metrics.newOffersSinceYesterday > 0) {
      pendingActions.push({
        key: "new-offers",
        icon: TrendingUp,
        iconColor: "var(--accent-green)",
        title: `${metrics.newOffersSinceYesterday} oferta${metrics.newOffersSinceYesterday > 1 ? "s" : ""} nova${metrics.newOffersSinceYesterday > 1 ? "s" : ""} desde ontem`,
        subtitle: "Adicionadas via import",
        ctaLabel: "Ver Novas Ofertas",
        ctaHref: "/spy",
        urgent: false,
        count: metrics.newOffersSinceYesterday,
      });
    }
  }

  const hasSpikes = spikes && spikes.length > 0;
  const hasPendingActions = pendingActions.length > 0;
  const allClear = !metricsLoading && !spikesLoading && !hasSpikes && !hasPendingActions;

  return (
    <div className="space-y-[var(--space-section-gap)] max-w-[var(--content-max-width)]">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[length:var(--text-page-title)] font-semibold text-[color:var(--text-primary)] tracking-tight">
            DAILY BRIEFING
          </h1>
          <p className="text-[length:var(--text-body-size)] text-[color:var(--text-secondary)] mt-1">
            {getGreeting()}, {userName}. Aqui esta seu briefing.
          </p>
        </div>
        <span className="text-[length:var(--text-label)] text-[color:var(--text-muted)] mt-1 shrink-0">
          {formatDateHeader()}
        </span>
      </div>

      {/* KPI Row — 4 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[var(--space-card-gap)]">
        {metricsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <KPISkeleton key={i} />)
        ) : (
          <>
            <DataMetricCard
              label="OFERTAS NO RADAR"
              value={formatNumber(metrics?.totalRadar ?? 0)}
              change={metrics?.totalRadarChange ?? undefined}
              icon={<Package className="w-4 h-4" />}
            />
            <div
              className="rounded-[var(--radius-lg)] transition-all duration-200"
              style={
                (metrics?.spikes7d ?? 0) > 0
                  ? {
                      border: "1px solid var(--semantic-spike)",
                      boxShadow: "var(--glow-amber)",
                      animation: "glow-pulse 2s ease-in-out infinite",
                    }
                  : undefined
              }
            >
              <DataMetricCard
                label="SPIKES 7D"
                value={metrics?.spikes7d ?? 0}
                icon={<Zap className="w-4 h-4" style={{ color: "var(--semantic-spike)" }} />}
                className={
                  (metrics?.spikes7d ?? 0) > 0
                    ? "border-transparent"
                    : undefined
                }
              />
            </div>
            <DataMetricCard
              label="IMPORTS PENDENTES"
              value={metrics?.pendingImports ?? 0}
              icon={<Upload className="w-4 h-4" />}
            />
            <DataMetricCard
              label="CRIATIVOS >72H TEST"
              value={metrics?.creativesStale ?? 0}
              icon={
                (metrics?.creativesStale ?? 0) > 0
                  ? <AlertTriangle className="w-4 h-4" style={{ color: "var(--semantic-warning)" }} />
                  : <Clock className="w-4 h-4" />
              }
            />
          </>
        )}
      </div>

      {/* Spike Alerts Section */}
      {(spikesLoading || hasSpikes) && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[length:var(--text-section-head)] font-semibold text-[color:var(--text-primary)]">
              SPIKES QUE PRECISAM DE ATENCAO
            </h2>
            <button
              onClick={() => navigate("/spy")}
              className="text-[length:var(--text-label)] text-[color:var(--accent-primary)] hover:underline transition-colors"
            >
              ver todos &gt;
            </button>
          </div>

          <div className="space-y-2">
            {spikesLoading ? (
              Array.from({ length: 3 }).map((_, i) => <SpikeCardSkeleton key={i} />)
            ) : (
              spikes?.map((spike) => (
                <SpikeAlertCard
                  key={spike.id}
                  offerName={spike.offer_name}
                  domain={spike.domain}
                  changePercent={spike.change_percent}
                  visitsBefore={spike.previous_visits}
                  visitsAfter={spike.current_visits}
                  detectedAt={spike.detected_at ? `ha ${formatTimeAgo(spike.detected_at)}` : ""}
                  isNew={true}
                  onClick={() => navigate(`/spy/${spike.spied_offer_id}`)}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* Acoes Pendentes Section */}
      {(metricsLoading || hasPendingActions) && (
        <div>
          <h2 className="text-[length:var(--text-section-head)] font-semibold text-[color:var(--text-primary)] mb-3">
            ACOES PENDENTES
          </h2>

          <div className="space-y-2">
            {metricsLoading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-4"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-5 w-5 rounded" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-8 w-32 rounded-md" />
                  </div>
                </div>
              ))
            ) : (
              pendingActions.map((action) => {
                const Icon = action.icon;
                return (
                  <div
                    key={action.key}
                    className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-4"
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className="w-5 h-5 shrink-0"
                        style={{ color: action.iconColor }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[length:var(--text-body-size)] font-medium text-[color:var(--text-primary)]">
                          {action.title}
                        </p>
                        <p className="text-[length:var(--text-label)] text-[color:var(--text-secondary)]">
                          {action.subtitle}
                        </p>
                      </div>
                      <Button
                        variant={action.urgent ? "default" : "outline"}
                        size="sm"
                        onClick={() => navigate(action.ctaHref)}
                        className={
                          action.urgent
                            ? "bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-light)] text-white"
                            : "border-[var(--border-interactive)] text-[color:var(--text-primary)] hover:border-[var(--accent-primary)]"
                        }
                      >
                        {action.ctaLabel}
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* All Clear State */}
      {allClear && (
        <AmbientGlow color="success" intensity="subtle">
          <div className="rounded-[var(--radius-lg)] border border-[var(--accent-green)]/20 bg-[var(--bg-surface)] p-8 text-center">
            <CheckCircle
              className="w-12 h-12 mx-auto mb-3"
              style={{ color: "var(--accent-green)" }}
            />
            <h3 className="text-[length:var(--text-section-head)] font-semibold text-[color:var(--text-primary)] mb-1">
              Tudo em dia!
            </h3>
            <p className="text-[length:var(--text-body-size)] text-[color:var(--text-secondary)] mb-4">
              Nenhuma acao pendente. Bora espionar?
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => navigate("/spy")}
                className="border-[var(--border-interactive)] text-[color:var(--text-primary)] hover:border-[var(--accent-primary)]"
              >
                <Upload className="w-4 h-4 mr-2" />
                Importar CSV
              </Button>
              <Button
                onClick={() => navigate("/spy")}
                className="bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-light)] text-white"
              >
                <Search className="w-4 h-4 mr-2" />
                Abrir Radar
              </Button>
            </div>
          </div>
        </AmbientGlow>
      )}

      {/* Acoes Rapidas */}
      <div>
        <h2 className="text-[length:var(--text-section-head)] font-semibold text-[color:var(--text-primary)] mb-3">
          ACOES RAPIDAS
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: Upload, label: "Importar CSV", shortcut: "Ctrl+I", href: "/spy" },
            { icon: Search, label: "Buscar (Cmd+K)", shortcut: "Cmd+K", action: "command-palette" },
            { icon: Plus, label: "Quick Add Oferta", shortcut: "Ctrl+N", href: "/spy" },
          ].map((item) => (
            <Tooltip key={item.label}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => {
                    if (item.action === "command-palette") {
                      document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
                    } else if (item.href) {
                      navigate(item.href);
                    }
                  }}
                  className="flex flex-col items-center gap-2 p-4 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)] cursor-pointer transition-all duration-200 hover:border-[var(--accent-primary)] hover:shadow-[var(--glow-primary)] hover:-translate-y-px"
                >
                  <item.icon className="w-6 h-6" style={{ color: "var(--accent-primary)" }} />
                  <span className="text-[length:var(--text-label)] text-[color:var(--text-secondary)] uppercase">
                    {item.label}
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{item.shortcut}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* Footer — last update timestamp */}
      <p className="text-[length:var(--text-caption)] text-[color:var(--text-muted)]">
        Ultima atualizacao: agora
      </p>
    </div>
  );
}
