import React, { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { fetchAllOffersLite } from "@/features/spy/components/traffic-intel/types";
import { TrafficChart } from "@/features/spy/components/TrafficChart";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { X, TrendingUp, TrendingDown, Minus, Flame, Rocket } from "lucide-react";

const STATUS_BADGE: Record<string, { label: React.ReactNode; className: string }> = {
  RADAR: { label: "Radar", className: "bg-muted text-muted-foreground" },
  ANALYZING: { label: "Analyzing", className: "bg-warning/20 text-warning" },
  HOT: { label: <span className="inline-flex items-center gap-1"><Flame className="h-3 w-3" /> HOT</span>, className: "bg-destructive/20 text-destructive" },
  SCALING: { label: <span className="inline-flex items-center gap-1"><Rocket className="h-3 w-3" /> Scaling</span>, className: "bg-success/20 text-success" },
  DYING: { label: "Dying", className: "bg-accent/20 text-accent" },
  DEAD: { label: "Dead", className: "bg-muted text-muted-foreground" },
  CLONED: { label: "Cloned", className: "bg-primary/20 text-primary" },
};

export function TrafficComparisonView() {
  const [selectedOfferIds, setSelectedOfferIds] = useState<string[]>([]);
  const [period, setPeriod] = useState("6");

  // Batch-paginated fetch of ALL offers (lightweight fields only)
  const { data: allOffers } = useQuery({
    queryKey: ["all-offers-lite"],
    queryFn: fetchAllOffersLite,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch traffic data for all selected offers
  const { data: trafficData } = useQuery({
    queryKey: ["traffic-comparison", selectedOfferIds],
    queryFn: async () => {
      if (selectedOfferIds.length === 0) return [];
      const { data, error } = await supabase
        .from("offer_traffic_data")
        .select("*")
        .in("spied_offer_id", selectedOfferIds)
        .order("period_date", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: selectedOfferIds.length > 0,
  });

  const offersWithTraffic = allOffers?.filter((o: any) => !selectedOfferIds.includes(o.id)) || [];

  const addOffer = (id: string) => {
    if (!selectedOfferIds.includes(id)) setSelectedOfferIds([...selectedOfferIds, id]);
  };

  const removeOffer = (id: string) => {
    setSelectedOfferIds(selectedOfferIds.filter((oid) => oid !== id));
  };

  const bulkAdd = (status: string) => {
    const ids = allOffers?.filter((o: any) => o.status === status).map((o: any) => o.id) || [];
    setSelectedOfferIds([...new Set([...selectedOfferIds, ...ids])]);
  };

  // Filter by period
  const filteredData = useMemo(() => {
    if (!trafficData) return [];
    if (period === "all") return trafficData;
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - parseInt(period));
    return trafficData.filter((d) => new Date(d.period_date) >= cutoff);
  }, [trafficData, period]);

  // Build offer name map for domains
  const offerMap = useMemo(() => {
    const map = new Map<string, { nome: string; status: string; domain: string }>();
    for (const o of allOffers || []) {
      if (selectedOfferIds.includes((o as any).id)) {
        map.set((o as any).id, { nome: (o as any).nome, status: (o as any).status || "RADAR", domain: (o as any).main_domain || "" });
      }
    }
    return map;
  }, [allOffers, selectedOfferIds]);

  // Use domain as line key — map offer to its primary domain
  const chartData = useMemo(() => {
    return filteredData.map((d) => ({
      period_date: d.period_date,
      visits: d.visits ?? 0,
      domain: d.domain,
    }));
  }, [filteredData]);

  // Summary table data
  const summaryData = useMemo(() => {
    if (!trafficData || trafficData.length === 0) return [];

    const domainGroups = new Map<string, { visits: number; date: string }[]>();
    for (const d of filteredData) {
      if (!domainGroups.has(d.domain)) domainGroups.set(d.domain, []);
      domainGroups.get(d.domain)!.push({ visits: d.visits ?? 0, date: d.period_date });
    }

    return [...domainGroups.entries()].map(([domain, records]) => {
      const sorted = records.sort((a, b) => a.date.localeCompare(b.date));
      const last = sorted[sorted.length - 1]?.visits || 0;
      const prev = sorted.length >= 2 ? sorted[sorted.length - 2]?.visits || 0 : 0;
      const variation = prev > 0 ? ((last - prev) / prev) * 100 : 0;
      const peak = sorted.reduce((max, r) => r.visits > max.visits ? r : max, sorted[0]);

      // Find which offer this domain belongs to
      const offerEntry = [...offerMap.values()].find((o) => o.domain === domain);

      return {
        domain,
        offerName: offerEntry?.nome || domain,
        status: offerEntry?.status || "RADAR",
        lastMonth: last,
        prevMonth: prev,
        variation,
        peakVisits: peak.visits,
        peakDate: peak.date,
      };
    }).sort((a, b) => b.lastMonth - a.lastMonth);
  }, [filteredData, trafficData, offerMap]);

  const formatK = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return String(n);
  };

  const formatDate = (d: string) => {
    const [y, m] = d.split("-");
    const names = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return `${names[parseInt(m) - 1]} ${y.slice(2)}`;
  };

  return (
    <div className="space-y-4">
      {/* Domain selector */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Selecionar Ofertas para Comparação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            <Select onValueChange={addOffer}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Adicionar oferta..." />
              </SelectTrigger>
              <SelectContent>
                {offersWithTraffic.map((o: any) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.nome} ({o.main_domain || "—"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => bulkAdd("HOT")} className="inline-flex items-center gap-1"><Flame className="h-3 w-3" /> Todos HOT</Button>
            <Button variant="outline" size="sm" onClick={() => bulkAdd("SCALING")} className="inline-flex items-center gap-1"><Rocket className="h-3 w-3" /> Todos SCALING</Button>
          </div>

          {selectedOfferIds.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {selectedOfferIds.map((id) => {
                const offer = offerMap.get(id);
                return (
                  <Badge key={id} variant="secondary" className="gap-1 pr-1">
                    {offer?.nome || id}
                    <button onClick={() => removeOffer(id)} className="ml-1 hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedOfferIds.length > 0 && chartData.length > 0 && (
        <>
          {/* Period filter */}
          <div className="flex gap-2">
            {["3", "6", "12", "all"].map((p) => (
              <Button key={p} variant={period === p ? "default" : "outline"} size="sm" onClick={() => setPeriod(p)}>
                {p === "all" ? "Todos" : `${p}M`}
              </Button>
            ))}
          </div>

          {/* Chart */}
          <Card>
            <CardContent className="pt-4">
              <TrafficChart data={chartData} height={400} />
            </CardContent>
          </Card>

          {/* Summary table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Resumo Comparativo</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Oferta</TableHead>
                    <TableHead>Domínio</TableHead>
                    <TableHead className="text-right">Último Mês</TableHead>
                    <TableHead className="text-right">Anterior</TableHead>
                    <TableHead className="text-right">Variação</TableHead>
                    <TableHead className="text-right">Pico</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summaryData.map((row) => {
                    const sb = STATUS_BADGE[row.status] || STATUS_BADGE.RADAR;
                    return (
                      <TableRow key={row.domain}>
                        <TableCell className="font-medium text-sm">{row.offerName}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{row.domain}</TableCell>
                        <TableCell className="text-right font-medium">{formatK(row.lastMonth)}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{formatK(row.prevMonth)}</TableCell>
                        <TableCell className="text-right">
                          <span className={`inline-flex items-center gap-1 ${
                            row.variation > 100 ? "text-success font-bold" :
                            row.variation > 5 ? "text-success" :
                            row.variation < -5 ? "text-destructive" : "text-muted-foreground"
                          }`}>
                            {row.variation > 5 ? <TrendingUp className="h-3 w-3" /> :
                             row.variation < -5 ? <TrendingDown className="h-3 w-3" /> :
                             <Minus className="h-3 w-3" />}
                            {row.variation > 0 ? "+" : ""}{row.variation.toFixed(1)}%
                            {row.variation > 100 && <Rocket className="h-3 w-3 ml-1 inline" />}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-xs">
                          {formatK(row.peakVisits)} ({formatDate(row.peakDate)})
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={sb.className}>{sb.label}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {selectedOfferIds.length > 0 && chartData.length === 0 && (
        <div className="border border-dashed rounded-lg p-8 text-center">
          <p className="text-muted-foreground">Nenhum dado de tráfego para as ofertas selecionadas.</p>
          <p className="text-sm text-muted-foreground mt-1">Importe dados do Semrush primeiro.</p>
        </div>
      )}
    </div>
  );
}
