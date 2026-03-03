import { useState, useMemo, useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/shared/hooks/use-toast";
import {
  compareTraffic, filterTrafficRows, sortTrafficRows,
  getAvailableMonths, updateOfferStatus, bulkUpdateStatus,
  type OfferTrafficRow, type SortField, type SortDir,
} from "@/shared/services";
import { fetchAllOffersLite, fetchAllTrafficRows, loadColumns, LS_KEY_COLUMNS, LS_KEY_PAGE_SIZE, LS_KEY_TRAFFIC_SOURCE } from "./types";

const MAX_CHART_ITEMS = 50;

export function useTrafficIntelligence() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Batch-paginated fetch of ALL offers (lightweight fields only)
  const { data: allOffers } = useQuery({
    queryKey: ["all-offers-lite"],
    queryFn: fetchAllOffersLite,
    staleTime: 5 * 60 * 1000,
  });

  // Traffic data source
  const [trafficDataSource, setTrafficDataSource] = useState<'similarweb' | 'semrush'>(() => {
    return (localStorage.getItem(LS_KEY_TRAFFIC_SOURCE) as 'similarweb' | 'semrush') || 'similarweb';
  });
  const periodType = trafficDataSource === 'similarweb' ? 'monthly_sw' : 'monthly';

  const handleTrafficSourceChange = (src: 'similarweb' | 'semrush') => {
    setTrafficDataSource(src);
    localStorage.setItem(LS_KEY_TRAFFIC_SOURCE, src);
  };

  // Filters & state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>("lastMonth");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [chartIds, setChartIds] = useState<Set<string>>(new Set());
  const [rangeFrom, setRangeFrom] = useState<string | null>(null);
  const [rangeTo, setRangeTo] = useState<string | null>(null);

  // Pagination
  const [pageSize, setPageSize] = useState(() => localStorage.getItem(LS_KEY_PAGE_SIZE) || "25");
  const [currentPage, setCurrentPage] = useState(0);

  // Columns
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(loadColumns);
  const [monthColumns, setMonthColumns] = useState<Set<string>>(new Set());

  // Persist prefs
  useEffect(() => { localStorage.setItem(LS_KEY_COLUMNS, JSON.stringify([...visibleColumns])); }, [visibleColumns]);
  useEffect(() => { localStorage.setItem(LS_KEY_PAGE_SIZE, pageSize); }, [pageSize]);

  // Fetch traffic data filtered by source field (more reliable than period_type)
  const { data: allTraffic, isLoading: trafficLoading } = useQuery({
    queryKey: ["all-traffic-data", trafficDataSource],
    queryFn: () => fetchAllTrafficRows(trafficDataSource),
    staleTime: 5 * 60 * 1000,
  });

  const availableMonths = useMemo(() => {
    if (!allTraffic) return [];
    return getAvailableMonths(allTraffic);
  }, [allTraffic]);

  // Build rows from offers + raw traffic data
  const rows: OfferTrafficRow[] = useMemo(() => {
    if (!allOffers) return [];
    return compareTraffic(
      (allOffers as any[]).map((o: any) => ({
        id: o.id, nome: o.nome, main_domain: o.main_domain,
        status: o.status, vertical: o.vertical, discovered_at: o.discovered_at,
      })),
      allTraffic || [],
      { from: rangeFrom, to: rangeTo }
    );
  }, [allOffers, allTraffic, rangeFrom, rangeTo]);

  const filteredRows = useMemo(() => filterTrafficRows(rows, statusFilter, search), [rows, statusFilter, search]);
  const sortedRows = useMemo(() => sortTrafficRows(filteredRows, sortField, sortDir), [filteredRows, sortField, sortDir]);

  // Pagination
  const isInfinite = pageSize === "all";
  const pageSizeNum = isInfinite ? sortedRows.length : parseInt(pageSize);
  const totalPages = isInfinite ? 1 : Math.max(1, Math.ceil(sortedRows.length / pageSizeNum));
  const paginatedRows = isInfinite ? sortedRows : sortedRows.slice(currentPage * pageSizeNum, (currentPage + 1) * pageSizeNum);

  // Reset page on filter/sort change
  useEffect(() => { setCurrentPage(0); }, [statusFilter, search, sortField, sortDir, rangeFrom, rangeTo]);

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

  const handleInlineStatusChange = async (offerId: string, newStatus: string) => {
    // Optimistic update — cache first for instant UI feedback
    queryClient.setQueriesData({ queryKey: ['spied-offers'] }, (old: any) => {
      if (!old) return old;
      if (old.data && Array.isArray(old.data)) {
        return { ...old, data: old.data.map((o: any) => o.id === offerId ? { ...o, status: newStatus } : o) };
      }
      return old;
    });
    queryClient.setQueryData(['all-offers-lite'], (old: any) => {
      if (!old || !Array.isArray(old)) return old;
      return old.map((o: any) => o.id === offerId ? { ...o, status: newStatus } : o);
    });
    const { error } = await updateOfferStatus(offerId, newStatus);
    if (error) {
      toast({ title: "Erro", description: error, variant: "destructive" });
      queryClient.invalidateQueries({ queryKey: ['spied-offers'] });
      queryClient.invalidateQueries({ queryKey: ['all-offers-lite'] });
      return;
    }
    queryClient.invalidateQueries({ queryKey: ['spied-offers'] });
    queryClient.invalidateQueries({ queryKey: ['all-offers-lite'] });
  };

  const toggleColumn = (key: string) => {
    setVisibleColumns(prev => { const next = new Set(prev); if (next.has(key)) next.delete(key); else next.add(key); return next; });
  };

  const toggleMonthColumn = (month: string) => {
    setMonthColumns(prev => { const next = new Set(prev); if (next.has(month)) next.delete(month); else next.add(month); return next; });
  };

  // Chart data — derived from compareTraffic rows (same main_domain logic + aggregation)
  // Ensures chart data is 100% consistent with table sparklines and lastMonth values
  const chartData = useMemo(() => {
    if (chartIds.size === 0) return [];
    const result: { period_date: string; visits: number; domain: string }[] = [];
    for (const row of rows) {
      if (!chartIds.has(row.id)) continue;
      const label = row.domain === "—" ? row.nome : row.domain;
      for (const [month, visits] of row.monthlyData) {
        if (rangeFrom && month < rangeFrom) continue;
        if (rangeTo && month > rangeTo) continue;
        result.push({ period_date: `${month}-01`, visits, domain: label });
      }
    }
    return result;
  }, [chartIds, rows, rangeFrom, rangeTo]);

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
    setSelectedIds(selectedIds.size === sortedRows.length ? new Set() : new Set(sortedRows.map(r => r.id)));
  }, [sortedRows, selectedIds]);

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

  const allChecked = sortedRows.length > 0 && sortedRows.every(r => selectedIds.has(r.id));
  const sortedMonthCols = [...monthColumns].sort();

  return {
    allOffers, allTraffic, trafficLoading,
    trafficDataSource, handleTrafficSourceChange,
    search, setSearch, statusFilter, toggleStatusFilter, setStatusFilter,
    sortField, sortDir, toggleSort,
    selectedIds, toggleSelect, selectAll, setSelectedIds,
    chartIds, toggleChart, addAllToChart, addSelectedToChart, setChartIds, chartData,
    rangeFrom, setRangeFrom, rangeTo, setRangeTo,
    pageSize, setPageSize, currentPage, setCurrentPage,
    visibleColumns, toggleColumn, monthColumns, toggleMonthColumn,
    availableMonths, rows, filteredRows, sortedRows, paginatedRows,
    isInfinite, totalPages, allChecked, sortedMonthCols,
    handleInlineStatusChange, handleBulkStatus,
  };
}
