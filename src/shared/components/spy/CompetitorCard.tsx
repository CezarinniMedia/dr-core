import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { ExternalLink, Eye, Flame, Snowflake, Trash2, TrendingUp, Zap } from "lucide-react";
import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

const statusConfig: Record<string, { label: string; icon: ReactNode; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  HOT: { label: "HOT", icon: <Flame className="h-3 w-3" />, variant: "destructive" },
  WARM: { label: "WARM", icon: <Zap className="h-3 w-3" />, variant: "default" },
  COLD: { label: "COLD", icon: <Snowflake className="h-3 w-3" />, variant: "secondary" },
};

interface CompetitorCardProps {
  competitor: {
    id: string;
    nome: string;
    dominio?: string | null;
    vertical?: string | null;
    status_tracking?: string | null;
    traffic_score?: number | null;
    last_active_date?: string | null;
    ad_creatives?: Array<{ count: number }>;
  };
  onDelete: (id: string) => void;
}

export function CompetitorCard({ competitor, onDelete }: CompetitorCardProps) {
  const navigate = useNavigate();
  const status = statusConfig[competitor.status_tracking || "WARM"] || statusConfig.WARM;

  return (
    <Card className="hover:border-primary/40 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-base">{competitor.nome}</h3>
            {competitor.dominio && (
              <a
                href={`https://${competitor.dominio}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1 mt-0.5"
              >
                {competitor.dominio}
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
          <Badge variant={status.variant} className="flex items-center gap-1">{status.icon} {status.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs text-muted-foreground space-y-1">
          <p>Vertical: {competitor.vertical || "—"}</p>
          <p className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Traffic Score: {competitor.traffic_score ? `${competitor.traffic_score}/10` : "—"}
          </p>
          <p>Ads salvos: {competitor.ad_creatives?.[0]?.count || 0}</p>
        </div>

        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => navigate(`/spy/${competitor.id}`)}
          >
            <Eye className="h-3.5 w-3.5 mr-1" /> Ver Detalhes
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(competitor.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
