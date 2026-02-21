import { useMemo } from "react";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/shared/components/ui/select";
import { Search, X } from "lucide-react";
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
}

export function SpyFilterBar({
  trafficDataSource, onTrafficSourceChange,
  vertical, onVerticalChange,
  source, onSourceChange,
  search, onSearchChange,
  statusFilter, onToggleStatus, onClearStatusFilter,
  columnSelector,
}: SpyFilterBarProps) {
  return (
    <>
      <div className="flex flex-wrap gap-3">
        {/* Traffic source toggle */}
        <div className="flex items-center border rounded-md overflow-hidden text-xs" title="Fonte dos dados de trafego exibidos na coluna Trafego">
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

        <Select value={vertical} onValueChange={(v) => onVerticalChange(v === "all" ? "" : v)}>
          <SelectTrigger className="w-32"><SelectValue placeholder="Vertical" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="nutra">Nutra</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="tech">Tech</SelectItem>
          </SelectContent>
        </Select>

        <Select value={source} onValueChange={(v) => onSourceChange(v === "all" ? "" : v)}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Fonte" /></SelectTrigger>
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

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar nome, dominio, produto..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
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
    </>
  );
}
