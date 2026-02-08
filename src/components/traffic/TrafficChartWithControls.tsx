import { useState, useMemo, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, Plus, TrendingUp, TrendingDown, Minus, X } from 'lucide-react';
import { TrafficChart, getDomainColor } from './TrafficChart';
import { ManualTrafficEntry } from './ManualTrafficEntry';
import { useTrafficData, useAvailableDomains } from '@/hooks/useTrafficData';
import { cn, formatNumber } from '@/lib/utils';

type PeriodPreset = '1m' | '3m' | '6m' | '1y' | 'all';

function getDateRange(preset: PeriodPreset): { from: Date; to: Date } | undefined {
  if (preset === 'all') return undefined;
  const to = new Date();
  const from = new Date();
  switch (preset) {
    case '1m': from.setMonth(from.getMonth() - 1); break;
    case '3m': from.setMonth(from.getMonth() - 3); break;
    case '6m': from.setMonth(from.getMonth() - 6); break;
    case '1y': from.setFullYear(from.getFullYear() - 1); break;
  }
  return { from, to };
}

interface TrafficChartWithControlsProps {
  initialDomains?: string[];
  height?: number;
}

export function TrafficChartWithControls({ initialDomains = [], height = 350 }: TrafficChartWithControlsProps) {
  const [selectedDomains, setSelectedDomains] = useState<string[]>(initialDomains);
  const [hiddenDomains, setHiddenDomains] = useState<Set<string>>(new Set());
  const [periodoTipo, setPeriodoTipo] = useState('MENSAL');
  const [periodPreset, setPeriodPreset] = useState<PeriodPreset>('1y');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDomainPicker, setShowDomainPicker] = useState(false);
  const [manualEntryOpen, setManualEntryOpen] = useState(false);
  const chartWrapperRef = useRef<HTMLDivElement>(null);

  const dateRange = useMemo(() => getDateRange(periodPreset), [periodPreset]);
  const { data: trafficData, isLoading } = useTrafficData(selectedDomains, periodoTipo, dateRange);
  const { data: availableDomains } = useAvailableDomains();

  const filteredAvailable = useMemo(() => {
    if (!availableDomains) return [];
    return availableDomains.filter(d =>
      d.dominio_principal &&
      !selectedDomains.includes(d.dominio_principal) &&
      (d.dominio_principal.includes(searchTerm.toLowerCase()) || d.nome.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [availableDomains, selectedDomains, searchTerm]);

  const addDomain = useCallback((dom: string) => {
    setSelectedDomains(prev => [...prev, dom]);
    setSearchTerm('');
    setShowDomainPicker(false);
  }, []);

  const removeDomain = useCallback((dom: string) => {
    setSelectedDomains(prev => prev.filter(d => d !== dom));
    setHiddenDomains(prev => { const next = new Set(prev); next.delete(dom); return next; });
  }, []);

  const toggleDomain = useCallback((dom: string) => {
    setHiddenDomains(prev => {
      const next = new Set(prev);
      if (next.has(dom)) next.delete(dom);
      else next.add(dom);
      return next;
    });
  }, []);

  const handleExportPNG = useCallback(() => {
    const svgEl = chartWrapperRef.current?.querySelector('svg');
    if (!svgEl) return;

    const canvas = document.createElement('canvas');
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      const ctx = canvas.getContext('2d')!;
      ctx.scale(2, 2);
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      const link = document.createElement('a');
      link.download = `traffic-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = url;
  }, []);

  return (
    <div className="space-y-4">
      {/* Controls bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Domain picker */}
        <div className="relative">
          <Button
            variant="outline" size="sm"
            onClick={() => setShowDomainPicker(!showDomainPicker)}
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Domínio
          </Button>

          {showDomainPicker && (
            <div className="absolute top-full mt-1 left-0 z-50 w-72 rounded-lg border bg-popover p-2 shadow-lg">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar domínio..."
                className="h-8 text-xs mb-2"
                autoFocus
              />
              <ScrollArea className="max-h-48">
                {filteredAvailable.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-2">Nenhum domínio encontrado</p>
                ) : (
                  filteredAvailable.slice(0, 20).map(d => (
                    <button
                      key={d.id}
                      onClick={() => addDomain(d.dominio_principal!)}
                      className="w-full text-left px-2 py-1.5 text-xs rounded hover:bg-muted transition-colors"
                    >
                      <span className="font-mono">{d.dominio_principal}</span>
                      <span className="text-muted-foreground ml-1">({d.nome})</span>
                    </button>
                  ))
                )}
              </ScrollArea>
            </div>
          )}
        </div>

        {/* Selected domain badges */}
        {selectedDomains.map((dom, i) => (
          <Badge
            key={dom}
            variant="outline"
            className="text-xs gap-1 cursor-pointer"
            style={{ borderColor: getDomainColor(i) }}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: getDomainColor(i) }}
            />
            {dom}
            <button onClick={() => removeDomain(dom)} className="ml-0.5 hover:text-destructive">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}

        <div className="ml-auto flex items-center gap-2">
          {/* Period preset */}
          <Select value={periodPreset} onValueChange={(v) => setPeriodPreset(v as PeriodPreset)}>
            <SelectTrigger className="h-8 w-24 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">1 mês</SelectItem>
              <SelectItem value="3m">3 meses</SelectItem>
              <SelectItem value="6m">6 meses</SelectItem>
              <SelectItem value="1y">1 ano</SelectItem>
              <SelectItem value="all">Tudo</SelectItem>
            </SelectContent>
          </Select>

          {/* Period type */}
          <Select value={periodoTipo} onValueChange={setPeriodoTipo}>
            <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="MENSAL">Mensal</SelectItem>
              <SelectItem value="SEMANAL">Semanal</SelectItem>
              <SelectItem value="DIARIO">Diário</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={() => setManualEntryOpen(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Dados
          </Button>

          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleExportPNG} title="Exportar PNG">
            <Download className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Chart */}
      <div ref={chartWrapperRef} className="rounded-lg border bg-card p-2">
        {isLoading ? (
          <div className="flex items-center justify-center" style={{ height }}>
            <p className="text-sm text-muted-foreground">Carregando dados...</p>
          </div>
        ) : selectedDomains.length === 0 ? (
          <div className="flex items-center justify-center border border-dashed rounded-lg" style={{ height }}>
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">Selecione domínios para visualizar</p>
              <Button variant="outline" size="sm" onClick={() => setShowDomainPicker(true)}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar domínio
              </Button>
            </div>
          </div>
        ) : (
          <TrafficChart
            data={trafficData?.chartData || []}
            dominios={selectedDomains}
            hiddenDomains={hiddenDomains}
            onToggleDomain={toggleDomain}
            height={height}
          />
        )}
      </div>

      {/* Summary cards */}
      {trafficData?.summaries && trafficData.summaries.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {trafficData.summaries.map((s, i) => {
            const TrendIcon = s.tendencia === 'up' ? TrendingUp : s.tendencia === 'down' ? TrendingDown : Minus;
            const trendColor = s.tendencia === 'up'
              ? 'text-green-500'
              : s.tendencia === 'down'
              ? 'text-destructive'
              : 'text-muted-foreground';

            return (
              <div key={s.dominio} className="rounded-lg border p-3 space-y-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: getDomainColor(i) }}
                  />
                  <span className="text-xs font-mono truncate">{s.dominio}</span>
                </div>
                <p className="text-lg font-bold">{formatNumber(s.trafegoAtual)}</p>
                <div className={cn('flex items-center gap-1 text-xs', trendColor)}>
                  <TrendIcon className="h-3 w-3" />
                  {s.delta > 0 ? '+' : ''}{s.delta}%
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ManualTrafficEntry open={manualEntryOpen} onOpenChange={setManualEntryOpen} />
    </div>
  );
}
