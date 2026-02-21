import { TooltipProvider } from "@/components/ui/tooltip";
import { useTrafficIntelligence } from "./traffic-intel/useTrafficIntelligence";
import { TrafficControlBar } from "./traffic-intel/TrafficControlBar";
import { TrafficChartingPanel } from "./traffic-intel/TrafficChartingPanel";
import { TrafficTable } from "./traffic-intel/TrafficTable";

export function TrafficIntelligenceView() {
  const ti = useTrafficIntelligence();

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-4">
        <TrafficControlBar
          trafficDataSource={ti.trafficDataSource}
          onTrafficSourceChange={ti.handleTrafficSourceChange}
          search={ti.search}
          onSearchChange={ti.setSearch}
          rangeFrom={ti.rangeFrom}
          rangeTo={ti.rangeTo}
          onRangeChange={(f, t) => { ti.setRangeFrom(f); ti.setRangeTo(t); }}
          visibleColumns={ti.visibleColumns}
          onToggleColumn={ti.toggleColumn}
          monthColumns={ti.monthColumns}
          onToggleMonthColumn={ti.toggleMonthColumn}
          availableMonths={ti.availableMonths}
          statusFilter={ti.statusFilter}
          onToggleStatus={ti.toggleStatusFilter}
          onClearStatusFilter={() => ti.setStatusFilter(new Set())}
          onAddAllToChart={ti.addAllToChart}
          trafficLoading={ti.trafficLoading}
          trafficCount={ti.allTraffic?.length || 0}
          selectedCount={ti.selectedIds.size}
          onBulkStatus={ti.handleBulkStatus}
          onAddSelectedToChart={ti.addSelectedToChart}
          onClearSelection={() => ti.setSelectedIds(new Set())}
        />

        <TrafficChartingPanel
          chartIds={ti.chartIds}
          chartData={ti.chartData}
          allOffers={ti.allOffers as any[]}
          onToggleChart={ti.toggleChart}
          onClearChart={() => ti.setChartIds(new Set())}
        />

        <TrafficTable
          paginatedRows={ti.paginatedRows}
          sortedRows={ti.sortedRows}
          visibleColumns={ti.visibleColumns}
          sortField={ti.sortField}
          sortDir={ti.sortDir}
          onToggleSort={ti.toggleSort}
          selectedIds={ti.selectedIds}
          onToggleSelect={ti.toggleSelect}
          allChecked={ti.allChecked}
          onSelectAll={ti.selectAll}
          chartIds={ti.chartIds}
          onToggleChart={ti.toggleChart}
          sortedMonthCols={ti.sortedMonthCols}
          onInlineStatusChange={ti.handleInlineStatusChange}
          pageSize={ti.pageSize}
          onPageSizeChange={(v) => { ti.setPageSize(v); ti.setCurrentPage(0); }}
          currentPage={ti.currentPage}
          onPageChange={ti.setCurrentPage}
          totalPages={ti.totalPages}
          isInfinite={ti.isInfinite}
          rangeFrom={ti.rangeFrom}
          rangeTo={ti.rangeTo}
        />
      </div>
    </TooltipProvider>
  );
}
