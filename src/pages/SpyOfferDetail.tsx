import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSpiedOffer, useUpdateSpiedOffer, useDeleteSpiedOffer } from "@/hooks/useSpiedOffers";
import { FullOfferFormModal } from "@/components/spy/FullOfferFormModal";
import { SpyOverviewTab } from "@/components/spy/tabs/SpyOverviewTab";
import { SpyDomainsTab } from "@/components/spy/tabs/SpyDomainsTab";
import { SpyLibrariesTab } from "@/components/spy/tabs/SpyLibrariesTab";
import { SpyCreativesTab } from "@/components/spy/tabs/SpyCreativesTab";
import { SpyFunnelTab } from "@/components/spy/tabs/SpyFunnelTab";
import { SpyNotesTab } from "@/components/spy/tabs/SpyNotesTab";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Edit, Trash2, ExternalLink } from "lucide-react";

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  RADAR: { label: "Radar", className: "bg-muted text-muted-foreground" },
  ANALYZING: { label: "Analyzing", className: "bg-warning/20 text-warning" },
  HOT: { label: "🔥 HOT", className: "bg-destructive/20 text-destructive" },
  SCALING: { label: "🚀 Scaling", className: "bg-success/20 text-success animate-pulse" },
  DYING: { label: "Dying", className: "bg-accent/20 text-accent" },
  DEAD: { label: "Dead", className: "bg-muted text-muted-foreground line-through" },
  CLONED: { label: "Cloned", className: "bg-primary/20 text-primary" },
};

function formatCurrency(value: number | null | undefined) {
  if (!value) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export default function SpyOfferDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: offer, isLoading } = useSpiedOffer(id!);
  const updateMutation = useUpdateSpiedOffer();
  const deleteMutation = useDeleteSpiedOffer();
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  if (isLoading) return <p className="text-muted-foreground p-6">Carregando...</p>;
  if (!offer) {
    return (
      <div className="p-6 space-y-4">
        <p className="text-muted-foreground">Oferta não encontrada.</p>
        <Button variant="outline" onClick={() => navigate("/spy")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
        </Button>
      </div>
    );
  }

  const sb = STATUS_BADGE[offer.status || "RADAR"] || STATUS_BADGE.RADAR;
  const domainsCount = offer.offer_domains?.length || 0;
  const adsCount = offer.ad_creatives?.length || 0;
  const funnelCount = offer.offer_funnel_steps?.length || 0;

  const handleStatusChange = (newStatus: string) => {
    updateMutation.mutate({ id: id!, data: { status: newStatus } });
  };

  return (
    <div className="max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/spy")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{offer.nome}</h1>
              <Badge variant="outline" className={sb.className}>{sb.label}</Badge>
            </div>
            {offer.main_domain && (
              <a
                href={`https://${offer.main_domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                {offer.main_domain} <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={offer.status || "RADAR"} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["RADAR", "ANALYZING", "HOT", "SCALING", "DYING", "DEAD", "CLONED"].map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => setShowEdit(true)}>
            <Edit className="h-3.5 w-3.5 mr-1" /> Editar
          </Button>
          <Button variant="outline" size="sm" className="text-destructive" onClick={() => setShowDelete(true)}>
            <Trash2 className="h-3.5 w-3.5 mr-1" /> Deletar
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <StatCard label="Vertical" value={offer.vertical || "—"} />
        <StatCard label="Ticket" value={formatCurrency(offer.product_ticket)} />
        <StatCard label="Tráfego Est." value={offer.estimated_monthly_traffic ? `${(offer.estimated_monthly_traffic / 1000).toFixed(0)}k` : "—"} />
        <StatCard label="Domínios" value={String(domainsCount)} />
        <StatCard label="Ads Salvos" value={String(adsCount)} />
        <StatCard label="Steps Funil" value={String(funnelCount)} />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="overview">📋 Overview</TabsTrigger>
          <TabsTrigger value="domains">🌐 Domínios</TabsTrigger>
          <TabsTrigger value="libraries">📚 Bibliotecas</TabsTrigger>
          <TabsTrigger value="creatives">🎨 Ad Creatives</TabsTrigger>
          <TabsTrigger value="funnel">🗺️ Funil</TabsTrigger>
          <TabsTrigger value="traffic">📊 Tráfego</TabsTrigger>
          <TabsTrigger value="notes">📝 Notas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <SpyOverviewTab offer={offer} />
        </TabsContent>
        <TabsContent value="domains" className="mt-4">
          <SpyDomainsTab offerId={id!} />
        </TabsContent>
        <TabsContent value="libraries" className="mt-4">
          <SpyLibrariesTab offerId={id!} />
        </TabsContent>
        <TabsContent value="creatives" className="mt-4">
          <SpyCreativesTab offerId={id!} offer={offer} />
        </TabsContent>
        <TabsContent value="funnel" className="mt-4">
          <SpyFunnelTab offerId={id!} />
        </TabsContent>
        <TabsContent value="traffic" className="mt-4">
          <div className="border border-dashed rounded-lg p-12 text-center">
            <p className="text-muted-foreground">📊 Dados de tráfego — Em breve (PART 3)</p>
          </div>
        </TabsContent>
        <TabsContent value="notes" className="mt-4">
          <SpyNotesTab offerId={id!} currentNotes={offer.notas} />
        </TabsContent>
      </Tabs>

      {/* Edit Modal */}
      <FullOfferFormModal open={showEdit} onClose={() => setShowEdit(false)} editData={offer} />

      {/* Delete Dialog */}
      <AlertDialog open={showDelete} onOpenChange={() => setShowDelete(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar oferta "{offer.nome}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Todos os domínios, bibliotecas, funil e ads associados serão removidos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                deleteMutation.mutate(id!, { onSuccess: () => navigate("/spy") });
              }}
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-3 text-center">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
