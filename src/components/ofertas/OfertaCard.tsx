import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, FlaskConical, Pause, Skull, Trash2, Zap } from "lucide-react";
import { ReactNode } from "react";
import { formatCurrency } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import type { Oferta } from "@/hooks/useOfertas";

const statusConfig: Record<string, { label: string; icon: ReactNode; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  RESEARCH: { label: "Research", icon: <FlaskConical className="h-3 w-3" />, variant: "secondary" },
  TEST: { label: "Testando", icon: <FlaskConical className="h-3 w-3" />, variant: "outline" },
  ATIVA: { label: "Ativa", icon: <Zap className="h-3 w-3" />, variant: "default" },
  PAUSE: { label: "Pausada", icon: <Pause className="h-3 w-3" />, variant: "secondary" },
  MORTA: { label: "Morta", icon: <Skull className="h-3 w-3" />, variant: "destructive" },
};

interface OfertaCardProps {
  oferta: Oferta;
  onDelete: (id: string) => void;
}

export function OfertaCard({ oferta, onDelete }: OfertaCardProps) {
  const navigate = useNavigate();
  const status = statusConfig[oferta.status] || statusConfig.RESEARCH;

  return (
    <Card className="group hover:border-primary/30 transition-colors">
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-3 space-y-0">
        <div className="space-y-1 min-w-0">
          <h3
            className="font-semibold truncate cursor-pointer hover:text-primary transition-colors"
            onClick={() => navigate(`/ofertas/${oferta.id}`)}
          >
            {oferta.nome}
          </h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {oferta.vertical && <span>{oferta.vertical}</span>}
            {oferta.vertical && oferta.mercado && <span>·</span>}
            {oferta.mercado && <span>{oferta.mercado}</span>}
          </div>
        </div>
        <Badge variant={status.variant} className="flex items-center gap-1">{status.icon} {status.label}</Badge>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mb-4">
          <div>
            <span className="text-muted-foreground">Ticket:</span>{" "}
            <span className="font-medium">{oferta.ticket_front ? formatCurrency(oferta.ticket_front) : "—"}</span>
          </div>
          <div>
            <span className="text-muted-foreground">CPA:</span>{" "}
            <span className="font-medium">{oferta.cpa_target ? formatCurrency(oferta.cpa_target) : "—"}</span>
          </div>
          <div>
            <span className="text-muted-foreground">AOV:</span>{" "}
            <span className="font-medium">{oferta.aov_target ? formatCurrency(oferta.aov_target) : "—"}</span>
          </div>
          <div>
            <span className="text-muted-foreground">ROAS:</span>{" "}
            <span className="font-medium">{oferta.roas_target ? `${oferta.roas_target}x` : "—"}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="outline" size="sm" onClick={() => navigate(`/ofertas/${oferta.id}`)}>
            <Edit className="h-3.5 w-3.5 mr-1" /> Editar
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => onDelete(oferta.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
