import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSpiedOffers } from "@/hooks/useSpiedOffers";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// Parallel paginated fetch — gets row count first, then fetches pages 5 at a time
async function fetchAllTrafficRows() {
  type Row = { spied_offer_id: string; domain: string; period_date: string; visits: number | null };
  const pageSize = 1000;
  const PARALLEL = 5;

  // First page + exact count
  const { data: first, error: firstErr, count } = await supabase
    .from("offer_traffic_data")
    .select("spied_offer_id, domain, period_date, visits", { count: "exact" })
    .order("period_date", { ascending: true })
    .range(0, pageSize - 1);

  if (firstErr) throw firstErr;
  if (!first || first.length === 0) return [] as Row[];

  const all: Row[] = [...first];
  if (first.length < pageSize || !count || count <= pageSize) return all;

  // Fetch remaining pages in parallel batches
  const totalPages = Math.ceil(count / pageSize);
  for (let batch = 1; batch < totalPages; batch += PARALLEL) {
    const promises = [];
    for (let p = batch; p < Math.min(batch + PARALLEL, totalPages); p++) {
      const from = p * pageSize;
      promises.push(
        supabase
          .from("offer_traffic_data")
          .select("spied_offer_id, domain, period_date, visits")
          .order("period_date", { ascending: true })
          .range(from, from + pageSize - 1)
      );
    }
    const results = await Promise.all(promises);
    for (const { data, error } of results) {
      if (error) throw error;
      if (data) all.push(...data);
    }
  }

  return all;
}
import { TrafficChart } from "@/components/spy/TrafficChart";
import { MonthRangePicker } from "@/components/spy/MonthRangePicker";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import {
  TrendingUp, TrendingDown, Minus, Search, Eye, ArrowUpDown, BarChart3, X, Loader2,
  Archive, ChevronLeft, ChevronRight, Columns,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const STATUS_OPTIONS = [
  { value: "RADAR", label: "Radar" },
  { value: "ANALYZING", label: "Analyzing" },
  { value: "HOT", label: "HOT" },
  { value: "SCALING", label: "Scaling" },
  { value: "DYING", label: "Dying" },
  { value: "DEAD", label: "Dead" },
  { value: "CLONED", label: "Cloned" },
  { value: "VAULT", label: "Vault" },
  { value: "NEVER_SCALED", label: "Never Scaled" },
];

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  RADAR: { label: "Radar", className: "bg-muted text-muted-foreground" },
  ANALYZING: { label: "Analyzing", className: "bg-warning/20 text-warning" },
  HOT: { label: "HOT", className: "bg-destructive/20 text-destructive" },
  SCALING: { label: "Scaling", className: "bg-success/20 text-success" },
  DYING: { label: "Dying", className: "bg-accent/20 text-accent" },
  DEAD: { label: "Dead", className: "bg-muted text-muted-foreground" },
  CLONED: { label: "Cloned", className: "bg-primary/20 text-primary" },
  VAULT: { label: "Vault", className: "bg-muted text-muted-foreground" },
  NEVER_SCALED: { label: "Never Scaled", className: "bg-muted/50 text-muted-foreground" },
};

const PAGE_SIZE_OPTIONS = [
  { value: "10", label: "10 por pagina" },
  { value: "25", label: "25 por pagina" },
  { value: "50", label: "50 por pagina" },
  { value: "100", label: "100 por pagina" },
  { value: "all", label: "Todas" },
];

const DEFAULT_COLUMNS = new Set(["status", "oferta", "trend", "lastMonth", "variation", "peak", "discovered"]);
const ALL_COLUMNS: { key: string; label: string }[] = [
  { key: "status", label: "Status" },
  { key: "oferta", label: "Oferta" },
  { key: "trend", label: "Trend" },
  { key: "lastMonth", label: "Ultimo Mes" },
  { key: "variation", label: "Variacao" },
  { key: "peak", label: "Pico" },
  { key: "discovered", label: "Descoberto" },
];

const LS_KEY_COLUMNS = "traffic-intel-columns";
const LS_KEY_PAGE_SIZE = "traffic-intel-page-size";

function loadColumns(): Set<string> {
  try {
    const saved = localStorage.getItem(LS_KEY_COLUMNS);
    if (saved) return new Set(JSON.parse(saved));
  } catch {}
  return new Set(DEFAULT_COLUMNS);
}

type SortField = "nome" | "lastMonth" | "variation" | "peak" | "status" | "discovered";
type SortDir = "asc" | "desc";

