import { useState, useCallback, useMemo, useEffect, Suspense, lazy } from "react";
import { useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useSpiedOffers, useDeleteSpiedOffer, useLatestTrafficPerOffer, type PaginatedOffer } from "@/features/spy/hooks/useSpiedOffers";
import { Loader2, LayoutList, BarChart3, Info, Radio } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { ErrorState } from "@/shared/components/ui/ErrorState";
import { useToast } from "@/shared/hooks/use-toast";
import {
  updateOfferStatus,
  updateOfferNotes,
  bulkUpdateStatus,
  bulkDeleteOffers,
} from "@/shared/services";
import {
  loadSpyColumns, LS_KEY_SPY_COLUMNS, LS_KEY_TRAFFIC_SOURCE,
} from "@/features/spy/components/spy-radar/constants";
import { SpyFilterBar } from "@/features/spy/components/spy-radar/SpyFilterBar";
import { SpyColumnSelector } from "@/features/spy/components/spy-radar/SpyColumnSelector";
import { SavedViewsDropdown } from "@/features/spy/components/spy-radar/SavedViewsDropdown";
import { useSavedViews, type SpyViewFilters, type SavedView } from "@/features/spy/hooks/useSavedViews";
import { SpyBulkActionsBar } from "@/features/spy/components/spy-radar/SpyBulkActionsBar";
import { SpyOffersTable } from "@/features/spy/components/spy-radar/SpyOffersTable";
import { SpyAboutTab } from "@/features/spy/components/spy-radar/SpyAboutTab";
import { SpyRadarHeader } from "@/features/spy/components/spy-radar/SpyRadarHeader";
import { SpyDeleteDialog } from "@/features/spy/components/spy-radar/SpyDeleteDialog";

const QuickAddOfferModal = lazy(() => import("@/features/spy/components/QuickAddOfferModal").then(m => ({ default: m.QuickAddOfferModal })));
const FullOfferFormModal = lazy(() => import("@/features/spy/components/FullOfferFormModal").then(m => ({ default: m.FullOfferFormModal })));
const UniversalImportModal = lazy(() => import("@/features/spy/components/UniversalImportModal").then(m => ({ default: m.UniversalImportModal })));
const TrafficIntelligenceView = lazy(() => import("@/features/spy/components/TrafficIntelligenceView").then(m => ({ default: m.TrafficIntelligenceView })));

const ModalLoader = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
  </div>
);

