import { Button } from "@/shared/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/shared/components/ui/select";
import { Trash2 } from "lucide-react";
import { STATUS_OPTIONS } from "./constants";

interface SpyBulkActionsBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onBulkStatusChange: (status: string) => void;
  onBulkDelete: () => void;
}

export function SpyBulkActionsBar({
  selectedCount, totalCount,
  onSelectAll, onBulkStatusChange, onBulkDelete,
}: SpyBulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
      <span className="text-sm font-medium">{selectedCount} selecionada(s)</span>
      <Button size="sm" variant="outline" onClick={onSelectAll}>
        {selectedCount === totalCount ? "Desmarcar todas" : `Selecionar todas (${totalCount})`}
      </Button>
      <div className="flex-1" />
      <Select onValueChange={onBulkStatusChange}>
        <SelectTrigger className="w-40 h-8"><SelectValue placeholder="Alterar status" /></SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map(s => (
            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button size="sm" variant="destructive" onClick={onBulkDelete}>
        <Trash2 className="h-3.5 w-3.5 mr-1" />
        Apagar ({selectedCount})
      </Button>
    </div>
  );
}
