import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Search, BarChart3, X, Loader2, Columns } from "lucide-react";
import { MonthRangePicker } from "@/features/spy/components/MonthRangePicker";
import { formatPeriodDate } from "@/shared/services";
import { STATUS_OPTIONS, ALL_COLUMNS } from "./types";

interface TrafficControlBarProps {
  trafficDataSource: 'similarweb' | 'semrush';
  onTrafficSourceChange: (src: 'similarweb' | 'semrush') => void;
  search: string;
  onSearchChange: (v: string) => void;
  rangeFrom: string | null;
  rangeTo: string | null;
  onRangeChange: (from: string | null, to: string | null) => void;
  visibleColumns: Set<string>;
  onToggleColumn: (key: string) => void;
  monthColumns: Set<string>;
  onToggleMonthColumn: (month: string) => void;
  availableMonths: string[];
  statusFilter: Set<string>;
  onToggleStatus: (value: string) => void;
  onClearStatusFilter: () => void;
  onAddAllToChart: () => void;
  trafficLoading: boolean;
  trafficCount: number;
  // Bulk actions
  selectedCount: number;
  onBulkStatus: (status: string) => void;
  onAddSelectedToChart: () => void;
  onClearSelection: () => void;
}

export function TrafficControlBar({
  trafficDataSource, onTrafficSourceChange,
  search, onSearchChange,
  rangeFrom, rangeTo, onRangeChange,
  visibleColumns, onToggleColumn,
  monthColumns, onToggleMonthColumn, availableMonths,
  statusFilter, onToggleStatus, onClearStatusFilter,
  onAddAllToChart, trafficLoading, trafficCount,
  selectedCount, onBulkStatus, onAddSelectedToChart, onClearSelection,
}: TrafficControlBarProps) {
  return (
    <>
      {/* Loading indicator */}
      {trafficLoading && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando dados de trafego ({trafficCount.toLocaleString("pt-BR")} registros)...
        </div>
      )}

      {/* Top controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center border rounded-md overflow-hidden text-xs" title="Fonte dos dados de tráfego">
          <button
            className={`px-2.5 py-1.5 transition-colors ${trafficDataSource === 'similarweb' ? 'bg-primary text-primary-foreground font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
            onClick={() => onTrafficSourceChange('similarweb')}
          >
            SimilarWeb
          </button>
          <button
            className={`px-2.5 py-1.5 transition-colors ${trafficDataSource === 'semrush' ? 'bg-primary text-primary-foreground font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
            onClick={() => onTrafficSourceChange('semrush')}
          >
            SEMrush
          </button>
        </div>
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar oferta ou dominio..." value={search} onChange={(e) => onSearchChange(e.target.value)} className="pl-9 h-9" />
        </div>
        <MonthRangePicker from={rangeFrom} to={rangeTo} onChange={onRangeChange} />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="text-xs gap-1">
              <Columns className="h-3.5 w-3.5" /> Colunas
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="end">
            <p className="text-xs font-medium mb-2">Colunas visiveis</p>
            <div className="space-y-1.5">
              {ALL_COLUMNS.map(col => (
                <label key={col.key} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={visibleColumns.has(col.key)} onCheckedChange={() => onToggleColumn(col.key)} />
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
                      <Checkbox checked={monthColumns.has(m)} onCheckedChange={() => onToggleMonthColumn(m)} />
                      {formatPeriodDate(m)}
                    </label>
                  ))}
                </div>
              </>
            )}
          </PopoverContent>
        </Popover>
        <Button variant="outline" size="sm" onClick={onAddAllToChart} className="text-xs gap-1">
          <BarChart3 className="h-3.5 w-3.5" /> Comparar visiveis
        </Button>
      </div>

      {/* Multi-status filter badges */}
      <div className="flex flex-wrap gap-1.5">
        {STATUS_OPTIONS.map(s => {
          const active = statusFilter.has(s.value);
          return (
            <Badge
              key={s.value} variant="outline"
              className={`cursor-pointer transition-colors ${active ? "ring-2 ring-primary bg-primary/10" : "hover:bg-muted/50"}`}
              onClick={() => onToggleStatus(s.value)}
            >
              {s.label}
            </Badge>
          );
        })}
        {statusFilter.size > 0 && (
          <Button variant="ghost" size="sm" className="h-5 text-xs px-2" onClick={onClearStatusFilter}>
            <X className="h-3 w-3 mr-1" /> Limpar
          </Button>
        )}
      </div>

      {/* Bulk actions */}
      {selectedCount > 0 && (
        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50 border">
          <span className="text-sm font-medium">{selectedCount} selecionada(s)</span>
          <div className="flex-1" />
          <Select onValueChange={onBulkStatus}>
            <SelectTrigger className="w-40 h-8"><SelectValue placeholder="Alterar status" /></SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map(s => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="text-xs" onClick={onAddSelectedToChart}>
            <BarChart3 className="h-3 w-3 mr-1" /> Adicionar ao grafico
          </Button>
          <Button variant="ghost" size="sm" className="text-xs" onClick={onClearSelection}>
            Limpar selecao
          </Button>
        </div>
      )}
    </>
  );
}
