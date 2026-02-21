import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSpiedOffer, useUpdateSpiedOffer, useDeleteSpiedOffer } from "@/features/spy/hooks/useSpiedOffers";
import { FullOfferFormModal } from "@/features/spy/components/FullOfferFormModal";
import { SpyOverviewTab } from "@/features/spy/components/tabs/SpyOverviewTab";
import { SpyDomainsTab } from "@/features/spy/components/tabs/SpyDomainsTab";
import { SpyLibrariesTab } from "@/features/spy/components/tabs/SpyLibrariesTab";
import { SpyCreativesTab } from "@/features/spy/components/tabs/SpyCreativesTab";
import { SpyFunnelTab } from "@/features/spy/components/tabs/SpyFunnelTab";
import { SpyNotesTab } from "@/features/spy/components/tabs/SpyNotesTab";
import { SpyTrafficTab } from "@/features/spy/components/tabs/SpyTrafficTab";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { Edit, Trash2, ExternalLink, Flame, Rocket, LayoutList, Globe, BookOpen, Palette, Map, BarChart3, FileText, Radar } from "lucide-react";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { PageBreadcrumb } from "@/shared/components/ui/PageBreadcrumb";

const STATUS_BADGE: Record<string, { label: React.ReactNode; className: string }> = {
  RADAR: { label: "Radar", className: "bg-muted text-muted-foreground" },
  ANALYZING: { label: "Analyzing", className: "bg-warning/20 text-warning" },
  HOT: { label: <><Flame className="h-3.5 w-3.5 inline" /> HOT</>, className: "bg-destructive/20 text-destructive" },
  SCALING: { label: <><Rocket className="h-3.5 w-3.5 inline" /> Scaling</>, className: "bg-success/20 text-success animate-pulse" },
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

  if (isLoading) return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-9" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-md" />
        ))}
      </div>
      <Card>
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    </div>
  );
  if (!offer) {
    return (
      <div className="p-6 space-y-4">
        <PageBreadcrumb items={[
          { label: "Radar de Ofertas", href: "/spy", icon: Radar },
          { label: "Oferta não encontrada" },
        ]} />
        <p className="text-muted-foreground">Oferta não encontrada.</p>
        <Button variant="outline" onClick={() => navigate("/spy")}>
          Voltar ao Radar
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
      {/* Breadcrumb */}
      <PageBreadcrumb items={[
        { label: "Radar de Ofertas", href: "/spy", icon: Radar },
        { label: offer.nome || "Oferta" },
      ]} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{offer.nome}</h1>
            <Badge variant="outline" className={sb.className}>{sb.label}</Badge>
          </div>
            <div className="flex items-center gap-3">
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
              {(offer as any).domain_created_at && (
                <span className="text-xs text-muted-foreground">
                  Domínio criado em: {new Date((offer as any).domain_created_at).toLocaleDateString("pt-BR")}
                </span>
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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard label="Vertical" value={offer.vertical || "—"} />
        <StatCard label="Ticket" value={formatCurrency(offer.product_ticket)} />
        <StatCard label="Domínios" value={String(domainsCount)} />
        <StatCard label="Ads Salvos" value={String(adsCount)} />
        <StatCard label="Steps Funil" value={String(funnelCount)} />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="overview" className="flex items-center gap-1.5"><LayoutList className="h-4 w-4" /> Overview</TabsTrigger>
          <TabsTrigger value="domains" className="flex items-center gap-1.5"><Globe className="h-4 w-4" /> Domínios</TabsTrigger>
          <TabsTrigger value="libraries" className="flex items-center gap-1.5"><BookOpen className="h-4 w-4" /> Bibliotecas</TabsTrigger>
          <TabsTrigger value="creatives" className="flex items-center gap-1.5"><Palette className="h-4 w-4" /> Ad Creatives</TabsTrigger>
          <TabsTrigger value="funnel" className="flex items-center gap-1.5"><Map className="h-4 w-4" /> Funil</TabsTrigger>
          <TabsTrigger value="traffic" className="flex items-center gap-1.5"><BarChart3 className="h-4 w-4" /> Tráfego</TabsTrigger>
          <TabsTrigger value="notes" className="flex items-center gap-1.5"><FileText className="h-4 w-4" /> Notas</TabsTrigger>
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
          <SpyTrafficTab
            offerId={id!}
            offerDomains={offer.offer_domains}
            mainDomain={offer.main_domain}
          />
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
