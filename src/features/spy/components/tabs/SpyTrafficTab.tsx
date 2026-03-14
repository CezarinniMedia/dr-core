import { useState } from "react";
import { useOfferTrafficData, useBulkInsertTrafficData, useUpdateTrafficData, useDeleteTrafficData } from "@/features/spy/hooks/useSpiedOffers";
import { TrafficChart } from "@/features/spy/components/TrafficChart";
import { MonthRangePicker } from "@/features/spy/components/MonthRangePicker";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
// Card replaced by design-token divs
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/shared/components/ui/table";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";
import { BarChart3, Plus, Edit, Trash2, ChevronDown, Loader2 } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";

interface SpyTrafficTabProps {
  offerId: string;
  offerDomains?: { domain: string }[];
  mainDomain?: string | null;
}

export function SpyTrafficTab({ offerId, offerDomains, mainDomain }: SpyTrafficTabProps) {
  const { data: trafficData, isLoading } = useOfferTrafficData(offerId);
  const bulkInsert = useBulkInsertTrafficData();
  const updateTraffic = useUpdateTrafficData();
  const deleteTraffic = useDeleteTrafficData();
  const { toast } = useToast();

  const [showManual, setShowManual] = useState(false);
  const [manualDomain, setManualDomain] = useState(mainDomain || "");
  const [manualMonth, setManualMonth] = useState("");
  const [manualVisits, setManualVisits] = useState("");
  const [rangeFrom, setRangeFrom] = useState<string | null>(null);
  const [rangeTo, setRangeTo] = useState<string | null>(null);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [editVisits, setEditVisits] = useState("");
  const [showDataTable, setShowDataTable] = useState(false);

  const allDomains = [...new Set([
    ...(offerDomains?.map((d) => d.domain) || []),
    ...(trafficData?.map((d) => d.domain) || []),
    ...(mainDomain ? [mainDomain] : []),
  ])];

  const filteredData = (trafficData || []).filter((d) => {
    if (!rangeFrom && !rangeTo) return true;
    const dateKey = d.period_date.slice(0, 7); // "2025-11"
    if (rangeFrom && dateKey < rangeFrom) return false;
    if (rangeTo && dateKey > rangeTo) return false;
    return true;
  });

  const handleRangeChange = (from: string | null, to: string | null) => {
    setRangeFrom(from);
    setRangeTo(to);
  };

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
      toast({ title: "Dado adicionado" });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const openEditRecord = (record: any) => {
    setEditingRecord(record);
    setEditVisits(record.visits?.toString() || "0");
  };

  const handleEditSave = () => {
    if (!editingRecord) return;
    updateTraffic.mutate(
      { id: editingRecord.id, offerId, data: { visits: parseInt(editVisits) || 0 } },
      {
        onSuccess: () => {
          setEditingRecord(null);
          toast({ title: "Registro atualizado" });
        },
      }
    );
  };

  const handleDeleteRecord = (id: string) => {
    deleteTraffic.mutate({ id, offerId }, {
      onSuccess: () => toast({ title: "Registro removido." }),
    });
  };

  if (isLoading) return <p className="text-[color:var(--text-muted)]">Carregando...</p>;

  if (!trafficData || trafficData.length === 0) {
    return (
      <div className="border border-dashed border-[var(--border-default)] rounded-[var(--radius-lg)] p-12 text-center space-y-4 bg-[var(--bg-surface)]">
        <BarChart3 className="h-12 w-12 text-[color:var(--text-muted)] mx-auto" />
        <p className="text-[color:var(--text-muted)]">Nenhum dado de tráfego ainda.</p>
        <p className="text-sm text-[color:var(--text-secondary)]">Importe dados do Semrush ou adicione manualmente.</p>
        <Button variant="outline" size="sm" className="border-[var(--border-default)]" onClick={() => setShowManual(true)}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar Manualmente
        </Button>
        {showManual && (
          <ManualForm
            domains={allDomains} domain={manualDomain} setDomain={setManualDomain}
            month={manualMonth} setMonth={setManualMonth}
            visits={manualVisits} setVisits={setManualVisits} onAdd={handleManualAdd}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Period filter — Semrush-style */}
      <MonthRangePicker from={rangeFrom} to={rangeTo} onChange={handleRangeChange} />

      {/* Chart */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)]">
        <div className="px-4 pt-4 pb-2">
          <h3 className="text-[length:var(--text-label)] [font-weight:var(--font-semibold)] text-[color:var(--text-secondary)]">Tráfego por Domínio</h3>
        </div>
        <div className="px-4 pb-4">
          <TrafficChart
            data={filteredData.map((d) => ({
              period_date: d.period_date,
              visits: d.visits ?? 0,
              domain: d.domain,
            }))}
            height={350}
          />
          <div className="flex flex-wrap gap-3 mt-3">
            {allDomains.filter((d) => filteredData.some((td) => td.domain === d)).map((domain, i) => {
              const colors = [
                "var(--accent-blue)", "var(--semantic-hot)", "var(--accent-green)",
                "var(--semantic-warning)", "var(--accent-primary)", "var(--accent-teal)",
              ];
              return (
                <div key={domain} className="flex items-center gap-1.5 text-xs text-[color:var(--text-muted)]">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
                  {domain}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Data Table (collapsible) */}
      <Collapsible open={showDataTable} onOpenChange={setShowDataTable}>
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)]">
          <div className="px-4 pt-4 pb-2">
            <CollapsibleTrigger className="flex items-center gap-2 w-full">
              <h3 className="text-[length:var(--text-label)] [font-weight:var(--font-semibold)] text-[color:var(--text-secondary)] flex-1 text-left flex items-center gap-2">
                Dados Brutos ({filteredData.length} registros)
              </h3>
              <ChevronDown className={`h-4 w-4 text-[color:var(--text-muted)] transition-transform ${showDataTable ? "rotate-180" : ""}`} />
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            <div className="px-4 pb-4">
              <div className="border border-[var(--border-default)] rounded-[var(--radius-md)] overflow-x-auto max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Domínio</TableHead>
                      <TableHead>Período</TableHead>
                      <TableHead className="text-right">Visitas</TableHead>
                      <TableHead>Fonte</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((r: any) => (
                      <TableRow key={r.id}>
                        <TableCell className="text-xs font-mono">{r.domain}</TableCell>
                        <TableCell className="text-xs">{r.period_date}</TableCell>
                        <TableCell className="text-xs text-right">{(r.visits ?? 0).toLocaleString("pt-BR")}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{r.source || "—"}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-6 w-6" aria-label="Editar registro" onClick={() => openEditRecord(r)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" aria-label="Deletar registro" onClick={() => handleDeleteRecord(r.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Manual add */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)]">
        <div className="px-4 pt-4 pb-2">
          <h3 className="text-[length:var(--text-label)] [font-weight:var(--font-semibold)] text-[color:var(--text-secondary)] flex items-center gap-2">
            <Plus className="h-4 w-4" /> Adicionar Manualmente
          </h3>
        </div>
        <div className="px-4 pb-4">
          <ManualForm
            domains={allDomains} domain={manualDomain} setDomain={setManualDomain}
            month={manualMonth} setMonth={setManualMonth}
            visits={manualVisits} setVisits={setManualVisits} onAdd={handleManualAdd}
          />
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingRecord} onOpenChange={(open) => { if (!open) setEditingRecord(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Editar Registro de Tráfego</DialogTitle>
          </DialogHeader>
          {editingRecord && (
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Domínio</Label>
                <Input value={editingRecord.domain} disabled className="text-sm" />
              </div>
              <div>
                <Label className="text-xs">Período</Label>
                <Input value={editingRecord.period_date} disabled className="text-sm" />
              </div>
              <div>
                <Label className="text-xs">Visitas</Label>
                <Input type="number" value={editVisits} onChange={(e) => setEditVisits(e.target.value)} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingRecord(null)}>Cancelar</Button>
            <Button onClick={handleEditSave} disabled={updateTraffic.isPending}>
              {updateTraffic.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Atualizar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
