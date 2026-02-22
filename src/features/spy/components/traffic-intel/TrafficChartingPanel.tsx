import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { X, BarChart3 } from "lucide-react";
import { TrafficChart } from "@/features/spy/components/TrafficChart";
import { CHART_LINE_COLORS } from "./types";

interface TrafficChartingPanelProps {
  chartIds: Set<string>;
  chartData: { period_date: string; visits: number; domain: string }[];
  allOffers: any[] | undefined;
  onToggleChart: (id: string) => void;
  onClearChart: () => void;
}

export function TrafficChartingPanel({ chartIds, chartData, allOffers, onToggleChart, onClearChart }: TrafficChartingPanelProps) {
  if (chartIds.size === 0) return null;

  if (chartData.length === 0) {
    return (
      <div
        className="border border-dashed rounded-lg p-8 text-center"
        style={{
          borderColor: "var(--border-default, #1F1F1F)",
          background: "var(--bg-surface, #141414)",
        }}
      >
        <BarChart3 className="h-8 w-8 mx-auto mb-2" style={{ color: "var(--text-muted, #6B7280)" }} />
        <p style={{ color: "var(--text-secondary, #949494)" }} className="text-sm">
          Nenhum dado de trafego para as ofertas selecionadas no periodo.
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-lg p-4"
      style={{
        background: "var(--bg-surface, #141414)",
        border: "1px solid var(--border-default, #1F1F1F)",
        boxShadow: "0 0 0 1px var(--border-default, #1F1F1F), 0 8px 32px rgba(0,0,0,0.3)",
      }}
    >
      {/* Header: selected offers badges */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-1.5 flex-wrap items-center">
          <span className="text-[11px] font-medium mr-1" style={{ color: "var(--text-muted, #6B7280)" }}>
            Comparando:
          </span>
          {[...chartIds].map((id, idx) => {
            const offer = (allOffers as any[])?.find((o: any) => o.id === id);
            const color = CHART_LINE_COLORS[idx % CHART_LINE_COLORS.length];
            return (
              <Badge
                key={id}
                variant="secondary"
                className="gap-1.5 pr-1 text-[11px] transition-all"
                style={{
                  background: `${color}15`,
                  borderColor: `${color}30`,
                  color: color,
                }}
              >
                <span
                  className="w-2.5 h-1 rounded-sm shrink-0"
                  style={{
                    backgroundColor: color,
                    boxShadow: `0 0 6px ${color}40`,
                  }}
                />
                {offer?.main_domain || offer?.nome || id}
                <button
                  onClick={() => onToggleChart(id)}
                  aria-label="Remover do gráfico"
                  className="ml-0.5 rounded-sm hover:opacity-70 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
          style={{ color: "var(--text-secondary, #949494)" }}
          onClick={onClearChart}
        >
          Limpar
        </Button>
      </div>

      {/* Chart */}
      <TrafficChart data={chartData} height={380} />
    </div>
  );
}
