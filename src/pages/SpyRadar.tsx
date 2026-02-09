import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSpiedOffers, useDeleteSpiedOffer } from "@/hooks/useSpiedOffers";
import { QuickAddOfferModal } from "@/components/spy/QuickAddOfferModal";
import { FullOfferFormModal } from "@/components/spy/FullOfferFormModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Zap, Search, Eye, Trash2, Radar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const STATUS_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "RADAR", label: "Radar" },
  { value: "ANALYZING", label: "Analyzing" },
  { value: "HOT", label: "🔥 HOT" },
  { value: "SCALING", label: "🚀 Scaling" },
  { value: "DYING", label: "Dying" },
  { value: "DEAD", label: "Dead" },
  { value: "CLONED", label: "Cloned" },
];

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  RADAR: { label: "Radar", className: "bg-muted text-muted-foreground" },
  ANALYZING: { label: "Analyzing", className: "bg-warning/20 text-warning" },
  HOT: { label: "🔥 HOT", className: "bg-destructive/20 text-destructive" },
  SCALING: { label: "🚀 Scaling", className: "bg-success/20 text-success animate-pulse" },
  DYING: { label: "Dying", className: "bg-accent/20 text-accent" },
  DEAD: { label: "Dead", className: "bg-muted text-muted-foreground line-through" },
  CLONED: { label: "Cloned", className: "bg-primary/20 text-primary" },
};

const VERTICAL_BADGE: Record<string, string> = {
  nutra: "bg-success/20 text-success",
  info: "bg-info/20 text-info",
  tech: "bg-primary/20 text-primary",
};

const TREND_ICON: Record<string, string> = {
  UP: "↗️",
  DOWN: "↘️",
  STABLE: "→",
  SPIKE: "⚡",
  NEW: "🆕",
};

function formatCurrency(value: number | null | undefined) {
  if (!value) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export default function SpyRadar() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("all");
  const [vertical, setVertical] = useState("");
  const [source, setSource] = useState("");
  const [search, setSearch] = useState("");
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showFullForm, setShowFullForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const deleteMutation = useDeleteSpiedOffer();

  const { data: offers, isLoading } = useSpiedOffers({
    status: status !== "all" ? status : undefined,
    vertical: vertical || undefined,
    discovery_source: source || undefined,
    search: search || undefined,
  });

  const getCount = (item: any, relation: string) => {
    const rel = item[relation];
    if (!rel) return 0;
    if (Array.isArray(rel)) return rel.length;
    if (rel[0]?.count !== undefined) return rel[0].count;
    return 0;
  };

  return (
    <div className="max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">🔍 Radar de Ofertas</h1>
          <p className="text-muted-foreground text-sm">
            Monitore ofertas, espione funis e escale mais rápido
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowQuickAdd(true)}>
            <Zap className="h-4 w-4 mr-2" />
            Quick Add
          </Button>
          <Button variant="outline" onClick={() => setShowFullForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Oferta Completa
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-1 flex-wrap">
          {STATUS_OPTIONS.map((s) => (
            <Button
              key={s.value}
              variant={status === s.value ? "default" : "outline"}
              size="sm"
              onClick={() => setStatus(s.value)}
              className="text-xs"
            >
              {s.label}
            </Button>
          ))}
        </div>
        <Select value={vertical} onValueChange={(v) => setVertical(v === "all" ? "" : v)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Vertical" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="nutra">Nutra</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="tech">Tech</SelectItem>
          </SelectContent>
        </Select>
        <Select value={source} onValueChange={(v) => setSource(v === "all" ? "" : v)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Fonte" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="publicwww">PublicWWW</SelectItem>
            <SelectItem value="fb_ads_library">FB Ads Library</SelectItem>
            <SelectItem value="adheart">AdHeart</SelectItem>
            <SelectItem value="semrush">Semrush</SelectItem>
            <SelectItem value="manual">Manual</SelectItem>
          </SelectContent>
        </Select>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar nome, domínio, produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : !offers || offers.length === 0 ? (
        <div className="border border-dashed rounded-lg p-12 text-center space-y-4">
          <Radar className="h-12 w-12 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">Nenhuma oferta no radar ainda.</p>
          <p className="text-sm text-muted-foreground">Comece adicionando ofertas que você encontrou espionando.</p>
          <Button onClick={() => setShowQuickAdd(true)}>
            <Zap className="h-4 w-4 mr-2" /> Quick Add
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[90px]">Status</TableHead>
                <TableHead className="w-[200px]">Nome</TableHead>
                <TableHead className="w-[80px]">Vertical</TableHead>
                <TableHead className="w-[80px]">Ticket</TableHead>
                <TableHead className="w-[100px]">Tráfego</TableHead>
                <TableHead className="w-[100px]">Fonte</TableHead>
                <TableHead className="w-[60px] text-center">Dom.</TableHead>
                <TableHead className="w-[60px] text-center">Ads</TableHead>
                <TableHead className="w-[60px] text-center">Funil</TableHead>
                <TableHead className="w-[90px]">Descoberto</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offers.map((offer: any) => {
                const sb = STATUS_BADGE[offer.status] || STATUS_BADGE.RADAR;
                const domainsCount = getCount(offer, "offer_domains");
                const adsCount = getCount(offer, "ad_creatives");
                const funnelCount = getCount(offer, "offer_funnel_steps");

                return (
                  <TableRow
                    key={offer.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => navigate(`/spy/${offer.id}`)}
                  >
                    <TableCell>
                      <Badge variant="outline" className={sb.className}>
                        {sb.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-sm">{offer.nome}</p>
                      {offer.main_domain && (
                        <p className="text-xs text-muted-foreground">{offer.main_domain}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      {offer.vertical && (
                        <Badge variant="outline" className={VERTICAL_BADGE[offer.vertical] || ""}>
                          {offer.vertical}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatCurrency(offer.product_ticket)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {offer.estimated_monthly_traffic
                        ? `${(offer.estimated_monthly_traffic / 1000).toFixed(0)}k`
                        : "—"}
                      {offer.traffic_trend && (
                        <span className="ml-1">{TREND_ICON[offer.traffic_trend] || ""}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {offer.discovery_source || "—"}
                    </TableCell>
                    <TableCell className="text-center text-sm">{domainsCount}</TableCell>
                    <TableCell className="text-center text-sm">{adsCount}</TableCell>
                    <TableCell className="text-center text-sm">
                      {funnelCount > 0 ? "✅" : "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {offer.discovered_at
                        ? format(new Date(offer.discovered_at), "dd MMM", { locale: ptBR })
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => navigate(`/spy/${offer.id}`)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => setDeleteId(offer.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Modals */}
      <QuickAddOfferModal open={showQuickAdd} onClose={() => setShowQuickAdd(false)} />
      <FullOfferFormModal open={showFullForm} onClose={() => setShowFullForm(false)} />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar oferta?</AlertDialogTitle>
            <AlertDialogDescription>
              Todos os domínios, bibliotecas, funil e ads associados serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) deleteMutation.mutate(deleteId);
                setDeleteId(null);
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
