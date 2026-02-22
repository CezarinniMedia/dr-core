import { useRef, memo, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";
import {
  TrendingUp, TrendingDown, Minus, Eye, ArrowUpDown, BarChart3, ChevronLeft, ChevronRight,
} from "lucide-react";
import { formatTrafficNumber, formatPeriodDate, type OfferTrafficRow, type SortField } from "@/shared/services";
import { STATUS_OPTIONS, STATUS_BADGE, PAGE_SIZE_OPTIONS } from "./types";

interface TrafficTableProps {
  paginatedRows: OfferTrafficRow[];
  sortedRows: OfferTrafficRow[];
  visibleColumns: Set<string>;
  sortField: SortField;
  sortDir: string;
  onToggleSort: (field: SortField) => void;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  allChecked: boolean;
  onSelectAll: () => void;
  chartIds: Set<string>;
  onToggleChart: (id: string) => void;
  sortedMonthCols: string[];
  onInlineStatusChange: (offerId: string, newStatus: string) => void;
  // Pagination
  pageSize: string;
  onPageSizeChange: (v: string) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  totalPages: number;
  isInfinite: boolean;
  rangeFrom: string | null;
  rangeTo: string | null;
}

// --- Sparkline SVG (Feature Sagrada #2) - MEMOIZED ---
// Spike detection: >100% = hot orange, positive = teal, negative = red, neutral = muted
// Area fill + glow dot on peak for visual impact. <5ms render target.

const Sparkline = memo(function Sparkline({ data, variation }: { data: number[]; variation: number }) {
  if (!data || data.length < 2) return <span className="text-muted-foreground text-xs">—</span>;

  const isSpike = variation > 100;
  const isUp = variation > 5;
  const isDown = variation < -5;

  // Design system semantic colors
  const strokeColor = isSpike
    ? "var(--semantic-spike, #F97316)"      // orange glow for spikes
    : isUp
      ? "var(--accent-teal, #00D4AA)"       // teal for positive
      : isDown
        ? "var(--semantic-error, #EF4444)"   // red for negative
        : "var(--text-muted, #6B7280)";      // gray for stable

  const fillOpacity = isSpike ? 0.15 : 0.08;

  const h = 24;
  const w = 64;
  const padY = 2;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * w,
    y: padY + (h - 2 * padY) - ((v - min) / range) * (h - 2 * padY),
  }));

  const linePoints = pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  const areaPath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")
    + ` L${w},${h} L0,${h} Z`;

  const lastPt = pts[pts.length - 1];

  return (
    <svg width={w} height={h} className="inline-block" aria-label={`Trend: ${isSpike ? "spike" : isUp ? "up" : isDown ? "down" : "stable"} ${variation.toFixed(0)}%`}>
      <path d={areaPath} fill={strokeColor} opacity={fillOpacity} />
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={linePoints}
      />
      {(isSpike || isUp || isDown) && (
        <circle
          cx={lastPt.x}
          cy={lastPt.y}
          r={isSpike ? 3 : 2}
          fill={strokeColor}
          opacity={isSpike ? 1 : 0.8}
        >
          {isSpike && (
            <animate attributeName="r" values="2;3.5;2" dur="1.5s" repeatCount="indefinite" />
          )}
        </circle>
      )}
    </svg>
  );
});

function SortHeader({ field, label, className, sortField, onToggleSort }: {
  field: SortField; label: string; className?: string; sortField: SortField; onToggleSort: (f: SortField) => void;
}) {
  return (
    <TableHead className={`cursor-pointer select-none ${className || ""}`} onClick={() => onToggleSort(field)}>
      <span className="inline-flex items-center gap-1">
        {label}
        {sortField === field && <ArrowUpDown className="h-3 w-3 text-primary" />}
      </span>
    </TableHead>
  );
}

