import { useState } from "react";
import { useOfferTrafficData, useBulkInsertTrafficData } from "@/hooks/useSpiedOffers";
import { TrafficChart } from "@/components/spy/TrafficChart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SpyTrafficTabProps {
  offerId: string;
  offerDomains?: { domain: string }[];
  mainDomain?: string | null;
}

const MONTH_NAMES_PT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export function SpyTrafficTab({ offerId, offerDomains, mainDomain }: SpyTrafficTabProps) {
  const { data: trafficData, isLoading } = useOfferTrafficData(offerId);
  const bulkInsert = useBulkInsertTrafficData();
  const { toast } = useToast();

  const [showManual, setShowManual] = useState(false);
  const [manualDomain, setManualDomain] = useState(mainDomain || "");
  const [manualMonth, setManualMonth] = useState("");
  const [manualVisits, setManualVisits] = useState("");
  const [period, setPeriod] = useState("all");

  const allDomains = [...new Set([
    ...(offerDomains?.map((d) => d.domain) || []),
    ...(trafficData?.map((d) => d.domain) || []),
    ...(mainDomain ? [mainDomain] : []),
  ])];

  const filteredData = (trafficData || []).filter((d) => {
    if (period === "all") return true;
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - parseInt(period));
    return new Date(d.period_date) >= cutoff;
  });

  const handleManualAdd = async () => {
    if (!manualDomain || !manualMonth || !manualVisits) return;
    try {
      await bulkInsert.mutateAsync({
        offerId,
        records: [{
          domain: manualDomain,
          period_date: `${manualMonth}-01`,
          visits: parseInt(manualVisits),
          period_type: "monthly" as const,
        }],
      });
      setManualVisits("");
      setManualMonth("");
      toast({ title: "✅ Dado adicionado!" });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  if (isLoading) return <p className="text-muted-foreground">Carregando...</p>;

  if (!trafficData || trafficData.length === 0) {
    return (
      <div className="border border-dashed rounded-lg p-12 text-center space-y-4">
        <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto" />
        <p className="text-muted-foreground">📊 Nenhum dado de tráfego ainda.</p>
        <p className="text-sm text-muted-foreground">Importe dados do Semrush ou adicione manualmente.</p>
        <Button variant="outline" size="sm" onClick={() => setShowManual(true)}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar Manualmente
        </Button>
        {showManual && (
          <ManualForm
            domains={allDomains}
            domain={manualDomain}
            setDomain={setManualDomain}
            month={manualMonth}
            setMonth={setManualMonth}
            visits={manualVisits}
            setVisits={setManualVisits}
            onAdd={handleManualAdd}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Period filter */}
      <div className="flex items-center gap-2">
        {["3", "6", "12", "all"].map((p) => (
          <Button
            key={p}
            variant={period === p ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod(p)}
          >
            {p === "all" ? "Todos" : `${p}M`}
          </Button>
        ))}
      </div>

      {/* Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Tráfego por Domínio</CardTitle>
        </CardHeader>
        <CardContent>
          <TrafficChart
            data={filteredData.map((d) => ({
              period_date: d.period_date,
              visits: d.visits ?? 0,
              domain: d.domain,
            }))}
            height={350}
          />
          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-3">
            {allDomains.filter((d) => filteredData.some((td) => td.domain === d)).map((domain, i) => {
              const colors = [
                "hsl(217, 91%, 60%)", "hsl(0, 84%, 60%)", "hsl(142, 76%, 36%)",
                "hsl(38, 92%, 50%)", "hsl(262, 83%, 58%)", "hsl(330, 81%, 60%)",
              ];
              return (
                <div key={domain} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
                  {domain}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Manual add */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Plus className="h-4 w-4" /> Adicionar Manualmente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ManualForm
            domains={allDomains}
            domain={manualDomain}
            setDomain={setManualDomain}
            month={manualMonth}
            setMonth={setManualMonth}
            visits={manualVisits}
            setVisits={setManualVisits}
            onAdd={handleManualAdd}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function ManualForm({
  domains, domain, setDomain, month, setMonth, visits, setVisits, onAdd,
}: {
  domains: string[];
  domain: string; setDomain: (v: string) => void;
  month: string; setMonth: (v: string) => void;
  visits: string; setVisits: (v: string) => void;
  onAdd: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 items-end">
      {domains.length > 0 ? (
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Domínio</label>
          <Select value={domain} onValueChange={setDomain}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Domínio" /></SelectTrigger>
            <SelectContent>
              {domains.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Domínio</label>
          <Input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="dominio.com" className="w-48" />
        </div>
      )}
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Mês</label>
        <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="w-40" />
      </div>
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Visitas</label>
        <Input type="number" value={visits} onChange={(e) => setVisits(e.target.value)} placeholder="12000" className="w-28" />
      </div>
      <Button size="sm" onClick={onAdd}>Adicionar</Button>
    </div>
  );
}
