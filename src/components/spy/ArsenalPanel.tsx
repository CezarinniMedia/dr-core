import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Search, Copy, ExternalLink, Crosshair, Key, Terminal } from 'lucide-react';
import { useArsenalFootprints, useArsenalKeywords, useArsenalDorks } from '@/hooks/useArsenal';
import { useToast } from '@/hooks/use-toast';

const EFICACIA_COLORS: Record<string, string> = {
  ALTA: 'text-green-400 bg-green-400/10',
  MEDIA: 'text-yellow-400 bg-yellow-400/10',
  BAIXA: 'text-gray-400 bg-gray-400/10',
};

const CATEGORIA_COLORS: Record<string, string> = {
  CHECKOUT: 'bg-blue-500/20 text-blue-300',
  VSL_TECH: 'bg-purple-500/20 text-purple-300',
  PIXEL_TRACKING: 'bg-green-500/20 text-green-300',
  QUIZ: 'bg-orange-500/20 text-orange-300',
  ANALYTICS: 'bg-cyan-500/20 text-cyan-300',
  LANDING_PAGE: 'bg-pink-500/20 text-pink-300',
  VULNERABILITY: 'bg-red-500/20 text-red-300',
};

export function ArsenalPanel() {
  const [searchQuery, setSearchQuery] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const { toast } = useToast();

  const { data: footprints } = useArsenalFootprints(catFilter || undefined);
  const { data: keywords } = useArsenalKeywords();
  const { data: dorks } = useArsenalDorks();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: '📋 Copiado!', duration: 1500 });
  };

  const openPublicWWW = (query: string) => {
    window.open(`https://publicwww.com/websites/${encodeURIComponent(query)}/`, '_blank');
  };

  const filteredFootprints = (footprints || []).filter((fp: any) =>
    !searchQuery ||
    fp.nome?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    fp.footprint?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    fp.plataforma?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar footprints, keywords, dorks..."
          className="pl-9"
        />
      </div>

      <Tabs defaultValue="footprints">
        <TabsList className="w-full">
          <TabsTrigger value="footprints" className="flex-1">
            <Crosshair className="h-3 w-3 mr-1" /> Footprints ({filteredFootprints.length})
          </TabsTrigger>
          <TabsTrigger value="keywords" className="flex-1">
            <Key className="h-3 w-3 mr-1" /> Keywords ({(keywords as any[])?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="dorks" className="flex-1">
            <Terminal className="h-3 w-3 mr-1" /> Dorks ({(dorks as any[])?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* ===== FOOTPRINTS TAB ===== */}
        <TabsContent value="footprints" className="space-y-3">
          {/* Filtros por categoria */}
          <div className="flex flex-wrap gap-1">
            <Badge
              variant={catFilter === '' ? 'default' : 'outline'}
              className="cursor-pointer text-xs"
              onClick={() => setCatFilter('')}
            >
              Todos
            </Badge>
            {Object.entries(CATEGORIA_COLORS).map(([cat, color]) => (
              <Badge
                key={cat}
                variant="outline"
                className={`cursor-pointer text-xs ${catFilter === cat ? color : ''}`}
                onClick={() => setCatFilter(catFilter === cat ? '' : cat)}
              >
                {cat.replace('_', ' ')}
              </Badge>
            ))}
          </div>

          {/* Footprint Cards */}
          <div className="space-y-2">
            {filteredFootprints.map((fp: any) => (
              <Card key={fp.id} className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{fp.nome}</span>
                      <Badge variant="outline" className={`text-xs ${CATEGORIA_COLORS[fp.categoria] || ''}`}>
                        {fp.categoria}
                      </Badge>
                      <Badge variant="outline" className={`text-xs ${EFICACIA_COLORS[fp.eficacia] || ''}`}>
                        {fp.eficacia === 'ALTA' ? '🔥' : fp.eficacia === 'MEDIA' ? '⚡' : '💤'} {fp.eficacia}
                      </Badge>
                    </div>

                    <code className="text-xs text-muted-foreground block truncate">
                      {fp.footprint}
                    </code>

                    {fp.query_publicwww && (
                      <p className="text-xs text-muted-foreground truncate">
                        Query: {fp.query_publicwww}
                      </p>
                    )}

                    <div className="flex gap-2 text-xs text-muted-foreground">
                      {fp.plataforma && <span>📦 {fp.plataforma}</span>}
                      {fp.regiao && <span>🌍 {fp.regiao}</span>}
                      {fp.vezes_usado > 0 && <span>📊 Usado {fp.vezes_usado}x</span>}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => copyToClipboard(fp.query_publicwww || fp.footprint)}
                      title="Copiar"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => openPublicWWW(fp.query_publicwww || fp.footprint)}
                      title="Abrir no PublicWWW"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            {filteredFootprints.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">Nenhum footprint encontrado</p>
            )}
          </div>
        </TabsContent>

        {/* ===== KEYWORDS TAB ===== */}
        <TabsContent value="keywords" className="space-y-2">
          {((keywords as any[]) || [])
            .filter((kw: any) => !searchQuery || kw.keyword?.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((kw: any) => (
              <Card key={kw.id} className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-sm">{kw.keyword}</span>
                  <Badge variant="outline" className="text-xs">{kw.tipo}</Badge>
                  {kw.plataforma && <Badge variant="secondary" className="text-xs">{kw.plataforma}</Badge>}
                </div>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => copyToClipboard(kw.keyword)}>
                  <Copy className="h-3 w-3" />
                </Button>
              </Card>
            ))}
        </TabsContent>

        {/* ===== DORKS TAB ===== */}
        <TabsContent value="dorks" className="space-y-2">
          {((dorks as any[]) || [])
            .filter((d: any) => !searchQuery || d.nome?.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((d: any) => (
              <Card key={d.id} className="p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{d.nome}</span>
                  <Badge variant="outline" className="text-xs">{d.tipo}</Badge>
                </div>
                <code className="text-xs text-muted-foreground block">{d.dork_query}</code>
                {d.objetivo && <p className="text-xs text-muted-foreground">{d.objetivo}</p>}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => copyToClipboard(d.dork_query)}>
                    <Copy className="h-3 w-3 mr-1" /> Copiar
                  </Button>
                  {d.url_ferramenta && (
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => window.open(d.url_ferramenta, '_blank')}>
                      <ExternalLink className="h-3 w-3 mr-1" /> Abrir
                    </Button>
                  )}
                </div>
              </Card>
            ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