export default function SpyRadar() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: savedViewsList = [] } = useSavedViews("spy");

  // Filters
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
  const [vertical, setVertical] = useState("");
  const [source, setSource] = useState("");
  const [search, setSearch] = useState("");

  // Columns
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(loadSpyColumns);

  // Modals
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showFullForm, setShowFullForm] = useState(false);
  const [showImport, setShowImport] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<"single" | "bulk" | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Vault/Archive toggle
  const [showArchived, setShowArchived] = useState(false);

  // Tabs & traffic source
  const [mainTab, setMainTab] = useState("offers");
  const [trafficDataSource, setTrafficDataSource] = useState<'similarweb' | 'semrush'>(() => {
    return (localStorage.getItem(LS_KEY_TRAFFIC_SOURCE) as 'similarweb' | 'semrush') || 'similarweb';
  });

  // Saved views
  const [activeViewId, setActiveViewId] = useState<string | null>(null);

  // Selection & pagination
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pageSize, setPageSize] = useState("25");
  const [currentPage, setCurrentPage] = useState(0);

  const deleteMutation = useDeleteSpiedOffer();

  // Persist column prefs
  useEffect(() => {
    localStorage.setItem(LS_KEY_SPY_COLUMNS, JSON.stringify([...visibleColumns]));
  }, [visibleColumns]);

  // Apply saved view from URL param (?view=uuid)
  useEffect(() => {
    const viewId = searchParams.get("view");
    if (viewId && savedViewsList.length > 0) {
      const view = savedViewsList.find(v => v.id === viewId);
      if (view) {
        handleApplyView(view);
        searchParams.delete("view");
        setSearchParams(searchParams, { replace: true });
      }
    }
  }, [searchParams, savedViewsList]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleStatusFilter = (value: string) => {
    setStatusFilter(prev => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value); else next.add(value);
      return next;
    });
    setActiveViewId(null);
    setCurrentPage(0);
    setSelectedIds(new Set());
  };

  const toggleSpyColumn = (key: string) => {
    setVisibleColumns(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const handleInlineStatusChange = async (offerId: string, newStatus: string) => {
    const { error } = await updateOfferStatus(offerId, newStatus);
    if (error) { toast({ title: "Erro", description: error, variant: "destructive" }); return; }
    queryClient.setQueriesData({ queryKey: ['spied-offers'] }, (old: any) => {
      if (!old) return old;
      // Paginated format: { data: [], totalCount }
      if (old.data && Array.isArray(old.data)) {
        return { ...old, data: old.data.map((o: any) => o.id === offerId ? { ...o, status: newStatus } : o) };
      }
      return old;
    });
    setTimeout(() => queryClient.invalidateQueries({ queryKey: ['spied-offers'] }), 1500);
  };

  const handleNotesUpdate = async (offerId: string, notes: string) => {
    const { error } = await updateOfferNotes(offerId, notes);
    if (error) { toast({ title: "Erro", description: error, variant: "destructive" }); return; }
    queryClient.setQueriesData({ queryKey: ['spied-offers'] }, (old: any) => {
      if (!old) return old;
      if (old.data && Array.isArray(old.data)) {
        return { ...old, data: old.data.map((o: any) => o.id === offerId ? { ...o, notas: notes } : o) };
      }
      return old;
    });
    toast({ title: "Notas salvas!" });
  };

  // Server-side paginated query — all filtering + pagination happens in the DB
  const { data: paginatedResult, isLoading, isError, refetch } = useSpiedOffers({
    vertical: vertical || undefined,
    discovery_source: source || undefined,
    search: search || undefined,
    statuses: statusFilter.size > 0 ? [...statusFilter] : undefined,
    excludeStatuses: !showArchived ? ['VAULT'] : undefined,
    page: currentPage,
    pageSize: pageSize === 'all' ? 10000 : parseInt(pageSize),
  });

  const offers = paginatedResult?.data;
  const totalOffers = paginatedResult?.totalCount ?? 0;

  const { data: latestTrafficMap } = useLatestTrafficPerOffer(trafficDataSource);

  const handleTrafficSourceChange = (src: 'similarweb' | 'semrush') => {
    setTrafficDataSource(src);
    localStorage.setItem(LS_KEY_TRAFFIC_SOURCE, src);
  };

  const offers = paginatedResult?.data as PaginatedOffer[] | undefined;
  const totalOffers = paginatedResult?.totalCount ?? 0;

  const handleFilterChange = useCallback(() => {
    setActiveViewId(null);
    setCurrentPage(0);
    setSelectedIds(new Set());
  }, []);

  const handleSelectAll = useCallback(() => {
    if (!offers) return;
    setSelectedIds(selectedIds.size === offers.length ? new Set() : new Set(offers.map(o => o.id)));
  }, [offers, selectedIds]);

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    const { error } = await bulkDeleteOffers(ids);
    if (error) { toast({ title: 'Erro', description: error, variant: 'destructive' }); }
    else { toast({ title: `${ids.length} ofertas removidas!` }); setSelectedIds(new Set()); refetch(); }
    setDeleteTarget(null);
  };

  const handleBulkStatusChange = async (newStatus: string) => {
    const ids = Array.from(selectedIds);
    const { error } = await bulkUpdateStatus(ids, newStatus);
    if (error) { toast({ title: 'Erro', description: error, variant: 'destructive' }); return; }
    toast({ title: `${ids.length} ofertas → ${newStatus}` });
    queryClient.setQueriesData({ queryKey: ['spied-offers'] }, (old: any) => {
      if (!old) return old;
      if (old.data && Array.isArray(old.data)) {
        return { ...old, data: old.data.map((o: any) => ids.includes(o.id) ? { ...o, status: newStatus } : o) };
      }
      return old;
    });
    setSelectedIds(new Set());
    setTimeout(() => queryClient.invalidateQueries({ queryKey: ['spied-offers'] }), 1500);
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget === "bulk") { handleBulkDelete(); }
    else if (deleteId) { deleteMutation.mutate(deleteId); setDeleteTarget(null); setDeleteId(null); }
  };

  const handleApplyView = useCallback((view: SavedView) => {
    const f = view.filters;
    setStatusFilter(new Set(f.statusFilter ?? []));
    setVertical(f.vertical ?? "");
    setSource(f.source ?? "");
    setSearch(f.search ?? "");
    setShowArchived(f.showArchived ?? false);
    if (f.trafficDataSource) {
      setTrafficDataSource(f.trafficDataSource);
      localStorage.setItem(LS_KEY_TRAFFIC_SOURCE, f.trafficDataSource);
    }
    if (view.visible_columns && view.visible_columns.length > 0) {
      setVisibleColumns(new Set(view.visible_columns));
    }
    setActiveViewId(view.id);
    setCurrentPage(0);
    setSelectedIds(new Set());
  }, []);

  const currentFilters: SpyViewFilters = useMemo(() => ({
    statusFilter: [...statusFilter],
    vertical,
    source,
    search,
    trafficDataSource,
    showArchived,
  }), [statusFilter, vertical, source, search, trafficDataSource, showArchived]);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="max-w-7xl space-y-6">
        <SpyRadarHeader
          onQuickAdd={() => setShowQuickAdd(true)}
          onFullForm={() => setShowFullForm(true)}
          onImport={() => setShowImport(true)}
        />

        <Tabs value={mainTab} onValueChange={setMainTab}>
          <TabsList>
            <TabsTrigger value="offers" className="flex items-center gap-1.5"><LayoutList className="h-4 w-4" /> Ofertas</TabsTrigger>
            <TabsTrigger value="comparison" className="flex items-center gap-1.5"><BarChart3 className="h-4 w-4" /> Inteligencia de Trafego</TabsTrigger>
            <TabsTrigger value="about" className="flex items-center gap-1.5"><Info className="h-4 w-4" /> Sobre</TabsTrigger>
          </TabsList>

          <TabsContent value="offers" className="mt-4 space-y-4">
            <SpyFilterBar
              trafficDataSource={trafficDataSource}
              onTrafficSourceChange={handleTrafficSourceChange}
              vertical={vertical}
              onVerticalChange={(v) => { setVertical(v); handleFilterChange(); }}
              source={source}
              onSourceChange={(v) => { setSource(v); handleFilterChange(); }}
              search={search}
              onSearchChange={(v) => { setSearch(v); handleFilterChange(); }}
              statusFilter={statusFilter}
              onToggleStatus={toggleStatusFilter}
              onClearStatusFilter={() => { setStatusFilter(new Set()); handleFilterChange(); }}
              columnSelector={<SpyColumnSelector visibleColumns={visibleColumns} onToggleColumn={toggleSpyColumn} />}
              savedViewsSlot={
                <SavedViewsDropdown
                  currentFilters={currentFilters}
                  visibleColumns={[...visibleColumns]}
                  onApplyView={handleApplyView}
                  activeViewId={activeViewId}
                />
              }
              showArchived={showArchived}
              onToggleArchived={() => { setShowArchived(prev => !prev); handleFilterChange(); }}
            />

            <SpyBulkActionsBar
              selectedCount={selectedIds.size}
              totalCount={totalOffers}
              onSelectAll={handleSelectAll}
              onBulkStatusChange={handleBulkStatusChange}
              onBulkDelete={() => setDeleteTarget("bulk")}
            />

            {isLoading ? (
              <div className="border rounded-lg p-8">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Carregando ofertas...</span>
                </div>
              </div>
            ) : isError ? (
              <ErrorState message="Erro ao carregar ofertas espionadas." onRetry={() => refetch()} />
            ) : !offers || offers.length === 0 ? (
              <EmptyState
                icon={Radio}
                title="Nenhuma oferta no radar ainda"
                description="Comece importando um CSV do PublicWWW ou adicionando ofertas manualmente."
                actionLabel="Importar CSV"
                onAction={() => setShowImport(true)}
                secondaryActionLabel="Quick Add"
                onSecondaryAction={() => setShowQuickAdd(true)}
              />
            ) : (
              <SpyOffersTable
                offers={offers}
                isLoading={isLoading}
                visibleColumns={visibleColumns}
                trafficDataSource={trafficDataSource}
                latestTrafficMap={latestTrafficMap}
                selectedIds={selectedIds}
                setSelectedIds={setSelectedIds}
                totalCount={totalOffers}
                pageSize={pageSize}
                setPageSize={(v) => { setPageSize(v); setCurrentPage(0); }}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                onInlineStatusChange={handleInlineStatusChange}
                onNotesUpdate={handleNotesUpdate}
                onDeleteSingle={(id) => { setDeleteId(id); setDeleteTarget("single"); }}
                onShowQuickAdd={() => setShowQuickAdd(true)}
              />
            )}
          </TabsContent>

          <TabsContent value="comparison" className="mt-4">
            <Suspense fallback={<ModalLoader />}>
              <TrafficIntelligenceView />
            </Suspense>
          </TabsContent>

          <TabsContent value="about" className="mt-4">
            <SpyAboutTab />
          </TabsContent>
        </Tabs>

        <Suspense fallback={<ModalLoader />}>
          <QuickAddOfferModal open={showQuickAdd} onClose={() => setShowQuickAdd(false)} />
          <FullOfferFormModal open={showFullForm} onClose={() => setShowFullForm(false)} />
          <UniversalImportModal open={showImport} onClose={() => setShowImport(false)} />
        </Suspense>

        <SpyDeleteDialog
          deleteTarget={deleteTarget}
          selectedCount={selectedIds.size}
          onClose={() => { setDeleteTarget(null); setDeleteId(null); }}
          onConfirm={handleDeleteConfirm}
        />
      </div>
    </TooltipProvider>
  );
}
