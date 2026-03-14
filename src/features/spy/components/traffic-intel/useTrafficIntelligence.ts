import { useState, useMemo, useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/shared/hooks/use-toast";
import { useWorkspaceId } from "@/shared/hooks/useWorkspaceId";
import { supabase } from "@/integrations/supabase/client";
import {
  updateOfferStatus, bulkUpdateStatus,
  type OfferTrafficRow, type SortField, type SortDir,
} from "@/shared/services";
import { loadColumns, LS_KEY_COLUMNS, LS_KEY_PAGE_SIZE, LS_KEY_TRAFFIC_SOURCE } from "./types";

const MAX_CHART_ITEMS = 50;

// Map frontend sort field names to RPC parameter values
const SORT_FIELD_MAP: Record<SortField, string> = {
  nome: "nome",
  lastMonth: "last_month",
  variation: "variation",
  peak: "peak",
  status: "status",
  discovered: "discovered",
};

/** Map a single RPC row to the OfferTrafficRow shape expected by TrafficTable */
function mapRpcRow(r: any): OfferTrafficRow {
  const sparklineMonths: string[] = r.sparkline_months || [];
  const sparkline: number[] = r.sparkline || [];
  return {
    id: r.id,
    nome: r.nome,
    domain: r.main_domain || "—",
    status: r.status || "RADAR",
    vertical: r.vertical,
    discovered_at: r.discovered_at,
    lastMonth: r.last_month ?? 0,
    prevMonth: r.prev_month ?? 0,
    variation: Number(r.variation) || 0,
    peak: r.peak ?? 0,
    peakDate: r.peak_date || "",
    sparkline,
    hasTrafficData: r.has_traffic ?? false,
    monthlyData: new Map(sparklineMonths.map((m: string, i: number) => [m, sparkline[i] ?? 0])),
  };
}

export function useTrafficIntelligence() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Workspace ID — shared hook, cached 30min across all consumers
  const { data: workspaceId } = useWorkspaceId();

  // Traffic data source
  const [trafficDataSource, setTrafficDataSource] = useState<'similarweb' | 'semrush'>(() => {
    return (localStorage.getItem(LS_KEY_TRAFFIC_SOURCE) as 'similarweb' | 'semrush') || 'similarweb';
  });

  const handleTrafficSourceChange = (src: 'similarweb' | 'semrush') => {
    setTrafficDataSource(src);
    localStorage.setItem(LS_KEY_TRAFFIC_SOURCE, src);
  };

  // Filters & state
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>("lastMonth");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [chartIds, setChartIds] = useState<Set<string>>(new Set());
  const [rangeFrom, setRangeFrom] = useState<string | null>(null);
  const [rangeTo, setRangeTo] = useState<string | null>(null);

  // Debounce search to avoid RPC call on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Pagination
  const [pageSize, setPageSize] = useState(() => localStorage.getItem(LS_KEY_PAGE_SIZE) || "25");
  const [currentPage, setCurrentPage] = useState(0);

  // Columns
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(loadColumns);
  const [monthColumns, setMonthColumns] = useState<Set<string>>(new Set());

  // Persist prefs
  useEffect(() => { localStorage.setItem(LS_KEY_COLUMNS, JSON.stringify([...visibleColumns])); }, [visibleColumns]);
  useEffect(() => { localStorage.setItem(LS_KEY_PAGE_SIZE, pageSize); }, [pageSize]);

  // ─── Main RPC Query: get_traffic_intel_rows ───
  const isInfinite = pageSize === "all";
  const pageSizeNum = isInfinite ? -1 : parseInt(pageSize);
  const statusArr = statusFilter.size > 0 ? Array.from(statusFilter) : null;

  const { data: rpcResult, isLoading: trafficLoading } = useQuery({
    queryKey: [
      "traffic-intel-rows", workspaceId, trafficDataSource,
      rangeFrom, rangeTo, statusArr, debouncedSearch,
      sortField, sortDir, currentPage, pageSizeNum,
    ],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_traffic_intel_rows", {
        p_workspace_id: workspaceId!,
        p_source: trafficDataSource,
        p_date_from: rangeFrom,
        p_date_to: rangeTo,
        p_statuses: statusArr,
        p_search: debouncedSearch || null,
        p_sort_field: SORT_FIELD_MAP[sortField],
        p_sort_dir: sortDir,
        p_page: currentPage,
        p_page_size: pageSizeNum,
      });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!workspaceId,
    staleTime: 60 * 1000,
    placeholderData: (prev) => prev,
  });

  // ─── Available Months RPC ───
  const { data: availableMonths = [] } = useQuery({
    queryKey: ["traffic-intel-months", workspaceId, trafficDataSource],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_traffic_intel_available_months", {
        p_workspace_id: workspaceId!,
        p_source: trafficDataSource,
      });
      if (error) throw error;
      return (data || []).map((r: any) => r.month);
    },
    enabled: !!workspaceId,
    staleTime: 10 * 60 * 1000,
  });

  // ─── Map RPC rows to OfferTrafficRow ───
  const paginatedRows: OfferTrafficRow[] = useMemo(() => {
    if (!rpcResult || rpcResult.length === 0) return [];
    return rpcResult.map(mapRpcRow);
  }, [rpcResult]);

  const totalCount = rpcResult?.[0]?.total_count ?? 0;
  const totalPages = isInfinite ? 1 : Math.max(1, Math.ceil(totalCount / Math.max(pageSizeNum, 1)));

  // For backwards compatibility: sortedRows = paginatedRows (already sorted server-side)
  const sortedRows = paginatedRows;

  // Reset page on filter/sort change
  useEffect(() => { setCurrentPage(0); }, [statusFilter, debouncedSearch, sortField, sortDir, rangeFrom, rangeTo]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) { setSortDir(d => d === "asc" ? "desc" : "asc"); }
    else { setSortField(field); setSortDir("desc"); }
  };

  const toggleStatusFilter = (value: string) => {
    setStatusFilter(prev => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value); else next.add(value);
      return next;
    });
  };

  // ─── Chart Data ───
  // Accumulate charted rows across pages so chart survives page changes
  const chartRowsRef = useRef<Map<string, OfferTrafficRow>>(new Map());

  // Update chart rows cache when paginated rows change
  useEffect(() => {
    for (const row of paginatedRows) {
      if (chartIds.has(row.id)) {
        chartRowsRef.current.set(row.id, row);
      }
    }
    // Clean up rows no longer in chartIds
    for (const id of chartRowsRef.current.keys()) {
      if (!chartIds.has(id)) chartRowsRef.current.delete(id);
    }
  }, [paginatedRows, chartIds]);

  const chartData = useMemo(() => {
    if (chartIds.size === 0) return [];
    const result: { period_date: string; visits: number; domain: string }[] = [];
    for (const [id, row] of chartRowsRef.current) {
      if (!chartIds.has(id)) continue;
      const label = row.domain === "—" ? row.nome : row.domain;
      for (const [month, visits] of row.monthlyData) {
        result.push({ period_date: `${month}-01`, visits, domain: label });
      }
    }
    return result;
  }, [chartIds, paginatedRows]); // eslint-disable-line react-hooks/exhaustive-deps

  // Chart-selected offers for legend (replaces allOffers in TrafficChartingPanel)
  const chartedOffers = useMemo(() => {
    return Array.from(chartRowsRef.current.values()).map(r => ({
      id: r.id, nome: r.nome, main_domain: r.domain === "—" ? null : r.domain,
    }));
  }, [chartIds, paginatedRows]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Inline Status Change ───
  const handleInlineStatusChange = async (offerId: string, newStatus: string) => {
    // Optimistic update on current query cache
    queryClient.setQueriesData({ queryKey: ['spied-offers'] }, (old: any) => {
      if (!old) return old;
      if (old.data && Array.isArray(old.data)) {
        return { ...old, data: old.data.map((o: any) => o.id === offerId ? { ...o, status: newStatus } : o) };
      }
      return old;
    });
    const { error } = await updateOfferStatus(offerId, newStatus);
    if (error) {
      toast({ title: "Erro", description: error, variant: "destructive" });
    }
    // Invalidate to refetch with updated status
    queryClient.invalidateQueries({ queryKey: ['spied-offers'] });
    queryClient.invalidateQueries({ queryKey: ['traffic-intel-rows'] });
  };

  const toggleColumn = (key: string) => {
    setVisibleColumns(prev => { const next = new Set(prev); if (next.has(key)) next.delete(key); else next.add(key); return next; });
  };

  const toggleMonthColumn = (month: string) => {
    setMonthColumns(prev => { const next = new Set(prev); if (next.has(month)) next.delete(month); else next.add(month); return next; });
  };

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  }, []);

  // Scroll preservation for chart toggle
  const savedScrollRef = useRef<number | null>(null);
  useLayoutEffect(() => {
    if (savedScrollRef.current !== null) {
      window.scrollTo({ top: savedScrollRef.current, behavior: "instant" as ScrollBehavior });
      savedScrollRef.current = null;
    }
  }, [chartIds]);

  const toggleChart = useCallback((id: string) => {
    savedScrollRef.current = window.scrollY;
    setChartIds(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(prev =>
      prev.size === paginatedRows.length ? new Set() : new Set(paginatedRows.map(r => r.id))
    );
  }, [paginatedRows]);

  const addAllToChart = useCallback(() => {
    const eligible = paginatedRows.filter(r => r.hasTrafficData);
    if (eligible.length > MAX_CHART_ITEMS) {
      toast({ title: `Limitado a ${MAX_CHART_ITEMS} ofertas no grafico`, description: `${eligible.length} disponiveis — mostrando as primeiras ${MAX_CHART_ITEMS}.` });
    }
    setChartIds(new Set(eligible.slice(0, MAX_CHART_ITEMS).map(r => r.id)));
  }, [paginatedRows, toast]);

  const handleBulkStatus = async (newStatus: string) => {
    const ids = Array.from(selectedIds);
    const { error } = await bulkUpdateStatus(ids, newStatus);
    if (error) { toast({ title: "Erro", description: error, variant: "destructive" }); return; }
    toast({ title: `${ids.length} ofertas → ${newStatus}` });
    setSelectedIds(new Set());
    queryClient.invalidateQueries({ queryKey: ['spied-offers'] });
    queryClient.invalidateQueries({ queryKey: ['traffic-intel-rows'] });
  };

  const addSelectedToChart = () => {
    setChartIds(prev => {
      const next = new Set(prev);
      for (const id of selectedIds) {
        if (next.size >= MAX_CHART_ITEMS) {
          toast({ title: `Limite de ${MAX_CHART_ITEMS} ofertas no grafico atingido` });
          break;
        }
        next.add(id);
      }
      return next;
    });
  };

  const allChecked = paginatedRows.length > 0 && paginatedRows.every(r => selectedIds.has(r.id));
  const sortedMonthCols = [...monthColumns].sort();

  return {
    // Keep allOffers for chart legend compatibility (now derived from charted rows)
    allOffers: chartedOffers,
    trafficLoading,
    trafficDataSource, handleTrafficSourceChange,
    search, setSearch, statusFilter, toggleStatusFilter, setStatusFilter,
    sortField, sortDir, toggleSort,
    selectedIds, toggleSelect, selectAll, setSelectedIds,
    chartIds, toggleChart, addAllToChart, addSelectedToChart, setChartIds, chartData,
    rangeFrom, setRangeFrom, rangeTo, setRangeTo,
    pageSize, setPageSize, currentPage, setCurrentPage,
    visibleColumns, toggleColumn, monthColumns, toggleMonthColumn,
    availableMonths, sortedRows, paginatedRows,
    isInfinite, totalPages, totalCount, allChecked, sortedMonthCols,
    handleInlineStatusChange, handleBulkStatus,
  };
}
