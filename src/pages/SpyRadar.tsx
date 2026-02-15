import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSpiedOffers, useDeleteSpiedOffer, useUpdateSpiedOffer } from "@/hooks/useSpiedOffers";
import { QuickAddOfferModal } from "@/components/spy/QuickAddOfferModal";
import { FullOfferFormModal } from "@/components/spy/FullOfferFormModal";
import { UniversalImportModal } from "@/components/spy/UniversalImportModal";
import { TrafficIntelligenceView } from "@/components/spy/TrafficIntelligenceView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Zap, Search, Eye, Trash2, Radar, FileSpreadsheet, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

const PAGE_SIZE_OPTIONS = [
  { value: "10", label: "10 por página" },
  { value: "25", label: "25 por página" },
  { value: "50", label: "50 por página" },
  { value: "100", label: "100 por página" },
  { value: "all", label: "Todas (infinito)" },
];

function formatCurrency(value: number | null | undefined) {
  if (!value) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export default function SpyRadar() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState("all");
  const [vertical, setVertical] = useState("");
  const [source, setSource] = useState("");
  const [search, setSearch] = useState("");
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showFullForm, setShowFullForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<"single" | "bulk" | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [mainTab, setMainTab] = useState("offers");

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const lastClickedIndex = useRef<number | null>(null);

  // Pagination
  const [pageSize, setPageSize] = useState("25");
  const [currentPage, setCurrentPage] = useState(0);

  // Bulk status change
  const [bulkStatusTarget, setBulkStatusTarget] = useState<string | null>(null);

  const deleteMutation = useDeleteSpiedOffer();
  const updateMutation = useUpdateSpiedOffer();

  const { data: offers, isLoading, refetch } = useSpiedOffers({
    status: status !== "all" ? status : undefined,
    vertical: vertical || undefined,
    discovery_source: source || undefined,
    search: search || undefined,
  });

  const getCount = (item: any, relation: string) => {
    const rel = item[relation];
    if (!rel) return 0;
    if (Array.isArray(rel) && rel.length > 0 && rel[0]?.count !== undefined) return rel[0].count;
    if (Array.isArray(rel)) return rel.length;
    return 0;
  };

  // Pagination logic
  const totalOffers = offers?.length ?? 0;
  const isInfinite = pageSize === "all";
  const pageSizeNum = isInfinite ? totalOffers : parseInt(pageSize);
  const totalPages = isInfinite ? 1 : Math.max(1, Math.ceil(totalOffers / pageSizeNum));
  const visibleOffers = isInfinite
    ? (offers ?? [])
    : (offers ?? []).slice(currentPage * pageSizeNum, (currentPage + 1) * pageSizeNum);

  // Reset page when filters change
  const handleFilterChange = useCallback(() => {
    setCurrentPage(0);
    setSelectedIds(new Set());
  }, []);

  // Selection handlers
  const handleRowSelect = useCallback((offerId: string, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => {
      const next = new Set(prev);

      if (e.shiftKey && lastClickedIndex.current !== null && offers) {
        // Range select
        const start = Math.min(lastClickedIndex.current, index);
        const end = Math.max(lastClickedIndex.current, index);
        const globalStart = currentPage * pageSizeNum + start;
        const globalEnd = currentPage * pageSizeNum + end;
        for (let i = globalStart; i <= globalEnd; i++) {
          if (offers[i]) next.add(offers[i].id);
        }
      } else if (e.metaKey || e.ctrlKey) {
        // Toggle single
        if (next.has(offerId)) next.delete(offerId);
        else next.add(offerId);
      } else {
        // Single select (replace)
        if (next.size === 1 && next.has(offerId)) {
          next.clear();
        } else {
          next.clear();
          next.add(offerId);
        }
      }

      lastClickedIndex.current = index;
      return next;
    });
  }, [offers, currentPage, pageSizeNum]);

  const handleSelectAll = useCallback(() => {
    if (!offers) return;
    if (selectedIds.size === offers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(offers.map(o => o.id)));
    }
  }, [offers, selectedIds]);

  const handleSelectPage = useCallback(() => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      const allPageSelected = visibleOffers.every(o => next.has(o.id));
      if (allPageSelected) {
        visibleOffers.forEach(o => next.delete(o.id));
      } else {
        visibleOffers.forEach(o => next.add(o.id));
      }
      return next;
    });
  }, [visibleOffers]);

  // Bulk actions
  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    try {
      const { error } = await supabase.from('spied_offers').delete().in('id', ids);
      if (error) throw error;
      toast({ title: `✅ ${ids.length} ofertas removidas!` });
      setSelectedIds(new Set());
      refetch();
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    }
    setDeleteTarget(null);
  };

  const handleBulkStatusChange = async (newStatus: string) => {
    const ids = Array.from(selectedIds);
    try {
      const { error } = await supabase.from('spied_offers').update({ status: newStatus } as any).in('id', ids);
      if (error) throw error;
      toast({ title: `✅ ${ids.length} ofertas → ${newStatus}` });
      setSelectedIds(new Set());
      setBulkStatusTarget(null);
      refetch();
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    }
  };

  const allPageChecked = visibleOffers.length > 0 && visibleOffers.every(o => selectedIds.has(o.id));
  const somePageChecked = visibleOffers.some(o => selectedIds.has(o.id));

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
          <Button variant="outline" onClick={() => setShowImport(true)}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Importar CSV
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={mainTab} onValueChange={setMainTab}>
        <TabsList>
          <TabsTrigger value="offers">📋 Ofertas</TabsTrigger>
          <TabsTrigger value="comparison">📊 Inteligência de Tráfego</TabsTrigger>
          <TabsTrigger value="about">ℹ️ Sobre</TabsTrigger>
        </TabsList>

        <TabsContent value="offers" className="mt-4 space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="flex gap-1 flex-wrap">
              {STATUS_OPTIONS.map((s) => (
                <Button
                  key={s.value}
                  variant={status === s.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => { setStatus(s.value); handleFilterChange(); }}
                  className="text-xs"
                >
                  {s.label}
                </Button>
              ))}
            </div>
            <Select value={vertical} onValueChange={(v) => { setVertical(v === "all" ? "" : v); handleFilterChange(); }}>
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
            <Select value={source} onValueChange={(v) => { setSource(v === "all" ? "" : v); handleFilterChange(); }}>
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
                onChange={(e) => { setSearch(e.target.value); handleFilterChange(); }}
                className="pl-9"
              />
            </div>
          </div>

          {/* Bulk action bar */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
              <span className="text-sm font-medium">{selectedIds.size} selecionada(s)</span>
              <Button size="sm" variant="outline" onClick={handleSelectAll}>
                {selectedIds.size === totalOffers ? "Desmarcar todas" : `Selecionar todas (${totalOffers})`}
              </Button>
              <div className="flex-1" />
              <Select onValueChange={(v) => handleBulkStatusChange(v)}>
                <SelectTrigger className="w-40 h-8">
                  <SelectValue placeholder="Alterar status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.filter(s => s.value !== "all").map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" variant="destructive" onClick={() => setDeleteTarget("bulk")}>
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Apagar ({selectedIds.size})
              </Button>
            </div>
          )}

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
            <>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]">
                        <Checkbox
                          checked={allPageChecked}
                          ref={(el) => {
                            if (el) {
                              const input = el as unknown as HTMLButtonElement;
                              if (somePageChecked && !allPageChecked) {
                                input.dataset.state = "indeterminate";
                              }
                            }
                          }}
                          onCheckedChange={handleSelectPage}
                          aria-label="Selecionar página"
                        />
                      </TableHead>
                      <TableHead className="w-[90px]">Status</TableHead>
                      <TableHead className="w-[200px]">Nome</TableHead>
                      <TableHead className="w-[80px]">Vertical</TableHead>
                      <TableHead className="w-[80px]">Ticket</TableHead>
                      <TableHead className="w-[120px]">Tráfego</TableHead>
                      <TableHead className="w-[100px]">Fonte</TableHead>
                      <TableHead className="w-[60px] text-center">Dom.</TableHead>
                      <TableHead className="w-[60px] text-center">Ads</TableHead>
                      <TableHead className="w-[60px] text-center">Funil</TableHead>
                      <TableHead className="w-[90px]">Descoberto</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleOffers.map((offer: any, visibleIdx: number) => {
                      const sb = STATUS_BADGE[offer.status] || STATUS_BADGE.RADAR;
                      const domainsCount = getCount(offer, "offer_domains");
                      const adsCount = getCount(offer, "ad_creatives");
                      const funnelCount = getCount(offer, "offer_funnel_steps");
                      const isSelected = selectedIds.has(offer.id);

                      return (
                        <TableRow
                          key={offer.id}
                          className={`cursor-pointer transition-colors ${isSelected ? "bg-primary/10" : "hover:bg-muted/50"}`}
                          onClick={(e) => {
                            // If cmd/ctrl/shift is held, do selection instead of navigation
                            if (e.metaKey || e.ctrlKey || e.shiftKey) {
                              handleRowSelect(offer.id, visibleIdx, e);
                            } else if (selectedIds.size > 0) {
                              handleRowSelect(offer.id, visibleIdx, e);
                            } else {
                              navigate(`/spy/${offer.id}`);
                            }
                          }}
                        >
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => {
                                setSelectedIds(prev => {
                                  const next = new Set(prev);
                                  if (next.has(offer.id)) next.delete(offer.id);
                                  else next.add(offer.id);
                                  return next;
                                });
                              }}
                              aria-label={`Selecionar ${offer.nome}`}
                            />
                          </TableCell>
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
                                onClick={() => { setDeleteId(offer.id); setDeleteTarget("single"); }}
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

              {/* Pagination */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Select value={pageSize} onValueChange={(v) => { setPageSize(v); setCurrentPage(0); }}>
                    <SelectTrigger className="w-40 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAGE_SIZE_OPTIONS.map(o => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-xs text-muted-foreground">
                    {totalOffers} oferta(s)
                  </span>
                </div>
                {!isInfinite && totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={currentPage === 0}
                      onClick={() => setCurrentPage(p => p - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {currentPage + 1} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={currentPage >= totalPages - 1}
                      onClick={() => setCurrentPage(p => p + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="comparison" className="mt-4">
          <TrafficIntelligenceView />
        </TabsContent>

        <TabsContent value="about" className="mt-4">
          <div className="border rounded-lg p-6 max-w-2xl space-y-4">
            <h2 className="text-lg font-semibold">Ciclo de Vida das Ofertas</h2>
            <p className="text-sm text-muted-foreground">Cada oferta no radar passa por um ciclo de qualificação. Use os status abaixo para organizar seu pipeline de espionagem:</p>
            <div className="space-y-3">
              {[
                { status: "RADAR", emoji: "📡", title: "Radar", desc: "Oferta recém-descoberta. Ainda não foi analisada em detalhe. É o ponto de entrada — tudo que você encontra espionando começa aqui." },
                { status: "ANALYZING", emoji: "🔍", title: "Analyzing", desc: "Você está investigando ativamente: analisando funil, criativos, tráfego e viabilidade. A oferta está sob avaliação." },
                { status: "HOT", emoji: "🔥", title: "HOT", desc: "A oferta mostrou sinais fortes: tráfego crescente, múltiplos criativos ativos, funil validado. Merece atenção imediata e possível clone." },
                { status: "SCALING", emoji: "🚀", title: "Scaling", desc: "A oferta está em fase de crescimento acelerado. Tráfego subindo consistentemente, novos criativos aparecendo. É o momento de agir rápido." },
                { status: "DYING", emoji: "📉", title: "Dying", desc: "Tráfego em queda, criativos sendo pausados. A oferta está perdendo força. Ainda pode ter insights úteis, mas o timing já passou." },
                { status: "DEAD", emoji: "💀", title: "Dead", desc: "A oferta parou completamente. Sem tráfego, sem criativos ativos. Mantida no radar apenas como referência histórica." },
                { status: "CLONED", emoji: "🧬", title: "Cloned", desc: "Você já clonou/adaptou esta oferta. Indica que o ciclo de espionagem foi concluído e a inteligência foi aplicada na sua própria operação." },
              ].map(item => (
                <div key={item.status} className="flex gap-3 p-3 rounded-lg bg-muted/30">
                  <span className="text-xl">{item.emoji}</span>
                  <div>
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <QuickAddOfferModal open={showQuickAdd} onClose={() => setShowQuickAdd(false)} />
      <FullOfferFormModal open={showFullForm} onClose={() => setShowFullForm(false)} />
      <UniversalImportModal open={showImport} onClose={() => setShowImport(false)} />

      {/* Delete confirmation */}
      <AlertDialog open={deleteTarget !== null} onOpenChange={() => { setDeleteTarget(null); setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteTarget === "bulk" ? `Deletar ${selectedIds.size} ofertas?` : "Deletar oferta?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget === "bulk"
                ? "Todos os domínios, bibliotecas, funil e ads associados a essas ofertas serão removidos."
                : "Todos os domínios, bibliotecas, funil e ads associados serão removidos."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget === "bulk") {
                  handleBulkDelete();
                } else if (deleteId) {
                  deleteMutation.mutate(deleteId);
                  setDeleteTarget(null);
                  setDeleteId(null);
                }
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
