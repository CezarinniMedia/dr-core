import { Button } from "@/shared/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/shared/components/ui/select";
import { Trash2, Tag } from "lucide-react";
import { STATUS_OPTIONS } from "./constants";

interface SpyBulkActionsBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onBulkStatusChange: (status: string) => void;
  onBulkDelete: () => void;
  onBulkTag?: (tag: string) => void;
}

export function SpyBulkActionsBar({
  selectedCount, totalCount,
  onSelectAll, onBulkStatusChange, onBulkDelete, onBulkTag,
}: SpyBulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-3 p-3 rounded-[var(--radius-lg)] bg-[var(--bg-elevated)] border border-[var(--border-glow)] shadow-[var(--glow-primary)] animate-fade-in">
      <span className="text-[length:var(--text-body-size)] [font-weight:var(--font-medium)] text-[color:var(--accent-primary)]">
        {selectedCount} selecionada(s)
      </span>
      <Button size="sm" variant="outline" className="border-[var(--border-default)] text-[color:var(--text-secondary)]" onClick={onSelectAll}>
        {selectedCount === totalCount ? "Desmarcar todas" : `Selecionar todas (${totalCount})`}
      </Button>
      <div className="flex-1" />

      <Select onValueChange={onBulkStatusChange}>
        <SelectTrigger className="w-40 h-8 border-[var(--border-default)] bg-[var(--bg-surface)]">
          <SelectValue placeholder="Alterar status" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map(s => (
            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {onBulkTag && (
        <Select onValueChange={onBulkTag}>
          <SelectTrigger className="w-36 h-8 border-[var(--border-default)] bg-[var(--bg-surface)]">
            <Tag className="h-3.5 w-3.5 mr-1.5" />
            <SelectValue placeholder="Adicionar tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nutra">nutra</SelectItem>
            <SelectItem value="info">info</SelectItem>
            <SelectItem value="ecom">ecom</SelectItem>
            <SelectItem value="tech">tech</SelectItem>
            <SelectItem value="finance">finance</SelectItem>
          </SelectContent>
        </Select>
      )}

      <Button size="sm" variant="destructive" onClick={onBulkDelete} className="bg-[var(--semantic-error)] hover:bg-[var(--semantic-error)]/90">
        <Trash2 className="h-3.5 w-3.5 mr-1" />
        Apagar ({selectedCount})
      </Button>
    </div>
  );
}
