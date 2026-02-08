import { useState } from 'react';
import { RadarKanban } from '@/components/spy/RadarKanban';
import { QuickAddOferta } from '@/components/spy/QuickAddOferta';
import { CsvImportDialog } from '@/components/spy/CsvImportDialog';
import { ImportHistoryPanel } from '@/components/spy/ImportHistoryPanel';
import { ArsenalPanel } from '@/components/spy/ArsenalPanel';
import { TrafficChartWithControls } from '@/components/traffic/TrafficChartWithControls';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Crosshair, LayoutGrid, Table, BarChart3, Upload, History } from 'lucide-react';

export default function SpyPage() {
  const [view, setView] = useState<'kanban' | 'table' | 'analytics'>('kanban');
  const [csvOpen, setCsvOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold tracking-tight">🔍 Radar de Ofertas</h1>
        <div className="flex items-center gap-2">
          {/* Arsenal Drawer */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Crosshair className="h-4 w-4 mr-1" /> Arsenal
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:max-w-[480px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>⚔️ Arsenal</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <ArsenalPanel />
              </div>
            </SheetContent>
          </Sheet>

          {/* Import History Drawer */}
          <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <History className="h-4 w-4 mr-1" /> Histórico
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:max-w-[480px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>📋 Histórico de Imports</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <ImportHistoryPanel
                  onReimport={() => {
                    setHistoryOpen(false);
                    setCsvOpen(true);
                  }}
                />
              </div>
            </SheetContent>
          </Sheet>

          {/* CSV Import */}
          <Button size="sm" variant="outline" onClick={() => setCsvOpen(true)}>
            <Upload className="h-4 w-4 mr-1" /> Import CSV
          </Button>
          <CsvImportDialog open={csvOpen} onOpenChange={setCsvOpen} />

          <QuickAddOferta />
        </div>
      </div>

      {/* View Switcher */}
      <div className="flex gap-1">
        <Button
          variant={view === 'kanban' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setView('kanban')}
        >
          <LayoutGrid className="h-4 w-4 mr-1" /> Kanban
        </Button>
        <Button
          variant={view === 'table' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setView('table')}
        >
          <Table className="h-4 w-4 mr-1" /> Tabela
        </Button>
        <Button
          variant={view === 'analytics' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setView('analytics')}
        >
          <BarChart3 className="h-4 w-4 mr-1" /> Analytics
        </Button>
      </div>

      {/* Main Content */}
      {view === 'kanban' && <RadarKanban />}
      {view === 'table' && (
        <div className="border border-dashed rounded-lg p-12 text-center text-muted-foreground">
          📊 Table view — será implementado com @tanstack/react-table (próxima versão)
        </div>
      )}
      {view === 'analytics' && (
        <TrafficChartWithControls height={400} />
      )}
    </div>
  );
}
