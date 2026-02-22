import { useState, useMemo, useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { useSpiedOffers } from "@/features/spy/hooks/useSpiedOffers";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/shared/hooks/use-toast";
import {
  filterTrafficRows, sortTrafficRows,
  updateOfferStatus, bulkUpdateStatus,
  type OfferTrafficRow, type SortField, type SortDir,
} from "@/shared/services";
import { loadColumns, LS_KEY_COLUMNS, LS_KEY_PAGE_SIZE, LS_KEY_TRAFFIC_SOURCE } from "./types";

// Helper: get workspace_id from authenticated user
async function getWorkspaceId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  const { data: member } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user?.id ?? '')
    .single();
  if (!member?.workspace_id) throw new Error('Workspace not found');
  return member.workspace_id;
}

interface TrafficSummaryRow {
  spied_offer_id: string;
  total_visits: number;
  peak_visits: number;
  avg_visits: number;
  latest_visits: number;
  previous_visits: number;
  data_points: number;
  domain_count: number;
  earliest_period: string | null;
  latest_period: string | null;
}

export function useTrafficIntelligence() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load ALL offers (large page) — we need names/status for each row
  const { data: offersResult } = useSpiedOffers({ pageSize: 10000 });
  const allOffers = offersResult?.data;

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

  // Fetch traffic SUMMARY from materialized view (NOT 87k raw records)
  const { data: trafficSummary, isLoading: trafficLoading } = useQuery({
    queryKey: ["traffic-intel-summary", periodType],
    queryFn: async () => {
      const workspaceId = await getWorkspaceId();
      const { data, error } = await supabase.rpc('get_traffic_intel_summary', {
        p_workspace_id: workspaceId,
        p_period_type: periodType,
      });
      if (error) throw error;
      return (data || []) as TrafficSummaryRow[];
    },
    staleTime: 5 * 60_000,
  });

  // Build rows from offers + traffic summary (no raw data needed)
  const rows: OfferTrafficRow[] = useMemo(() => {
    if (!allOffers) return [];
    const summaryMap = new Map<string, TrafficSummaryRow>();
    for (const s of trafficSummary || []) {
      summaryMap.set(s.spied_offer_id, s);
    }

    return (allOffers as any[]).map((o: any) => {
      const summary = summaryMap.get(o.id);
      const hasTrafficData = !!summary && summary.data_points > 0;
      const lastMonth = summary?.latest_visits ?? 0;
      const prevMonth = summary?.previous_visits ?? 0;
      const variation = prevMonth > 0 ? ((lastMonth - prevMonth) / prevMonth) * 100 : (lastMonth > 0 ? 100 : 0);

      return {
        id: o.id,
        nome: o.nome,
        domain: o.main_domain || "—",
        status: o.status || "RADAR",
        vertical: o.vertical,
        discovered_at: o.discovered_at,
        lastMonth: Number(lastMonth),
        prevMonth: Number(prevMonth),
        variation,
        peak: Number(summary?.peak_visits ?? 0),
        peakDate: summary?.latest_period || "",
        sparkline: [], // sparklines not available from MV — loaded on-demand for charts
        hasTrafficData,
        monthlyData: new Map<string, number>(),
      };
    });
  }, [allOffers, trafficSummary]);

  // Available months from summary — simplified range
  const availableMonths = useMemo(() => {
    if (!trafficSummary) return [];
    const months = new Set<string>();
    for (const s of trafficSummary) {
      if (s.earliest_period) months.add(s.earliest_period);
      if (s.latest_period) months.add(s.latest_period);
    }
    return [...months].sort();
  }, [trafficSummary]);

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

  // Chart data — loaded on-demand for selected offers only via RPC
  const chartOfferIds = useMemo(() => [...chartIds], [chartIds]);

  const { data: chartTraffic } = useQuery({
    queryKey: ["traffic-chart-data", chartOfferIds, rangeFrom, rangeTo],
    queryFn: async () => {
      if (chartOfferIds.length === 0) return [];
      const { data, error } = await supabase.rpc('get_traffic_comparison', {
        p_offer_ids: chartOfferIds,
        p_start_date: rangeFrom || '2020-01-01',
        p_end_date: rangeTo || '2030-12-31',
      });
      if (error) throw error;
      return data || [];
    },
    enabled: chartOfferIds.length > 0,
    staleTime: 5 * 60_000,
  });

  const chartData = useMemo(() => {
    if (!chartTraffic || chartTraffic.length === 0) return [];
    return (chartTraffic as any[]).map((r: any) => ({
      period_date: r.period_date,
      visits: r.visits ?? 0,
      domain: r.offer_name || r.domain || "—",
    }));
  }, [chartTraffic]);

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

  // Expose allTraffic as null — legacy consumers should migrate to summary
  const allTraffic = null;

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
