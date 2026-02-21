import { useState, useMemo, useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { useSpiedOffers } from "@/features/spy/hooks/useSpiedOffers";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/shared/hooks/use-toast";
import {
  compareTraffic, filterTrafficRows, sortTrafficRows,
  getAvailableMonths, updateOfferStatus, bulkUpdateStatus,
  type OfferTrafficRow, type SortField, type SortDir,
} from "@/shared/services";
import { fetchAllTrafficRows, loadColumns, LS_KEY_COLUMNS, LS_KEY_PAGE_SIZE, LS_KEY_TRAFFIC_SOURCE } from "./types";

export function useTrafficIntelligence() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: allOffers } = useSpiedOffers();

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

  // Fetch ALL traffic data
  const { data: allTraffic, isLoading: trafficLoading } = useQuery({
    queryKey: ["all-traffic-data", periodType],
    queryFn: () => fetchAllTrafficRows(periodType),
    staleTime: 5 * 60 * 1000,
  });

  const availableMonths = useMemo(() => {
    if (!allTraffic) return [];
    return getAvailableMonths(allTraffic);
  }, [allTraffic]);

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
    const { error } = await updateOfferStatus(offerId, newStatus);
    if (error) { toast({ title: "Erro", description: error, variant: "destructive" }); return; }
    queryClient.setQueriesData({ queryKey: ['spied-offers'] }, (old: any) => {
      if (!old) return old;
      return old.map((o: any) => o.id === offerId ? { ...o, status: newStatus } : o);
    });
    setTimeout(() => queryClient.invalidateQueries({ queryKey: ['spied-offers'] }), 1500);
  };

  const toggleColumn = (key: string) => {
    setVisibleColumns(prev => { const next = new Set(prev); if (next.has(key)) next.delete(key); else next.add(key); return next; });
  };

  const toggleMonthColumn = (month: string) => {
    setMonthColumns(prev => { const next = new Set(prev); if (next.has(month)) next.delete(month); else next.add(month); return next; });
  };

  // Chart data
  const chartData = useMemo(() => {
    if (chartIds.size === 0 || !allTraffic || !allOffers) return [];
    const offerNames = new Map<string, string>();
    for (const o of allOffers as any[]) {
      if (chartIds.has(o.id)) offerNames.set(o.id, o.main_domain || o.nome);
    }

    const byOffer = new Map<string, Map<string, number>>();
    for (const t of allTraffic) {
      if (!chartIds.has(t.spied_offer_id)) continue;
      const label = offerNames.get(t.spied_offer_id) || t.domain;
      if (!byOffer.has(label)) byOffer.set(label, new Map());
      const mm = byOffer.get(label)!;
      mm.set(t.period_date, (mm.get(t.period_date) || 0) + (t.visits ?? 0));
    }

    const result: { period_date: string; visits: number; domain: string }[] = [];
    for (const [label, mm] of byOffer) {
      for (const [date, visits] of mm) {
        const dateMonth = date.slice(0, 7);
        if (rangeFrom && dateMonth < rangeFrom) continue;
        if (rangeTo && dateMonth > rangeTo) continue;
        result.push({ period_date: date, visits, domain: label });
      }
    }
    return result;
  }, [chartIds, allTraffic, allOffers, rangeFrom, rangeTo]);

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
      return old.map((o: any) => ids.includes(o.id) ? { ...o, status: newStatus } : o);
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
