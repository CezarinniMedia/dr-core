import { Search, Plus, Zap, FileSpreadsheet } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { PipelineStatusIndicator } from "./PipelineStatusCard";

interface SpyRadarHeaderProps {
  onQuickAdd: () => void;
  onFullForm: () => void;
  onImport: () => void;
}

export function SpyRadarHeader({ onQuickAdd, onFullForm, onImport }: SpyRadarHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Search className="h-6 w-6" /> Radar de Ofertas
        </h1>
        <div className="flex items-center gap-3">
          <p className="text-muted-foreground text-sm">Monitore ofertas, espione funis e escale mais rapido</p>
          <PipelineStatusIndicator />
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={onQuickAdd}><Zap className="h-4 w-4 mr-2" />Quick Add</Button>
        <Button variant="outline" onClick={onFullForm}><Plus className="h-4 w-4 mr-2" />Oferta Completa</Button>
        <Button variant="outline" onClick={onImport}><FileSpreadsheet className="h-4 w-4 mr-2" />Importar CSV</Button>
      </div>
    </div>
  );
}
