import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/shared/components/ui/select";
import { Search, X, Archive } from "lucide-react";
import { STATUS_OPTIONS } from "./constants";

interface SpyFilterBarProps {
  trafficDataSource: "similarweb" | "semrush";
  onTrafficSourceChange: (src: "similarweb" | "semrush") => void;
  vertical: string;
  onVerticalChange: (v: string) => void;
  source: string;
  onSourceChange: (v: string) => void;
  search: string;
  onSearchChange: (v: string) => void;
  statusFilter: Set<string>;
  onToggleStatus: (value: string) => void;
  onClearStatusFilter: () => void;
  columnSelector: React.ReactNode;
  showArchived: boolean;
  onToggleArchived: () => void;
  savedViewsSlot?: React.ReactNode;
}

export function SpyFilterBar({
  trafficDataSource, onTrafficSourceChange,
  vertical, onVerticalChange,
  source, onSourceChange,
  search, onSearchChange,
  statusFilter, onToggleStatus, onClearStatusFilter,
  columnSelector,
  showArchived, onToggleArchived,
  savedViewsSlot,
}: SpyFilterBarProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3 items-center">
        {/* Traffic source toggle — design system tokens */}
        <div
          className="flex items-center rounded-[var(--radius-md)] overflow-hidden text-[length:var(--text-label)] border border-[var(--border-default)]"
          title="Fonte dos dados de trafego exibidos na coluna Trafego"
        >
          <button
            className={`px-3 py-1.5 transition-all duration-[var(--duration-fast)] ${
              trafficDataSource === 'similarweb'
                ? 'bg-[var(--accent-primary)] text-white [font-weight:var(--font-medium)]'
                : 'text-[color:var(--text-secondary)] hover:text-[color:var(--text-body)] hover:bg-[var(--bg-subtle)]'
            }`}
            onClick={() => onTrafficSourceChange('similarweb')}
          >
            SimilarWeb
          </button>
          <button
            className={`px-3 py-1.5 transition-all duration-[var(--duration-fast)] ${
              trafficDataSource === 'semrush'
                ? 'bg-[var(--accent-primary)] text-white [font-weight:var(--font-medium)]'
                : 'text-[color:var(--text-secondary)] hover:text-[color:var(--text-body)] hover:bg-[var(--bg-subtle)]'
            }`}
            onClick={() => onTrafficSourceChange('semrush')}
          >
            SEMrush
          </button>
        </div>

        <Select value={vertical} onValueChange={(v) => onVerticalChange(v === "all" ? "" : v)}>
          <SelectTrigger className="w-32 border-[var(--border-default)] bg-[var(--bg-surface)]"><SelectValue placeholder="Vertical" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="nutra">Nutra</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="tech">Tech</SelectItem>
          </SelectContent>
        </Select>

        <Select value={source} onValueChange={(v) => onSourceChange(v === "all" ? "" : v)}>
          <SelectTrigger className="w-36 border-[var(--border-default)] bg-[var(--bg-surface)]"><SelectValue placeholder="Fonte" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="publicwww">PublicWWW</SelectItem>
            <SelectItem value="fb_ads_library">FB Ads Library</SelectItem>
            <SelectItem value="adheart">AdHeart</SelectItem>
            <SelectItem value="semrush">Semrush</SelectItem>
            <SelectItem value="manual">Manual</SelectItem>
          </SelectContent>
        </Select>

        {columnSelector}

        {savedViewsSlot}

        {/* Vault/Archive toggle */}
        <Button
          variant={showArchived ? "default" : "outline"}
          size="sm"
          className={`gap-1.5 text-xs ${showArchived ? 'bg-[var(--accent-primary)]' : 'border-[var(--border-default)] text-[color:var(--text-secondary)]'}`}
          onClick={onToggleArchived}
          title={showArchived ? "Esconder ofertas do Vault" : "Mostrar ofertas do Vault (arquivadas)"}
        >
          <Archive className="h-3.5 w-3.5" />
          Vault
        </Button>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[color:var(--text-muted)]" />
          <Input
            placeholder="Buscar nome, dominio, produto..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-[var(--bg-surface)] border-[var(--border-default)] placeholder:text-[color:var(--text-muted)]"
          />
        </div>
      </div>

      {/* Multi-status filter badges */}
      <div className="flex flex-wrap gap-1.5">
        {STATUS_OPTIONS.map(s => {
          const active = statusFilter.has(s.value);
          return (
            <Badge
              key={s.value}
              variant="outline"
              className={`cursor-pointer transition-all duration-[var(--duration-fast)] text-[length:var(--text-caption)] ${
                active
                  ? "ring-2 ring-[var(--accent-primary)] bg-[var(--accent-primary-muted)] text-[color:var(--text-body)] border-[var(--border-glow)]"
                  : "border-[var(--border-default)] text-[color:var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:border-[var(--border-interactive)]"
              }`}
              onClick={() => onToggleStatus(s.value)}
            >
              {s.label}
            </Badge>
          );
        })}
        {statusFilter.size > 0 && (
          <Button variant="ghost" size="sm" className="h-5 text-xs px-2 text-[color:var(--text-muted)]" onClick={onClearStatusFilter}>
            <X className="h-3 w-3 mr-1" /> Limpar
          </Button>
        )}
      </div>
    </div>
  );
}
