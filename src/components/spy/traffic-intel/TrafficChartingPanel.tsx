import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";
import { TrafficChart } from "@/components/spy/TrafficChart";
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
      <div className="border border-dashed rounded-lg p-6 text-center">
        <p className="text-muted-foreground text-sm">Nenhum dado de trafego para as ofertas selecionadas no periodo.</p>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex gap-1.5 flex-wrap items-center">
            <span className="text-xs font-medium text-muted-foreground mr-1">No grafico:</span>
            {[...chartIds].map((id, idx) => {
              const offer = (allOffers as any[])?.find((o: any) => o.id === id);
              const color = CHART_LINE_COLORS[idx % CHART_LINE_COLORS.length];
              return (
                <Badge key={id} variant="secondary" className="gap-1.5 pr-1 text-xs">
                  <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: color }} />
                  {offer?.main_domain || offer?.nome || id}
                  <button onClick={() => onToggleChart(id)} className="ml-0.5 hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
          <Button variant="ghost" size="sm" className="text-xs" onClick={onClearChart}>
            Limpar grafico
          </Button>
        </div>
        <TrafficChart data={chartData} height={350} />
      </CardContent>
    </Card>
  );
}
