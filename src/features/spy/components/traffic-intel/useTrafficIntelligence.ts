import { useState, useMemo, useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/shared/hooks/use-toast";
import {
  compareTraffic, filterTrafficRows, sortTrafficRows,
  updateOfferStatus, bulkUpdateStatus,
  type OfferTrafficRow, type SortField, type SortDir,
} from "@/shared/services";
import { fetchAllOffersLite, fetchAllTrafficRows, loadColumns, LS_KEY_COLUMNS, LS_KEY_PAGE_SIZE, LS_KEY_TRAFFIC_SOURCE } from "./types";

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

  // Fetch raw traffic data directly (bypasses potentially stale MV)
  const { data: allTraffic, isLoading: trafficLoading } = useQuery({
    queryKey: ["all-traffic-rows", periodType],
    queryFn: () => fetchAllTrafficRows(periodType),
    staleTime: 5 * 60_000,
  });

  // Build rows using compareTraffic — handles sparklines, dedup, aggregation
  const dateRange = useMemo(() => ({ from: rangeFrom, to: rangeTo }), [rangeFrom, rangeTo]);
  const rows: OfferTrafficRow[] = useMemo(() => {
    if (!allOffers) return [];
    return compareTraffic(allOffers as any[], allTraffic || [], dateRange);
  }, [allOffers, allTraffic, dateRange]);

  // Available months from raw traffic data
  const availableMonths = useMemo(() => {
    if (!allTraffic) return [];
    const months = new Set<string>();
    for (const t of allTraffic) {
      if (t.period_date) months.add(t.period_date);
    }
    return [...months].sort();
  }, [allTraffic]);

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
    const { error } = await updateOfferStatus(offerId, newStatus);
    if (error) { toast({ title: "Erro", description: error, variant: "destructive" }); return; }
    queryClient.setQueriesData({ queryKey: ['spied-offers'] }, (old: any) => {
      if (!old) return old;
      if (old.data && Array.isArray(old.data)) {
        return { ...old, data: old.data.map((o: any) => o.id === offerId ? { ...o, status: newStatus } : o) };
      }
      return old;
    });
    setTimeout(() => queryClient.invalidateQueries({ queryKey: ['spied-offers'] }), 1500);
  };

  const toggleColumn = (key: string) => {
    setVisibleColumns(prev => { const next = new Set(prev); if (next.has(key)) next.delete(key); else next.add(key); return next; });
  };

  const toggleMonthColumn = (month: string) => {
    setMonthColumns(prev => { const next = new Set(prev); if (next.has(month)) next.delete(month); else next.add(month); return next; });
  };

  // Chart data — built from already-loaded raw traffic (no extra RPC needed)
  const chartOfferIds = useMemo(() => [...chartIds], [chartIds]);

  const chartData = useMemo(() => {
    if (!allTraffic || !allOffers || chartOfferIds.length === 0) return [];

    // Build offer name lookup
    const offerNames = new Map<string, string>();
    for (const o of allOffers as any[]) {
      offerNames.set(o.id, o.nome || o.main_domain || o.id);
    }

    // Filter for selected offers
    const filtered = allTraffic.filter(t => chartOfferIds.includes(t.spied_offer_id));

    // Aggregate per offer+month (max visits across domains to avoid double count)
    const agg = new Map<string, { visits: number; name: string }>();
    for (const t of filtered) {
      const key = `${t.spied_offer_id}|${t.period_date}`;
      const existing = agg.get(key);
      const visits = t.visits ?? 0;
      if (existing) {
        existing.visits = Math.max(existing.visits, visits);
      } else {
        agg.set(key, { visits, name: offerNames.get(t.spied_offer_id) || t.domain });
      }
    }

    // Apply date range filter + build chart points
    return [...agg.entries()]
      .filter(([key]) => {
        const date = key.split('|')[1];
        if (rangeFrom && date < rangeFrom) return false;
        if (rangeTo && date > rangeTo) return false;
        return true;
      })
      .map(([key, val]) => ({
        period_date: key.split('|')[1],
        visits: val.visits,
        domain: val.name,
      }))
      .sort((a, b) => a.period_date.localeCompare(b.period_date));
  }, [allTraffic, allOffers, chartOfferIds, rangeFrom, rangeTo]);

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
    setChartIds(new Set(sortedRows.filter(r => r.hasTrafficData).map(r => r.id)));
  }, [sortedRows]);

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
      selectedIds.forEach(id => next.add(id));
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
