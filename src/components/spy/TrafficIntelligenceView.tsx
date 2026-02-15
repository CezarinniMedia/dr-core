import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSpiedOffers } from "@/hooks/useSpiedOffers";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
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
import { Input } from "@/components/ui/input";
import {
  TrendingUp, TrendingDown, Minus, Search, Eye, ArrowUpDown, BarChart3, X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const STATUS_OPTIONS = [
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
  SCALING: { label: "🚀 Scaling", className: "bg-success/20 text-success" },
  DYING: { label: "Dying", className: "bg-accent/20 text-accent" },
  DEAD: { label: "Dead", className: "bg-muted text-muted-foreground" },
  CLONED: { label: "Cloned", className: "bg-primary/20 text-primary" },
};

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
  const { data: allOffers, refetch } = useSpiedOffers();

  // Filters & state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("lastMonth");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [chartIds, setChartIds] = useState<Set<string>>(new Set());
  const [rangeFrom, setRangeFrom] = useState<string | null>(null);
  const [rangeTo, setRangeTo] = useState<string | null>(null);

  // Fetch ALL traffic data for the workspace
  const { data: allTraffic } = useQuery({
    queryKey: ["all-traffic-data"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("offer_traffic_data")
        .select("spied_offer_id, domain, period_date, visits")
        .order("period_date", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  // Build rows: one per offer, aggregating traffic across domains
  const rows: OfferTrafficRow[] = useMemo(() => {
    if (!allOffers) return [];

    // Group traffic by offer
    const trafficByOffer = new Map<string, { date: string; visits: number }[]>();
    for (const t of allTraffic || []) {
      const key = t.spied_offer_id;
      if (!trafficByOffer.has(key)) trafficByOffer.set(key, []);
      trafficByOffer.get(key)!.push({ date: t.period_date, visits: t.visits ?? 0 });
    }

    return allOffers.map((o: any) => {
      const records = trafficByOffer.get(o.id) || [];
      const hasTrafficData = records.length > 0;

      // Aggregate by month (sum visits across domains)
      const monthMap = new Map<string, number>();
      for (const r of records) {
        monthMap.set(r.date, (monthMap.get(r.date) || 0) + r.visits);
      }
      const sorted = [...monthMap.entries()].sort((a, b) => a[0].localeCompare(b[0]));

      // Apply range filter for metrics calculation
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
      };
    });
  }, [allOffers, allTraffic, rangeFrom, rangeTo]);

  // Filter
  const filteredRows = useMemo(() => {
    let r = rows;
    if (statusFilter !== "all") r = r.filter(x => x.status === statusFilter);
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

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  // Chart data from chartIds
  const chartData = useMemo(() => {
    if (chartIds.size === 0 || !allTraffic || !allOffers) return [];
    const offerNames = new Map<string, string>();
    for (const o of allOffers as any[]) {
      if (chartIds.has(o.id)) offerNames.set(o.id, o.main_domain || o.nome);
    }

    // Group by offer→month, aggregate domains
    const byOffer = new Map<string, Map<string, number>>();
    for (const t of allTraffic) {
      if (!chartIds.has(t.spied_offer_id)) continue;
      const label = offerNames.get(t.spied_offer_id) || t.domain;
      if (!byOffer.has(label)) byOffer.set(label, new Map());
      const mm = byOffer.get(label)!;
      mm.set(t.period_date, (mm.get(t.period_date) || 0) + (t.visits ?? 0));
    }

    // Build flat array for TrafficChart
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
      toast({ title: `✅ ${ids.length} ofertas → ${newStatus}` });
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

  return (
    <div className="space-y-4">
      {/* Top controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar oferta ou domínio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36 h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {STATUS_OPTIONS.map(s => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <MonthRangePicker
          from={rangeFrom}
          to={rangeTo}
          onChange={(f, t) => { setRangeFrom(f); setRangeTo(t); }}
        />
        <Button variant="outline" size="sm" onClick={addAllToChart} className="text-xs gap-1">
          <BarChart3 className="h-3.5 w-3.5" />
          Comparar visíveis
        </Button>
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
            // Add selected to chart
            setChartIds(prev => {
              const next = new Set(prev);
              selectedIds.forEach(id => next.add(id));
              return next;
            });
          }}>
            📊 Adicionar ao gráfico
          </Button>
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => setSelectedIds(new Set())}>
            Limpar seleção
          </Button>
        </div>
      )}

      {/* Chart */}
      {chartIds.size > 0 && chartData.length > 0 && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex gap-1.5 flex-wrap items-center">
                <span className="text-xs font-medium text-muted-foreground mr-1">No gráfico:</span>
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
                Limpar gráfico
              </Button>
            </div>
            <TrafficChart data={chartData} height={350} />
          </CardContent>
        </Card>
      )}

      {chartIds.size > 0 && chartData.length === 0 && (
        <div className="border border-dashed rounded-lg p-6 text-center">
          <p className="text-muted-foreground text-sm">Nenhum dado de tráfego para as ofertas selecionadas no período.</p>
        </div>
      )}

      {/* Main table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox checked={allChecked} onCheckedChange={selectAll} />
              </TableHead>
              <TableHead className="w-[36px] text-center">📊</TableHead>
              <SortHeader field="status" label="Status" className="w-[90px]" />
              <SortHeader field="nome" label="Oferta" className="min-w-[180px]" />
              <TableHead className="w-[70px] text-center">Trend</TableHead>
              <SortHeader field="lastMonth" label="Último Mês" className="text-right w-[100px]" />
              <SortHeader field="variation" label="Variação" className="text-right w-[90px]" />
              <SortHeader field="peak" label="Pico" className="text-right w-[90px]" />
              <SortHeader field="discovered" label="Descoberto" className="w-[90px]" />
              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  Nenhuma oferta encontrada.
                </TableCell>
              </TableRow>
            ) : sortedRows.map((row) => {
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
                      title={isCharted ? "Remover do gráfico" : "Adicionar ao gráfico"}
                    >
                      <BarChart3 className="h-3.5 w-3.5" />
                    </button>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={sb.className}>{sb.label}</Badge>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-sm">{row.nome}</p>
                    <p className="text-xs text-muted-foreground">{row.domain}</p>
                  </TableCell>
                  <TableCell className="text-center">
                    <Sparkline data={row.sparkline} variation={row.variation} />
                  </TableCell>
                  <TableCell className="text-right font-medium text-sm">
                    {row.hasTrafficData ? formatK(row.lastMonth) : <span className="text-muted-foreground">N/A</span>}
                  </TableCell>
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
                        {row.variation > 100 && " 🚀"}
                      </span>
                    ) : <span className="text-muted-foreground text-sm">—</span>}
                  </TableCell>
                  <TableCell className="text-right text-xs">
                    {row.hasTrafficData && row.peak > 0
                      ? <>{formatK(row.peak)} <span className="text-muted-foreground">({row.peakDate ? formatDate(row.peakDate) : ""})</span></>
                      : <span className="text-muted-foreground">—</span>
                    }
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {row.discovered_at
                      ? formatDate(row.discovered_at.slice(0, 7))
                      : "—"}
                  </TableCell>
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

      <p className="text-xs text-muted-foreground">
        {sortedRows.length} oferta(s) • {sortedRows.filter(r => r.hasTrafficData).length} com dados de tráfego
        {rangeFrom && ` • Período: ${formatDate(rangeFrom)} – ${rangeTo ? formatDate(rangeTo) : "..."}`}
      </p>
    </div>
  );
}
