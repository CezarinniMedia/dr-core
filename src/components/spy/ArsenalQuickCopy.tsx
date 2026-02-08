import { useState, useRef, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Crosshair, Key, Star } from 'lucide-react';
import { useArsenalFootprints, useArsenalKeywords, useIncrementFootprintUsage } from '@/hooks/useArsenal';
import { useToast } from '@/hooks/use-toast';

interface ArsenalQuickCopyProps {
  type: 'footprint' | 'keyword';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function ArsenalQuickCopy({ type, value, onChange, placeholder, className }: ArsenalQuickCopyProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const incrementUsage = useIncrementFootprintUsage();

  const { data: footprints } = useArsenalFootprints();
  const { data: keywords } = useArsenalKeywords();

  const items = useMemo(() => {
    const q = search.toLowerCase();
    if (type === 'footprint') {
      return ((footprints as any[]) || [])
        .filter((fp) => !q || fp.nome?.toLowerCase().includes(q) || fp.footprint?.toLowerCase().includes(q))
        .sort((a, b) => {
          if (a.is_favorito && !b.is_favorito) return -1;
          if (!a.is_favorito && b.is_favorito) return 1;
          return (b.vezes_usado || 0) - (a.vezes_usado || 0);
        })
        .slice(0, 30);
    } else {
      return ((keywords as any[]) || [])
        .filter((kw) => !q || kw.keyword?.toLowerCase().includes(q))
        .sort((a, b) => {
          if (a.is_favorito && !b.is_favorito) return -1;
          if (!a.is_favorito && b.is_favorito) return 1;
          return (b.vezes_usado || 0) - (a.vezes_usado || 0);
        })
        .slice(0, 30);
    }
  }, [type, footprints, keywords, search]);

  const handleSelect = (item: any) => {
    const val = type === 'footprint' ? (item.footprint || item.query_publicwww) : item.keyword;
    onChange(val);
    incrementUsage.mutate(item.id);
    toast({ title: '📋 Selecionado!', duration: 1000 });
    setOpen(false);
    setSearch('');
  };

  const Icon = type === 'footprint' ? Crosshair : Key;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            ref={inputRef}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setSearch(e.target.value);
              if (!open && e.target.value.length > 0) setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder={placeholder || (type === 'footprint' ? 'Buscar footprint...' : 'Buscar keyword...')}
            className={className}
          />
          <Icon className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
        <div className="p-2 border-b border-border">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Buscar ${type === 'footprint' ? 'footprints' : 'keywords'}...`}
              className="h-7 text-xs pl-7"
              autoFocus
            />
          </div>
        </div>
        <ScrollArea className="max-h-[250px]">
          <div className="p-1">
            {items.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">Nenhum resultado</p>
            )}
            {items.map((item: any) => (
              <button
                key={item.id}
                onClick={() => handleSelect(item)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted/60 transition-colors text-left"
              >
                {item.is_favorito && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium block truncate">
                    {type === 'footprint' ? item.nome : item.keyword}
                  </span>
                  {type === 'footprint' && (
                    <code className="text-[10px] text-muted-foreground block truncate">{item.footprint}</code>
                  )}
                </div>
                {type === 'footprint' && item.categoria && (
                  <Badge variant="outline" className="text-[10px] h-4 px-1 shrink-0">{item.categoria}</Badge>
                )}
                {type === 'keyword' && item.tipo && (
                  <Badge variant="outline" className="text-[10px] h-4 px-1 shrink-0">{item.tipo}</Badge>
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
