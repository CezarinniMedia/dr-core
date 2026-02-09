import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SpyOverviewTabProps {
  offer: any;
}

export function SpyOverviewTab({ offer }: SpyOverviewTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">💰 Produto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <InfoRow label="Nome" value={offer.product_name} />
          <InfoRow label="Promessa" value={offer.product_promise} />
          <InfoRow label="Ticket" value={offer.product_ticket ? `R$ ${offer.product_ticket}` : null} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">🛒 Checkout & VSL</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <InfoRow label="Checkout" value={offer.checkout_provider} />
          {offer.checkout_url && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs w-20 shrink-0">URL</span>
              <a href={offer.checkout_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs truncate flex items-center gap-1">
                {offer.checkout_url} <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            </div>
          )}
          <InfoRow label="VSL Player" value={offer.vsl_player} />
          <InfoRow label="Duração" value={offer.vsl_duration} />
          {offer.vsl_url && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs w-20 shrink-0">VSL URL</span>
              <a href={offer.vsl_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs truncate flex items-center gap-1">
                {offer.vsl_url} <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">🔍 Descoberta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <InfoRow label="Fonte" value={offer.discovery_source} />
          <InfoRow label="Query" value={offer.discovery_query} />
          <InfoRow label="Detalhe" value={offer.discovery_tool_detail} />
          <InfoRow label="Descoberto em" value={offer.discovered_at ? format(new Date(offer.discovered_at), "dd MMM yyyy", { locale: ptBR }) : null} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">🕸️ Operador</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <InfoRow label="Nome" value={offer.operator_name} />
          <InfoRow label="Rede" value={offer.operator_network} />
          <InfoRow label="Geo" value={offer.geo} />
          <InfoRow label="Vertical" value={offer.vertical} />
          <InfoRow label="Subnicho" value={offer.subnicho} />
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">📊 Estimativas</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-8 text-sm">
          <InfoRow label="Tráfego mensal" value={offer.estimated_monthly_traffic ? `${offer.estimated_monthly_traffic.toLocaleString()}` : null} />
          <InfoRow label="Revenue mensal" value={offer.estimated_monthly_revenue ? `R$ ${Number(offer.estimated_monthly_revenue).toLocaleString()}` : null} />
          <InfoRow label="Tendência" value={offer.traffic_trend} />
          <InfoRow label="Prioridade" value={offer.priority !== null && offer.priority !== undefined ? `${offer.priority}/10` : null} />
        </CardContent>
      </Card>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-muted-foreground text-xs w-20 shrink-0">{label}</span>
      <span className="text-xs">{value || "—"}</span>
    </div>
  );
}
