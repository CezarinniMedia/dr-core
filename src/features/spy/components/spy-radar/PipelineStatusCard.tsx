import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  RefreshCw, Database, Activity, Zap, CheckCircle, Clock,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useToast } from "@/shared/hooks/use-toast";
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import {
  usePipelineStatus, useRefreshPipeline,
  type PipelineViewStatus, type PipelineRefreshResult,
} from "@/features/spy/hooks/usePipelineStatus";

const VIEW_INFO: Record<string, { label: string; icon: React.ElementType; description: string }> = {
  mv_dashboard_metrics: {
    label: "Dashboard",
    icon: Activity,
    description: "KPIs, contadores, spikes",
  },
  mv_traffic_summary: {
    label: "Trafego",
    icon: Database,
    description: "Sumarizacao de trafego por oferta",
  },
  mv_spike_detection: {
    label: "Spikes",
    icon: Zap,
    description: "Deteccao de spikes recentes",
  },
};

function ViewStatusItem({ status }: { status: PipelineViewStatus }) {
  const info = VIEW_INFO[status.view_name] ?? { label: status.view_name, icon: Database, description: "" };
  const Icon = info.icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2 text-xs">
          <Icon className="h-3.5 w-3.5 text-[var(--text-muted)]" />
          <span className="text-[var(--text-body)] font-medium">{info.label}</span>
          <span className="text-[var(--text-muted)] ml-auto tabular-nums">
            {status.row_count?.toLocaleString("pt-BR") ?? "—"} rows
          </span>
          {status.last_refreshed && (
            <span className="text-[var(--text-muted)] text-[10px]">
              {formatDistanceToNow(new Date(status.last_refreshed), { addSuffix: true, locale: ptBR })}
            </span>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="top">{info.description}</TooltipContent>
    </Tooltip>
  );
}

export function PipelineStatusCard() {
  const { toast } = useToast();
  const { data: statuses = [], isLoading } = usePipelineStatus();
  const refreshPipeline = useRefreshPipeline();
  const [lastRefreshResults, setLastRefreshResults] = useState<PipelineRefreshResult[] | null>(null);

  const handleRefresh = async () => {
    try {
      const results = await refreshPipeline.mutateAsync();
      setLastRefreshResults(results);
      const totalMs = results.reduce((s, r) => s + r.duration_ms, 0);
      toast({
        title: "Pipeline atualizado",
        description: `${results.length} views atualizadas em ${(totalMs / 1000).toFixed(1)}s`,
      });
    } catch (err: any) {
      toast({ title: "Erro no refresh", description: err.message, variant: "destructive" });
    }
  };

  // Get the most recent refresh time across all views
  const lastRefresh = statuses
    .map(s => s.last_refreshed)
    .filter(Boolean)
    .sort()
    .reverse()[0];

  return (
    <div className="border border-[var(--border-default)] rounded-[var(--radius-md)] bg-[var(--bg-surface)] p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-[var(--accent-teal)]" />
          <h3 className="text-sm font-medium text-[var(--text-body)]">Pipeline Status</h3>
        </div>
        <div className="flex items-center gap-2">
          {lastRefresh && (
            <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(lastRefresh), { addSuffix: true, locale: ptBR })}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1 border-[var(--border-default)]"
            onClick={handleRefresh}
            disabled={refreshPipeline.isPending}
            title="Atualizar todas as materialized views manualmente"
          >
            <RefreshCw className={`h-3 w-3 ${refreshPipeline.isPending ? "animate-spin" : ""}`} />
            {refreshPipeline.isPending ? "Atualizando..." : "Refresh"}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-xs text-[var(--text-muted)] py-2">Carregando status...</div>
      ) : (
        <div className="space-y-2">
          {statuses.map(s => (
            <ViewStatusItem key={s.view_name} status={s} />
          ))}
        </div>
      )}

      {lastRefreshResults && (
        <div className="mt-3 pt-2 border-t border-[var(--border-default)]">
          <div className="flex items-center gap-1.5 text-xs text-[var(--accent-green)] mb-1">
            <CheckCircle className="h-3 w-3" />
            <span>Ultimo refresh</span>
          </div>
          <div className="space-y-0.5">
            {lastRefreshResults.map(r => {
              const info = VIEW_INFO[r.view_name];
              return (
                <div key={r.view_name} className="flex items-center justify-between text-[10px] text-[var(--text-muted)]">
                  <span>{info?.label ?? r.view_name}</span>
                  <span className="tabular-nums">{r.duration_ms}ms</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/** Compact inline indicator for use in headers */
export function PipelineStatusIndicator() {
  const { data: statuses = [] } = usePipelineStatus();
  const refreshPipeline = useRefreshPipeline();
  const { toast } = useToast();

  const lastRefresh = statuses
    .map(s => s.last_refreshed)
    .filter(Boolean)
    .sort()
    .reverse()[0];

  const handleRefresh = async () => {
    try {
      const results = await refreshPipeline.mutateAsync();
      const totalMs = results.reduce((s, r) => s + r.duration_ms, 0);
      toast({
        title: "Pipeline atualizado",
        description: `${results.length} views em ${(totalMs / 1000).toFixed(1)}s`,
      });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)] hover:text-[var(--text-body)] transition-colors px-2 py-1 rounded-[var(--radius-sm)] hover:bg-[var(--bg-subtle)]"
          onClick={handleRefresh}
          disabled={refreshPipeline.isPending}
        >
          <RefreshCw className={`h-3 w-3 ${refreshPipeline.isPending ? "animate-spin text-[var(--accent-teal)]" : ""}`} />
          {lastRefresh
            ? formatDistanceToNow(new Date(lastRefresh), { addSuffix: true, locale: ptBR })
            : "Pipeline"
          }
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        Clique para atualizar materialized views (Dashboard, Trafego, Spikes)
      </TooltipContent>
    </Tooltip>
  );
}
