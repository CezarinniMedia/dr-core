import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search, Copy, ExternalLink, Crosshair, Key, Terminal, Star,
  MoreHorizontal, Eye, X,
} from 'lucide-react';
import { useArsenalFootprints, useArsenalKeywords, useArsenalDorks, useIncrementFootprintUsage } from '@/hooks/useArsenal';
import { useArsenalSidebar } from './ArsenalSidebarContext';
import { useToast } from '@/hooks/use-toast';

// ===== STYLING MAPS =====

const EFICACIA_BADGE: Record<string, { icon: string; className: string }> = {
  ALTA: { icon: '🔥', className: 'bg-green-500/15 text-green-400 border-green-500/30' },
  MEDIA: { icon: '⚡', className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  BAIXA: { icon: '💤', className: 'bg-muted text-muted-foreground border-border' },
};

const CATEGORIA_LABELS: Record<string, string> = {
  CHECKOUT: '💳 Checkout',
  VSL_TECH: '🎬 VSL Tech',
  PIXEL_TRACKING: '📡 Pixel',
  QUIZ: '❓ Quiz',
  ANALYTICS: '📊 Analytics',
  LANDING_PAGE: '📄 Landing Page',
  VULNERABILITY: '🔓 Vulnerability',
};

// ===== MAIN COMPONENT =====

export function ArsenalPanel() {
  const [searchQuery, setSearchQuery] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [eficaciaFilter, setEficaciaFilter] = useState('all');
  const { toast } = useToast();
  const { close } = useArsenalSidebar();
  const incrementUsage = useIncrementFootprintUsage();

  const { data: footprints } = useArsenalFootprints();
  const { data: keywords } = useArsenalKeywords();
  const { data: dorks } = useArsenalDorks();

  const copyToClipboard = (text: string, id?: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: '📋 Copiado!', duration: 1200 });
    if (id) incrementUsage.mutate(id);
  };

  const openPublicWWW = (query: string) => {
    window.open(`https://publicwww.com/websites/${encodeURIComponent(query)}/`, '_blank');
  };

  // ===== FILTERED & GROUPED DATA =====

  const q = searchQuery.toLowerCase();

  const filteredFootprints = useMemo(() => {
    const list = (footprints as any[]) || [];
    return list
      .filter((fp) => {
        if (q && !fp.nome?.toLowerCase().includes(q) && !fp.footprint?.toLowerCase().includes(q) && !fp.plataforma?.toLowerCase().includes(q)) return false;
        if (catFilter !== 'all' && fp.categoria !== catFilter) return false;
        if (eficaciaFilter !== 'all' && fp.eficacia !== eficaciaFilter) return false;
        return true;
      })
      .sort((a, b) => {
        // Favorites first
        if (a.is_favorito && !b.is_favorito) return -1;
        if (!a.is_favorito && b.is_favorito) return 1;
        // Then by eficacia
        const order: Record<string, number> = { ALTA: 0, MEDIA: 1, BAIXA: 2 };
        return (order[a.eficacia] ?? 1) - (order[b.eficacia] ?? 1);
      });
  }, [footprints, q, catFilter, eficaciaFilter]);

  const groupedFootprints = useMemo(() => {
    const groups: Record<string, any[]> = {};
    filteredFootprints.forEach((fp) => {
      const cat = fp.categoria || 'OUTRO';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(fp);
    });
    return groups;
  }, [filteredFootprints]);

  const filteredKeywords = useMemo(() => {
    const list = (keywords as any[]) || [];
    return list
      .filter((kw) => !q || kw.keyword?.toLowerCase().includes(q) || kw.tipo?.toLowerCase().includes(q))
      .sort((a, b) => {
        if (a.is_favorito && !b.is_favorito) return -1;
        if (!a.is_favorito && b.is_favorito) return 1;
        return (b.vezes_usado || 0) - (a.vezes_usado || 0);
      });
  }, [keywords, q]);

  const groupedKeywords = useMemo(() => {
    const groups: Record<string, any[]> = {};
    filteredKeywords.forEach((kw) => {
      const tipo = kw.tipo || 'OUTRO';
      if (!groups[tipo]) groups[tipo] = [];
      groups[tipo].push(kw);
    });
    return groups;
  }, [filteredKeywords]);

  const filteredDorks = useMemo(() => {
    const list = (dorks as any[]) || [];
    return list
      .filter((d) => !q || d.nome?.toLowerCase().includes(q) || d.dork_query?.toLowerCase().includes(q))
      .sort((a, b) => (b.vezes_usado || 0) - (a.vezes_usado || 0));
  }, [dorks, q]);

  const groupedDorks = useMemo(() => {
    const groups: Record<string, any[]> = {};
    filteredDorks.forEach((d) => {
      const tipo = d.tipo || 'OUTRO';
      if (!groups[tipo]) groups[tipo] = [];
      groups[tipo].push(d);
    });
    return groups;
  }, [filteredDorks]);

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="p-3 border-b border-border space-y-2 shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold flex items-center gap-1.5">
            <Crosshair className="h-4 w-4 text-primary" /> Arsenal
          </h2>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={close}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar footprints, keywords, dorks..."
            className="pl-8 h-8 text-xs"
          />
        </div>

        {/* Quick filters */}
        <div className="flex gap-1.5">
          <Select value={catFilter} onValueChange={setCatFilter}>
            <SelectTrigger className="h-7 text-xs flex-1">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas categorias</SelectItem>
              {Object.entries(CATEGORIA_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={eficaciaFilter} onValueChange={setEficaciaFilter}>
            <SelectTrigger className="h-7 text-xs w-24">
              <SelectValue placeholder="Eficácia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="ALTA">🔥 Alta</SelectItem>
              <SelectItem value="MEDIA">⚡ Média</SelectItem>
              <SelectItem value="BAIXA">💤 Baixa</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs + Content */}
      <Tabs defaultValue="footprints" className="flex-1 flex flex-col min-h-0">
        <TabsList className="mx-3 mt-2 w-auto">
          <TabsTrigger value="footprints" className="text-xs flex-1 gap-1">
            <Crosshair className="h-3 w-3" /> Footprints
            <Badge variant="secondary" className="text-[10px] h-4 px-1 ml-0.5">{filteredFootprints.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="keywords" className="text-xs flex-1 gap-1">
            <Key className="h-3 w-3" /> Keywords
            <Badge variant="secondary" className="text-[10px] h-4 px-1 ml-0.5">{filteredKeywords.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="dorks" className="text-xs flex-1 gap-1">
            <Terminal className="h-3 w-3" /> Dorks
            <Badge variant="secondary" className="text-[10px] h-4 px-1 ml-0.5">{filteredDorks.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          {/* ===== FOOTPRINTS ===== */}
          <TabsContent value="footprints" className="px-3 pb-3 mt-0 space-y-3">
            {Object.entries(groupedFootprints).map(([cat, items]) => (
              <div key={cat}>
                <p className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider mb-1.5 px-1">
                  {CATEGORIA_LABELS[cat] || cat} ({items.length})
                </p>
                <div className="space-y-1">
                  {items.map((fp: any) => (
                    <FootprintItem
                      key={fp.id}
                      fp={fp}
                      onCopy={copyToClipboard}
                      onOpenPublicWWW={openPublicWWW}
                    />
                  ))}
                </div>
              </div>
            ))}
            {filteredFootprints.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8">Nenhum footprint encontrado</p>
            )}
          </TabsContent>

          {/* ===== KEYWORDS ===== */}
          <TabsContent value="keywords" className="px-3 pb-3 mt-0 space-y-3">
            {Object.entries(groupedKeywords).map(([tipo, items]) => (
              <div key={tipo}>
                <p className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider mb-1.5 px-1">
                  {tipo} ({items.length})
                </p>
                <div className="space-y-1">
                  {items.map((kw: any) => (
                    <button
                      key={kw.id}
                      onClick={() => copyToClipboard(kw.keyword, kw.id)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted/60 transition-colors text-left group"
                    >
                      <span className="font-mono text-xs truncate flex-1">{kw.keyword}</span>
                      {kw.is_favorito && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 shrink-0" />}
                      {kw.idioma && <span className="text-[10px] text-muted-foreground">{kw.idioma}</span>}
                      <Copy className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {filteredKeywords.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8">Nenhuma keyword encontrada</p>
            )}
          </TabsContent>

          {/* ===== DORKS ===== */}
          <TabsContent value="dorks" className="px-3 pb-3 mt-0 space-y-3">
            {Object.entries(groupedDorks).map(([tipo, items]) => (
              <div key={tipo}>
                <p className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider mb-1.5 px-1">
                  {tipo} ({items.length})
                </p>
                <div className="space-y-1">
                  {items.map((d: any) => (
                    <button
                      key={d.id}
                      onClick={() => copyToClipboard(d.dork_query, d.id)}
                      className="w-full flex items-start gap-2 px-2 py-1.5 rounded-md hover:bg-muted/60 transition-colors text-left group"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-medium block truncate">{d.nome}</span>
                        <code className="text-[10px] text-muted-foreground block truncate">{d.dork_query}</code>
                      </div>
                      {d.ferramenta && <span className="text-[10px] text-muted-foreground shrink-0">{d.ferramenta}</span>}
                      <Copy className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {filteredDorks.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8">Nenhum dork encontrado</p>
            )}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}

// ===== FOOTPRINT ITEM =====

function FootprintItem({ fp, onCopy, onOpenPublicWWW }: {
  fp: any;
  onCopy: (text: string, id?: string) => void;
  onOpenPublicWWW: (query: string) => void;
}) {
  const efBadge = EFICACIA_BADGE[fp.eficacia] || EFICACIA_BADGE.MEDIA;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-muted/60 transition-colors group cursor-pointer"
          onClick={() => onCopy(fp.query_publicwww || fp.footprint, fp.id)}
        >
          {fp.is_favorito && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 shrink-0" />}
          <span className="text-xs truncate flex-1">{fp.nome}</span>
          <Badge variant="outline" className={`text-[10px] h-4 px-1 border ${efBadge.className}`}>
            {efBadge.icon}
          </Badge>
          {fp.vezes_usado > 0 && (
            <span className="text-[10px] text-muted-foreground">{fp.vezes_usado}×</span>
          )}

          {/* Context menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onCopy(fp.footprint, fp.id)}>
                <Copy className="h-3 w-3 mr-2" /> Copiar footprint puro
              </DropdownMenuItem>
              {fp.query_publicwww && (
                <DropdownMenuItem onClick={() => onCopy(fp.query_publicwww)}>
                  <Copy className="h-3 w-3 mr-2" /> Copiar query PublicWWW
                </DropdownMenuItem>
              )}
              {fp.query_publicwww && (
                <DropdownMenuItem onClick={() => onOpenPublicWWW(fp.query_publicwww || fp.footprint)}>
                  <ExternalLink className="h-3 w-3 mr-2" /> Abrir no PublicWWW
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Copy className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
        </div>
      </TooltipTrigger>
      <TooltipContent side="left" className="max-w-xs">
        <div className="space-y-1">
          <p className="font-medium text-xs">{fp.nome}</p>
          <code className="text-[10px] block break-all">{fp.footprint}</code>
          {fp.plataforma && <p className="text-[10px]">📦 {fp.plataforma}</p>}
          {fp.regiao && <p className="text-[10px]">🌍 {fp.regiao}</p>}
          {fp.notas && <p className="text-[10px] text-muted-foreground">{fp.notas}</p>}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