const PaginationControls = memo(function PaginationControls({ pageSize, onPageSizeChange, currentPage, onPageChange, totalPages, isInfinite, rowCount, hasTrafficCount, rangeFrom, rangeTo }: {
  pageSize: string; onPageSizeChange: (v: string) => void; currentPage: number; onPageChange: (p: number) => void;
  totalPages: number; isInfinite: boolean; rowCount: number; hasTrafficCount: number; rangeFrom: string | null; rangeTo: string | null;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Select value={pageSize} onValueChange={onPageSizeChange}>
          <SelectTrigger className="w-40 h-8"><SelectValue /></SelectTrigger>
          <SelectContent>
            {PAGE_SIZE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">
          {rowCount} oferta(s) {hasTrafficCount > 0 && `• ${hasTrafficCount} com trafego`}
          {rangeFrom && ` • ${formatPeriodDate(rangeFrom)} – ${rangeTo ? formatPeriodDate(rangeTo) : "..."}`}
        </span>
      </div>
      {!isInfinite && totalPages > 1 && (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage === 0} onClick={() => onPageChange(currentPage - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">{currentPage + 1} / {totalPages}</span>
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage >= totalPages - 1} onClick={() => onPageChange(currentPage + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
});

// --- Memoized TrafficRow ---
const TrafficRowContent = memo(function TrafficRowContent({ row, isSelected, isCharted, visibleColumns, sortedMonthCols, onToggleSelect, onToggleChart, onInlineStatusChange, onNavigate }: {
  row: OfferTrafficRow; isSelected: boolean; isCharted: boolean; visibleColumns: Set<string>;
  sortedMonthCols: string[]; onToggleSelect: (id: string) => void; onToggleChart: (id: string) => void;
  onInlineStatusChange: (offerId: string, newStatus: string) => void; onNavigate: (id: string) => void;
}) {
  const sb = STATUS_BADGE[row.status] || STATUS_BADGE.RADAR;

  return (
    <TableRow className={`transition-colors ${isSelected ? "bg-primary/10" : "hover:bg-muted/50"}`}>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <Checkbox checked={isSelected} onCheckedChange={() => onToggleSelect(row.id)} />
      </TableCell>
      <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => onToggleChart(row.id)}
              className={`p-1 rounded transition-colors ${isCharted ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            {isCharted ? "Remover do gráfico" : "Adicionar ao gráfico"}
          </TooltipContent>
        </Tooltip>
      </TableCell>
      {visibleColumns.has("status") && (
        <TableCell onClick={(e) => e.stopPropagation()}>
          <Tooltip>
            <DropdownMenu>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <button className="cursor-pointer">
                    <Badge variant="outline" className={`${sb.className} whitespace-nowrap`}>{sb.label}</Badge>
                  </button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <DropdownMenuContent align="start" className="w-40">
                {STATUS_OPTIONS.map(s => (
                  <DropdownMenuItem key={s.value} onClick={() => onInlineStatusChange(row.id, s.value)}>
                    {s.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <TooltipContent side="right" className="text-xs max-w-[200px]">{sb.tip}</TooltipContent>
          </Tooltip>
        </TableCell>
      )}
      {visibleColumns.has("oferta") && (
        <TableCell>
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="font-medium text-sm truncate max-w-[170px]">{row.nome}</p>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs max-w-xs">{row.nome}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-xs text-muted-foreground truncate max-w-[170px]">{row.domain}</p>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">{row.domain}</TooltipContent>
          </Tooltip>
        </TableCell>
      )}
      {visibleColumns.has("trend") && (
        <TableCell className="text-center">
          <Sparkline data={row.sparkline} variation={row.variation} />
        </TableCell>
      )}
      {visibleColumns.has("lastMonth") && (
        <TableCell className="text-right font-medium text-sm">
          {row.hasTrafficData ? formatTrafficNumber(row.lastMonth) : <span className="text-muted-foreground">N/A</span>}
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
            ? <>{formatTrafficNumber(row.peak)} <span className="text-muted-foreground">({row.peakDate ? formatPeriodDate(row.peakDate) : ""})</span></>
            : <span className="text-muted-foreground">—</span>
          }
        </TableCell>
      )}
      {visibleColumns.has("discovered") && (
        <TableCell className="text-xs text-muted-foreground">
          {row.discovered_at ? formatPeriodDate(row.discovered_at.slice(0, 7)) : "—"}
        </TableCell>
      )}
      {sortedMonthCols.map(m => (
        <TableCell key={m} className="text-right text-xs">
          {row.monthlyData?.get(m) != null ? formatTrafficNumber(row.monthlyData.get(m)!) : <span className="text-muted-foreground">—</span>}
        </TableCell>
      ))}
      <TableCell onClick={(e) => e.stopPropagation()}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onNavigate(row.id)}>
              <Eye className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">Ver detalhes</TooltipContent>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
});

const VIRTUALIZE_THRESHOLD = 100;
const ROW_HEIGHT = 48;

export function TrafficTable({
  paginatedRows, sortedRows, visibleColumns, sortField, sortDir, onToggleSort,
  selectedIds, onToggleSelect, allChecked, onSelectAll,
  chartIds, onToggleChart, sortedMonthCols, onInlineStatusChange,
  pageSize, onPageSizeChange, currentPage, onPageChange, totalPages, isInfinite,
  rangeFrom, rangeTo,
}: TrafficTableProps) {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const shouldVirtualize = paginatedRows.length > VIRTUALIZE_THRESHOLD;

  const virtualizer = useVirtualizer({
    count: paginatedRows.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
    enabled: shouldVirtualize,
  });

  const handleNavigate = (id: string) => navigate(`/spy/${id}`);

  // Pre-compute counts to avoid recalculating in PaginationControls
  const rowCount = sortedRows.length;
  const hasTrafficCount = useMemo(
    () => sortedRows.filter(r => r.hasTrafficData).length,
    [sortedRows]
  );

  const renderRows = () => {
    if (paginatedRows.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={10 + sortedMonthCols.length} className="text-center py-8 text-muted-foreground">
            Nenhuma oferta encontrada.
          </TableCell>
        </TableRow>
      );
    }

    if (shouldVirtualize) {
      const items = virtualizer.getVirtualItems();
      return (
        <>
          {items.length > 0 && (
            <tr style={{ height: items[0].start }} />
          )}
          {items.map(virtualItem => {
            const row = paginatedRows[virtualItem.index];
            return (
              <TrafficRowContent
                key={row.id}
                row={row}
                isSelected={selectedIds.has(row.id)}
                isCharted={chartIds.has(row.id)}
                visibleColumns={visibleColumns}
                sortedMonthCols={sortedMonthCols}
                onToggleSelect={onToggleSelect}
                onToggleChart={onToggleChart}
                onInlineStatusChange={onInlineStatusChange}
                onNavigate={handleNavigate}
              />
            );
          })}
          {items.length > 0 && (
            <tr style={{ height: virtualizer.getTotalSize() - (items[items.length - 1].end) }} />
          )}
        </>
      );
    }

    return paginatedRows.map(row => (
      <TrafficRowContent
        key={row.id}
        row={row}
        isSelected={selectedIds.has(row.id)}
        isCharted={chartIds.has(row.id)}
        visibleColumns={visibleColumns}
        sortedMonthCols={sortedMonthCols}
        onToggleSelect={onToggleSelect}
        onToggleChart={onToggleChart}
        onInlineStatusChange={onInlineStatusChange}
        onNavigate={handleNavigate}
      />
    ));
  };

  return (
    <>
      <PaginationControls
        pageSize={pageSize} onPageSizeChange={onPageSizeChange}
        currentPage={currentPage} onPageChange={onPageChange}
        totalPages={totalPages} isInfinite={isInfinite}
        rowCount={rowCount} hasTrafficCount={hasTrafficCount}
        rangeFrom={rangeFrom} rangeTo={rangeTo}
      />

      <div
        ref={scrollContainerRef}
        className="border rounded-lg overflow-auto"
        style={shouldVirtualize ? { maxHeight: "70vh" } : undefined}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox checked={allChecked} onCheckedChange={onSelectAll} />
              </TableHead>
              <TableHead className="w-[36px] text-center">
                <BarChart3 className="h-3.5 w-3.5 mx-auto" />
              </TableHead>
              {visibleColumns.has("status") && <SortHeader field="status" label="Status" className="w-[90px]" sortField={sortField} onToggleSort={onToggleSort} />}
              {visibleColumns.has("oferta") && <SortHeader field="nome" label="Oferta" className="min-w-[180px]" sortField={sortField} onToggleSort={onToggleSort} />}
              {visibleColumns.has("trend") && <TableHead className="w-[70px] text-center">Trend</TableHead>}
              {visibleColumns.has("lastMonth") && <SortHeader field="lastMonth" label="Ultimo Mes" className="text-right w-[100px]" sortField={sortField} onToggleSort={onToggleSort} />}
              {visibleColumns.has("variation") && <SortHeader field="variation" label="Variacao" className="text-right w-[90px]" sortField={sortField} onToggleSort={onToggleSort} />}
              {visibleColumns.has("peak") && <SortHeader field="peak" label="Pico" className="text-right w-[90px]" sortField={sortField} onToggleSort={onToggleSort} />}
              {visibleColumns.has("discovered") && <SortHeader field="discovered" label="Descoberto" className="w-[90px]" sortField={sortField} onToggleSort={onToggleSort} />}
              {sortedMonthCols.map(m => (
                <TableHead key={m} className="text-right w-[80px] text-xs">{formatPeriodDate(m)}</TableHead>
              ))}
              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {renderRows()}
          </TableBody>
        </Table>
      </div>

      <PaginationControls
        pageSize={pageSize} onPageSizeChange={onPageSizeChange}
        currentPage={currentPage} onPageChange={onPageChange}
        totalPages={totalPages} isInfinite={isInfinite}
        rowCount={rowCount} hasTrafficCount={hasTrafficCount}
        rangeFrom={rangeFrom} rangeTo={rangeTo}
      />
    </>
  );
}