interface OfferTrafficRow {
  id: string;
  nome: string;
  domain: string;
  status: string;
  vertical: string | null;
  discovered_at: string | null;
  lastMonth: number;
  prevMonth: number;
  variation: number;
  peak: number;
  peakDate: string;
  sparkline: number[];
  hasTrafficData: boolean;
  monthlyData?: Map<string, number>;
}

function formatK(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function formatDate(d: string) {
  const [y, m] = d.split("-");
  const names = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return `${names[parseInt(m) - 1]} ${y.slice(2)}`;
}

export function TrafficIntelligenceView() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: allOffers, refetch } = useSpiedOffers();

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

  // Inline status edit
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);

  // Persist column prefs
  useEffect(() => {
    localStorage.setItem(LS_KEY_COLUMNS, JSON.stringify([...visibleColumns]));
  }, [visibleColumns]);

  useEffect(() => {
    localStorage.setItem(LS_KEY_PAGE_SIZE, pageSize);
  }, [pageSize]);

  // Fetch ALL traffic data for the workspace (paginated to bypass 1000-row limit)
  const { data: allTraffic, isLoading: trafficLoading } = useQuery({
    queryKey: ["all-traffic-data"],
    queryFn: fetchAllTrafficRows,
    staleTime: 5 * 60 * 1000,
  });

  // Available months from traffic data
  const availableMonths = useMemo(() => {
    if (!allTraffic) return [];
    const months = new Set<string>();
    for (const t of allTraffic) months.add(t.period_date);
    return [...months].sort();
  }, [allTraffic]);

  // Build rows: one per offer, aggregating traffic across domains
  const rows: OfferTrafficRow[] = useMemo(() => {
    if (!allOffers) return [];

    const trafficByOffer = new Map<string, { date: string; visits: number }[]>();
    for (const t of allTraffic || []) {
      const key = t.spied_offer_id;
      if (!trafficByOffer.has(key)) trafficByOffer.set(key, []);
      trafficByOffer.get(key)!.push({ date: t.period_date, visits: t.visits ?? 0 });
    }

    return allOffers.map((o: any) => {
      const records = trafficByOffer.get(o.id) || [];
      const hasTrafficData = records.length > 0;

      const monthMap = new Map<string, number>();
      for (const r of records) {
        monthMap.set(r.date, (monthMap.get(r.date) || 0) + r.visits);
      }
      const sorted = [...monthMap.entries()].sort((a, b) => a[0].localeCompare(b[0]));

      const filtered = sorted.filter(([date]) => {
        if (rangeFrom && date < rangeFrom) return false;
        if (rangeTo && date > rangeTo + "-31") return false;
        return true;
      });

      const vals = filtered.map(([, v]) => v);
      const last = vals.length > 0 ? vals[vals.length - 1] : 0;
      const prev = vals.length >= 2 ? vals[vals.length - 2] : 0;
      const variation = prev > 0 ? ((last - prev) / prev) * 100 : (last > 0 ? 100 : 0);
      const peak = vals.length > 0 ? Math.max(...vals) : 0;
      const peakIdx = vals.indexOf(peak);
      const peakDate = filtered[peakIdx]?.[0] || "";

      return {
        id: o.id,
        nome: o.nome,
        domain: o.main_domain || "—",
        status: o.status || "RADAR",
        vertical: o.vertical,
        discovered_at: o.discovered_at,
        lastMonth: last,
        prevMonth: prev,
        variation,
        peak,
        peakDate,
        sparkline: vals.slice(-6),
        hasTrafficData,
        monthlyData: monthMap,
      };
    });
  }, [allOffers, allTraffic, rangeFrom, rangeTo]);

  // Filter
  const filteredRows = useMemo(() => {
    let r = rows;
    if (statusFilter.size > 0) r = r.filter(x => statusFilter.has(x.status));
    if (search) {
      const s = search.toLowerCase();
      r = r.filter(x => x.nome.toLowerCase().includes(s) || x.domain.toLowerCase().includes(s));
    }
    return r;
  }, [rows, statusFilter, search]);

  // Sort
  const sortedRows = useMemo(() => {
    const arr = [...filteredRows];
    const dir = sortDir === "asc" ? 1 : -1;
    arr.sort((a, b) => {
      switch (sortField) {
        case "nome": return a.nome.localeCompare(b.nome) * dir;
        case "lastMonth": return (a.lastMonth - b.lastMonth) * dir;
        case "variation": return (a.variation - b.variation) * dir;
        case "peak": return (a.peak - b.peak) * dir;
        case "status": return a.status.localeCompare(b.status) * dir;
        case "discovered": return (a.discovered_at || "").localeCompare(b.discovered_at || "") * dir;
        default: return 0;
      }
    });
    return arr;
  }, [filteredRows, sortField, sortDir]);

  // Pagination
  const isInfinite = pageSize === "all";
  const pageSizeNum = isInfinite ? sortedRows.length : parseInt(pageSize);
  const totalPages = isInfinite ? 1 : Math.max(1, Math.ceil(sortedRows.length / pageSizeNum));
  const paginatedRows = isInfinite
    ? sortedRows
    : sortedRows.slice(currentPage * pageSizeNum, (currentPage + 1) * pageSizeNum);

  // Reset page on filter/sort change
  useEffect(() => { setCurrentPage(0); }, [statusFilter, search, sortField, sortDir, rangeFrom, rangeTo]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const toggleStatusFilter = (value: string) => {
    setStatusFilter(prev => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value); else next.add(value);
      return next;
    });
  };

  // Inline status update
  const handleInlineStatusChange = async (offerId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from("spied_offers").update({ status: newStatus } as any).eq("id", offerId);
      if (error) throw error;
      setEditingStatusId(null);
      refetch();
      queryClient.invalidateQueries({ queryKey: ["spied-offers"] });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  // Column toggle
  const toggleColumn = (key: string) => {
    setVisibleColumns(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const toggleMonthColumn = (month: string) => {
    setMonthColumns(prev => {
      const next = new Set(prev);
      if (next.has(month)) next.delete(month); else next.add(month);
      return next;
    });
  };

  // Chart data from chartIds
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
        if (rangeFrom && date < rangeFrom) continue;
        if (rangeTo && date > rangeTo + "-31") continue;
        result.push({ period_date: date, visits, domain: label });
      }
    }
    return result;
  }, [chartIds, allTraffic, allOffers, rangeFrom, rangeTo]);

  // Selection
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const toggleChart = useCallback((id: string) => {
    setChartIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    if (selectedIds.size === sortedRows.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedRows.map(r => r.id)));
    }
  }, [sortedRows, selectedIds]);

  const addAllToChart = useCallback(() => {
    setChartIds(new Set(sortedRows.filter(r => r.hasTrafficData).map(r => r.id)));
  }, [sortedRows]);

  // Bulk status change
  const handleBulkStatus = async (newStatus: string) => {
    const ids = Array.from(selectedIds);
    try {
      const { error } = await supabase.from("spied_offers").update({ status: newStatus } as any).in("id", ids);
      if (error) throw error;
      toast({ title: `${ids.length} ofertas → ${newStatus}` });
      setSelectedIds(new Set());
      refetch();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const allChecked = sortedRows.length > 0 && sortedRows.every(r => selectedIds.has(r.id));

  // Sparkline SVG
  const Sparkline = ({ data, variation }: { data: number[]; variation: number }) => {
    if (!data || data.length < 2) return <span className="text-muted-foreground text-xs">—</span>;
    const color = variation > 5 ? "hsl(142, 76%, 36%)" : variation < -5 ? "hsl(0, 84%, 60%)" : "hsl(var(--muted-foreground))";
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const h = 22;
    const w = 56;
    const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
    return (
      <svg width={w} height={h} className="inline-block">
        <polyline fill="none" stroke={color} strokeWidth={1.5} points={points} />
      </svg>
    );
  };

  const SortHeader = ({ field, label, className }: { field: SortField; label: string; className?: string }) => (
    <TableHead
      className={`cursor-pointer select-none ${className || ""}`}
      onClick={() => toggleSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {sortField === field && (
          <ArrowUpDown className="h-3 w-3 text-primary" />
        )}
      </span>
    </TableHead>
  );

  // Sorted month columns
  const sortedMonthCols = [...monthColumns].sort();

  // Pagination controls component
  const PaginationControls = () => (
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
          {sortedRows.length} oferta(s) {sortedRows.filter(r => r.hasTrafficData).length > 0 && `• ${sortedRows.filter(r => r.hasTrafficData).length} com trafego`}
          {rangeFrom && ` • ${formatDate(rangeFrom)} – ${rangeTo ? formatDate(rangeTo) : "..."}`}
        </span>
      </div>
      {!isInfinite && totalPages > 1 && (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">{currentPage + 1} / {totalPages}</span>
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(p => p + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Loading indicator */}
      {trafficLoading && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando dados de trafego ({allTraffic?.length?.toLocaleString("pt-BR") || 0} registros)...
        </div>
      )}
      {/* Top controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar oferta ou dominio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <MonthRangePicker
          from={rangeFrom}
          to={rangeTo}
          onChange={(f, t) => { setRangeFrom(f); setRangeTo(t); }}
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="text-xs gap-1">
              <Columns className="h-3.5 w-3.5" />
              Colunas
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="end">
            <p className="text-xs font-medium mb-2">Colunas visiveis</p>
            <div className="space-y-1.5">
              {ALL_COLUMNS.map(col => (
                <label key={col.key} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={visibleColumns.has(col.key)}
                    onCheckedChange={() => toggleColumn(col.key)}
                  />
                  {col.label}
                </label>
              ))}
            </div>
            {availableMonths.length > 0 && (
              <>
                <p className="text-xs font-medium mt-3 mb-2">Meses individuais</p>
                <div className="max-h-40 overflow-y-auto space-y-1.5">
                  {availableMonths.map(m => (
                    <label key={m} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox
                        checked={monthColumns.has(m)}
                        onCheckedChange={() => toggleMonthColumn(m)}
                      />
                      {formatDate(m)}
                    </label>
                  ))}
                </div>
              </>
            )}
          </PopoverContent>
        </Popover>
        <Button variant="outline" size="sm" onClick={addAllToChart} className="text-xs gap-1">
          <BarChart3 className="h-3.5 w-3.5" />
          Comparar visiveis
        </Button>
      </div>

      {/* Multi-status filter badges */}
      <div className="flex flex-wrap gap-1.5">
        {STATUS_OPTIONS.map(s => {
          const active = statusFilter.has(s.value);
          return (
            <Badge
              key={s.value}
              variant="outline"
              className={`cursor-pointer transition-colors ${active ? "ring-2 ring-primary bg-primary/10" : "hover:bg-muted/50"}`}
              onClick={() => toggleStatusFilter(s.value)}
            >
              {s.label}
            </Badge>
          );
        })}
        {statusFilter.size > 0 && (
          <Button variant="ghost" size="sm" className="h-5 text-xs px-2" onClick={() => setStatusFilter(new Set())}>
            <X className="h-3 w-3 mr-1" /> Limpar
          </Button>
        )}
      </div>

      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50 border">
          <span className="text-sm font-medium">{selectedIds.size} selecionada(s)</span>
          <div className="flex-1" />
          <Select onValueChange={handleBulkStatus}>
            <SelectTrigger className="w-40 h-8">
              <SelectValue placeholder="Alterar status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map(s => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="text-xs" onClick={() => {
            setChartIds(prev => {
              const next = new Set(prev);
              selectedIds.forEach(id => next.add(id));
              return next;
            });
          }}>
            <BarChart3 className="h-3 w-3 mr-1" /> Adicionar ao grafico
          </Button>
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => setSelectedIds(new Set())}>
            Limpar selecao
          </Button>
        </div>
      )}

      {/* Chart */}
      {chartIds.size > 0 && chartData.length > 0 && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex gap-1.5 flex-wrap items-center">
                <span className="text-xs font-medium text-muted-foreground mr-1">No grafico:</span>
                {[...chartIds].map(id => {
                  const offer = (allOffers as any[])?.find((o: any) => o.id === id);
                  return (
                    <Badge key={id} variant="secondary" className="gap-1 pr-1 text-xs">
                      {offer?.nome || id}
                      <button onClick={() => toggleChart(id)} className="ml-0.5 hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => setChartIds(new Set())}>
                Limpar grafico
              </Button>
            </div>
            <TrafficChart data={chartData} height={350} />
          </CardContent>
        </Card>
      )}

      {chartIds.size > 0 && chartData.length === 0 && (
        <div className="border border-dashed rounded-lg p-6 text-center">
          <p className="text-muted-foreground text-sm">Nenhum dado de trafego para as ofertas selecionadas no periodo.</p>
        </div>
      )}

      {/* Pagination top */}
      <PaginationControls />

      {/* Main table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox checked={allChecked} onCheckedChange={selectAll} />
              </TableHead>
              <TableHead className="w-[36px] text-center">
                <BarChart3 className="h-3.5 w-3.5 mx-auto" />
              </TableHead>
              {visibleColumns.has("status") && <SortHeader field="status" label="Status" className="w-[90px]" />}
              {visibleColumns.has("oferta") && <SortHeader field="nome" label="Oferta" className="min-w-[180px]" />}
              {visibleColumns.has("trend") && <TableHead className="w-[70px] text-center">Trend</TableHead>}
              {visibleColumns.has("lastMonth") && <SortHeader field="lastMonth" label="Ultimo Mes" className="text-right w-[100px]" />}
              {visibleColumns.has("variation") && <SortHeader field="variation" label="Variacao" className="text-right w-[90px]" />}
              {visibleColumns.has("peak") && <SortHeader field="peak" label="Pico" className="text-right w-[90px]" />}
              {visibleColumns.has("discovered") && <SortHeader field="discovered" label="Descoberto" className="w-[90px]" />}
              {sortedMonthCols.map(m => (
                <TableHead key={m} className="text-right w-[80px] text-xs">{formatDate(m)}</TableHead>
              ))}
              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10 + sortedMonthCols.length} className="text-center py-8 text-muted-foreground">
                  Nenhuma oferta encontrada.
                </TableCell>
              </TableRow>
            ) : paginatedRows.map((row) => {
              const sb = STATUS_BADGE[row.status] || STATUS_BADGE.RADAR;
              const isSelected = selectedIds.has(row.id);
              const isCharted = chartIds.has(row.id);

              return (
                <TableRow
                  key={row.id}
                  className={`transition-colors ${isSelected ? "bg-primary/10" : "hover:bg-muted/50"}`}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelect(row.id)}
                    />
                  </TableCell>
                  <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => toggleChart(row.id)}
                      className={`p-1 rounded transition-colors ${
                        isCharted
                          ? "bg-primary/20 text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      title={isCharted ? "Remover do grafico" : "Adicionar ao grafico"}
                    >
                      <BarChart3 className="h-3.5 w-3.5" />
                    </button>
                  </TableCell>
                  {visibleColumns.has("status") && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Popover open={editingStatusId === row.id} onOpenChange={(open) => setEditingStatusId(open ? row.id : null)}>
                        <PopoverTrigger asChild>
                          <button className="cursor-pointer">
                            <Badge variant="outline" className={sb.className}>{sb.label}</Badge>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-40 p-1" align="start">
                          {STATUS_OPTIONS.map(s => (
                            <button
                              key={s.value}
                              className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-muted/50 transition-colors"
                              onClick={() => handleInlineStatusChange(row.id, s.value)}
                            >
                              {s.label}
                            </button>
                          ))}
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                  )}
                  {visibleColumns.has("oferta") && (
                    <TableCell>
                      <p className="font-medium text-sm">{row.nome}</p>
                      <p className="text-xs text-muted-foreground">{row.domain}</p>
                    </TableCell>
                  )}
                  {visibleColumns.has("trend") && (
                    <TableCell className="text-center">
                      <Sparkline data={row.sparkline} variation={row.variation} />
                    </TableCell>
                  )}
                  {visibleColumns.has("lastMonth") && (
                    <TableCell className="text-right font-medium text-sm">
                      {row.hasTrafficData ? formatK(row.lastMonth) : <span className="text-muted-foreground">N/A</span>}
                    </TableCell>
                  )}
                  {visibleColumns.has("variation") && (
                    <TableCell className="text-right">
                      {row.hasTrafficData ? (
                        <span className={`inline-flex items-center gap-0.5 text-sm ${
                          row.variation > 100 ? "text-success font-bold" :
                          row.variation > 5 ? "text-success" :
                          row.variation < -5 ? "text-destructive" : "text-muted-foreground"
                        }`}>
                          {row.variation > 5 ? <TrendingUp className="h-3 w-3" /> :
                           row.variation < -5 ? <TrendingDown className="h-3 w-3" /> :
                           <Minus className="h-3 w-3" />}
                          {row.variation > 0 ? "+" : ""}{row.variation.toFixed(0)}%
                        </span>
                      ) : <span className="text-muted-foreground text-sm">—</span>}
                    </TableCell>
                  )}
                  {visibleColumns.has("peak") && (
                    <TableCell className="text-right text-xs">
                      {row.hasTrafficData && row.peak > 0
                        ? <>{formatK(row.peak)} <span className="text-muted-foreground">({row.peakDate ? formatDate(row.peakDate) : ""})</span></>
                        : <span className="text-muted-foreground">—</span>
                      }
                    </TableCell>
                  )}
                  {visibleColumns.has("discovered") && (
                    <TableCell className="text-xs text-muted-foreground">
                      {row.discovered_at
                        ? formatDate(row.discovered_at.slice(0, 7))
                        : "—"}
                    </TableCell>
                  )}
                  {sortedMonthCols.map(m => (
                    <TableCell key={m} className="text-right text-xs">
                      {row.monthlyData?.get(m) != null ? formatK(row.monthlyData.get(m)!) : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                  ))}
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => navigate(`/spy/${row.id}`)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination bottom */}
      <PaginationControls />
    </div>
  );
}
