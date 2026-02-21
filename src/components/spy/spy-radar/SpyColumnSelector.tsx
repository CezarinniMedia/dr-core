import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Columns, Search, X, BookmarkPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  COLUMN_GROUPS, normalizeStr,
  type ColumnPreset, loadPresets, savePresetsToStorage,
} from "./constants";

interface SpyColumnSelectorProps {
  visibleColumns: Set<string>;
  onToggleColumn: (key: string) => void;
}

export function SpyColumnSelector({ visibleColumns, onToggleColumn }: SpyColumnSelectorProps) {
  const { toast } = useToast();
  const [colSearch, setColSearch] = useState("");
  const [presets, setPresets] = useState<ColumnPreset[]>(loadPresets);
  const [showSavePreset, setShowSavePreset] = useState(false);
  const [presetName, setPresetName] = useState("");

  const filteredColumnGroups = useMemo(() => {
    if (!colSearch.trim()) return COLUMN_GROUPS;
    const q = normalizeStr(colSearch);
    return COLUMN_GROUPS.map(g => ({
      ...g,
      columns: g.columns.filter(c => normalizeStr(c.label).includes(q) || c.key.toLowerCase().includes(q)),
    })).filter(g => g.columns.length > 0);
  }, [colSearch]);

  const handleSavePreset = () => {
    if (!presetName.trim()) return;
    const newPresets = [...presets, { name: presetName.trim(), columns: [...visibleColumns] }];
    setPresets(newPresets);
    savePresetsToStorage(newPresets);
    setPresetName("");
    setShowSavePreset(false);
    toast({ title: `Preset "${presetName.trim()}" salvo!` });
  };

  const handleDeletePreset = (index: number) => {
    const newPresets = presets.filter((_, i) => i !== index);
    setPresets(newPresets);
    savePresetsToStorage(newPresets);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs gap-1">
          <Columns className="h-3.5 w-3.5" />
          Colunas
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="end">
        <div className="relative mb-3">
          <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar coluna..."
            value={colSearch}
            onChange={(e) => setColSearch(e.target.value)}
            className="pl-7 h-8 text-xs"
          />
        </div>

        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
          {filteredColumnGroups.map(g => (
            <div key={g.group}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{g.group}</p>
              <div className="space-y-1">
                {g.columns.map(col => (
                  <label key={col.key} className="flex items-center gap-2 text-xs cursor-pointer hover:text-foreground">
                    <Checkbox checked={visibleColumns.has(col.key)} onCheckedChange={() => onToggleColumn(col.key)} />
                    {col.label}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t mt-3 pt-3 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Presets</p>
          {presets.length > 0 && (
            <div className="space-y-0.5">
              {presets.map((p, i) => (
                <div key={i} className="flex items-center gap-1">
                  <button
                    className="flex-1 text-left text-xs px-2 py-1 rounded hover:bg-muted/50 transition-colors"
                    onClick={() => {
                      // Load preset — parent handles via onToggleColumn or we'd need a setColumns
                      // For now, we toggle to match preset exactly
                      const target = new Set(p.columns);
                      // Remove columns not in preset
                      visibleColumns.forEach(key => { if (!target.has(key)) onToggleColumn(key); });
                      // Add columns in preset
                      target.forEach(key => { if (!visibleColumns.has(key)) onToggleColumn(key); });
                    }}
                  >
                    {p.name}
                  </button>
                  <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive shrink-0" onClick={() => handleDeletePreset(i)} aria-label={`Remover preset ${p.name}`}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          {showSavePreset ? (
            <div className="flex gap-1">
              <Input
                placeholder="Nome do preset"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                className="h-7 text-xs flex-1"
                onKeyDown={(e) => e.key === "Enter" && handleSavePreset()}
                autoFocus
              />
              <Button size="sm" className="h-7 px-2 text-xs" onClick={handleSavePreset}>OK</Button>
              <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => { setShowSavePreset(false); setPresetName(""); }}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" className="w-full h-7 text-xs gap-1" onClick={() => setShowSavePreset(true)}>
              <BookmarkPlus className="h-3 w-3" />
              Salvar preset atual
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
