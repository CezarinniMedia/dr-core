import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Plus, X, ChevronDown, ChevronRight, CheckCircle2, Globe, BarChart3, Search,
  Library, Link2, StickyNote, Zap, Trash2, GripVertical, AlertTriangle,
} from 'lucide-react';
import { useQuickAdd, cleanDomain, type FonteCaptura, type DominioExtra, type BibliotecaAnuncio, type FunilPagina } from '@/hooks/useQuickAdd';
import { useArsenalFootprints, useArsenalKeywords } from '@/hooks/useArsenal';
import { useNavigate } from 'react-router-dom';

// ===== CONSTANTS =====

const METODOS_FONTE = [
  { value: 'PUBLICWWW', label: 'PublicWWW (footprint)' },
  { value: 'FB_ADS_LIBRARY', label: 'FB Ads Library' },
  { value: 'GOOGLE_DORKS', label: 'Google Dorks' },
  { value: 'TIKTOK_LIBRARY', label: 'TikTok Library' },
  { value: 'VSL_TECH', label: 'VSL Tech detection' },
  { value: 'RECLAME_AQUI', label: 'Reclame Aqui' },
  { value: 'PIXEL_VULN', label: 'Pixel/tracking vulnerability' },
  { value: 'SEMRUSH', label: 'Semrush discovery' },
  { value: 'OSINT', label: 'OSINT (WHOIS, reverse IP...)' },
  { value: 'MANUAL', label: 'Manual/Comunidade' },
];

const TIPO_DOMINIO = ['VARIACAO', 'CLOAKER', 'PRELAND', 'REDIRECT', 'TRACKING'];
const PLATAFORMAS_ADS = ['Facebook', 'TikTok', 'Google', 'YouTube', 'Taboola', 'Outbrain'];
const TIPOS_PAGINA = ['VSL', 'CHECKOUT', 'UPSELL', 'DOWNSELL', 'PRELAND', 'QUIZ', 'OBRIGADO', 'SQUEEZE', 'ARTIGO'];
const NICHOS = [
  'Emagrecimento', 'Diabetes', 'Dor', 'Próstata', 'Visão', 'Audição',
  'Cabelo', 'Pele/Anti-aging', 'Energia/Libido', 'Ansiedade/Sono',
  'Renda Extra', 'Relacionamento', 'Manifestação', 'Pet', 'Outro',
];

// ===== SECTION WRAPPER =====

function Section({
  title, icon: Icon, count, children, defaultOpen = false,
}: {
  title: string; icon: any; count?: number; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const hasContent = (count ?? 0) > 0;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full py-2 px-3 rounded-md hover:bg-muted/50 transition-colors text-sm font-medium">
        {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="flex-1 text-left">{title}</span>
        {hasContent && <CheckCircle2 className="h-4 w-4 text-green-500" />}
        {count !== undefined && count > 0 && (
          <Badge variant="secondary" className="text-xs h-5 px-1.5">{count}</Badge>
        )}
      </CollapsibleTrigger>
      <CollapsibleContent className="px-3 pb-3 space-y-3">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

// ===== DYNAMIC FONTE FIELD =====

function FonteFields({ fonte, onChange, onRemove, footprints, keywords }: {
  fonte: FonteCaptura;
  onChange: (f: FonteCaptura) => void;
  onRemove: () => void;
  footprints: any[];
  keywords: any[];
}) {
  return (
    <div className="border border-border rounded-md p-3 space-y-2 bg-muted/20">
      <div className="flex items-center gap-2">
        <Select value={fonte.metodo} onValueChange={(v) => onChange({ ...fonte, metodo: v })}>
          <SelectTrigger className="flex-1 h-8 text-xs">
            <SelectValue placeholder="Método..." />
          </SelectTrigger>
          <SelectContent>
            {METODOS_FONTE.map((m) => (
              <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={onRemove}>
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </Button>
      </div>

      {/* Dynamic field based on method */}
      {fonte.metodo === 'PUBLICWWW' && (
        <div>
          <Label className="text-xs">Footprint usado</Label>
          <Input
            value={fonte.footprint_usado || ''}
            onChange={(e) => onChange({ ...fonte, footprint_usado: e.target.value })}
            placeholder="Ex: vturb.com.br/player"
            className="h-8 text-xs"
            list="footprint-list"
          />
          <datalist id="footprint-list">
            {footprints.map((fp: any) => (
              <option key={fp.id} value={fp.footprint}>{fp.nome}</option>
            ))}
          </datalist>
        </div>
      )}
      {fonte.metodo === 'FB_ADS_LIBRARY' && (
        <div>
          <Label className="text-xs">Keyword usada</Label>
          <Input
            value={fonte.keyword_usada || ''}
            onChange={(e) => onChange({ ...fonte, keyword_usada: e.target.value })}
            placeholder="Ex: emagrecer rápido"
            className="h-8 text-xs"
            list="keyword-list"
          />
          <datalist id="keyword-list">
            {keywords.map((kw: any) => (
              <option key={kw.id} value={kw.keyword} />
            ))}
          </datalist>
        </div>
      )}
      {fonte.metodo === 'GOOGLE_DORKS' && (
        <div>
          <Label className="text-xs">Dork usado</Label>
          <Input
            value={fonte.query_usada || ''}
            onChange={(e) => onChange({ ...fonte, query_usada: e.target.value })}
            placeholder='Ex: inurl:checkout site:kiwify.com.br'
            className="h-8 text-xs"
          />
        </div>
      )}
      {fonte.metodo === 'RECLAME_AQUI' && (
        <div>
          <Label className="text-xs">Termo de busca</Label>
          <Input
            value={fonte.query_usada || ''}
            onChange={(e) => onChange({ ...fonte, query_usada: e.target.value })}
            placeholder="Ex: produto não entregue"
            className="h-8 text-xs"
          />
        </div>
      )}
      {fonte.metodo === 'VSL_TECH' && (
        <div>
          <Label className="text-xs">Player detectado</Label>
          <Select value={fonte.footprint_usado || ''} onValueChange={(v) => onChange({ ...fonte, footprint_usado: v })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Selecione..." /></SelectTrigger>
            <SelectContent>
              {['Vturb', 'Panda Video', 'Wistia', 'YouTube', 'Vimeo', 'ConverteAI', 'Custom'].map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      {(fonte.metodo === 'TIKTOK_LIBRARY' || fonte.metodo === 'SEMRUSH' || fonte.metodo === 'OSINT' || fonte.metodo === 'PIXEL_VULN' || fonte.metodo === 'MANUAL') && (
        <div>
          <Label className="text-xs">Notas</Label>
          <Input
            value={fonte.notas || ''}
            onChange={(e) => onChange({ ...fonte, notas: e.target.value })}
            placeholder="Detalhes da descoberta..."
            className="h-8 text-xs"
          />
        </div>
      )}
    </div>
  );
}

// ===== MAIN COMPONENT =====

interface QuickAddOfertaProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickAddOferta({ open, onOpenChange }: QuickAddOfertaProps) {
  const {
    draft, updateDraft, setDomainAndSuggestName, save, saving, clearDraft, duplicateWarning,
  } = useQuickAdd();
  const navigate = useNavigate();
  const { data: footprints } = useArsenalFootprints();
  const { data: keywords } = useArsenalKeywords();
  const [tagInput, setTagInput] = useState('');

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'N') {
        e.preventDefault();
        onOpenChange(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onOpenChange]);

  const handleSave = async (addAnother: boolean) => {
    const result = await save();
    if (result) {
      if (addAnother) {
        // form is already cleared by save()
      } else {
        onOpenChange(false);
        navigate(`/spy/${result.ofertaId}`);
      }
    }
  };

  // Fonte helpers
  const addFonte = () => updateDraft({ fontes: [...draft.fontes, { metodo: 'PUBLICWWW' }] });
  const updateFonte = (i: number, f: FonteCaptura) => {
    const next = [...draft.fontes];
    next[i] = f;
    updateDraft({ fontes: next });
  };
  const removeFonte = (i: number) => updateDraft({ fontes: draft.fontes.filter((_, idx) => idx !== i) });

  // Domínio helpers
  const addDominio = () => updateDraft({ dominios_extras: [...draft.dominios_extras, { dominio: '', tipo: 'VARIACAO' }] });
  const updateDominio = (i: number, d: DominioExtra) => {
    const next = [...draft.dominios_extras];
    next[i] = d;
    updateDraft({ dominios_extras: next });
  };
  const removeDominio = (i: number) => updateDraft({ dominios_extras: draft.dominios_extras.filter((_, idx) => idx !== i) });

  // Biblioteca helpers
  const addBiblioteca = () => updateDraft({ bibliotecas: [...draft.bibliotecas, { plataforma: 'Facebook' }] });
  const updateBiblioteca = (i: number, b: BibliotecaAnuncio) => {
    const next = [...draft.bibliotecas];
    next[i] = b;
    updateDraft({ bibliotecas: next });
  };
  const removeBiblioteca = (i: number) => updateDraft({ bibliotecas: draft.bibliotecas.filter((_, idx) => idx !== i) });

  // Funil helpers
  const addPagina = () => updateDraft({
    funil_paginas: [...draft.funil_paginas, { url: '', tipo_pagina: 'VSL', ordem: draft.funil_paginas.length + 1 }],
  });
  const updatePagina = (i: number, p: FunilPagina) => {
    const next = [...draft.funil_paginas];
    next[i] = p;
    updateDraft({ funil_paginas: next });
  };
  const removePagina = (i: number) => updateDraft({ funil_paginas: draft.funil_paginas.filter((_, idx) => idx !== i) });

  // Tags
  const addTag = () => {
    const t = tagInput.trim();
    if (t && !draft.tags.includes(t)) {
      updateDraft({ tags: [...draft.tags, t] });
    }
    setTagInput('');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[440px] sm:max-w-[480px] p-0 flex flex-col" side="right">
        <SheetHeader className="px-4 pt-4 pb-2 border-b border-border">
          <SheetTitle className="flex items-center gap-2 text-base">
            <Zap className="h-5 w-5 text-accent" />
            Quick Add — Espionagem Rápida
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-1">
            {/* ===== A) ESSENCIAL — always visible ===== */}
            <div className="space-y-3 pb-3 border-b border-border">
              <div>
                <Label className="text-xs font-medium">Domínio Principal *</Label>
                <Input
                  value={draft.dominio_principal}
                  onChange={(e) => setDomainAndSuggestName(e.target.value)}
                  placeholder="diabetesfreedom.com"
                  className="h-9"
                  autoFocus
                />
                {duplicateWarning && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-amber-500">
                    <AlertTriangle className="h-3 w-3" />
                    {duplicateWarning}
                  </div>
                )}
              </div>

              <div>
                <Label className="text-xs font-medium">Nome da Oferta</Label>
                <Input
                  value={draft.nome}
                  onChange={(e) => updateDraft({ nome: e.target.value })}
                  placeholder="Auto-sugerido do domínio"
                  className="h-9"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs font-medium">Status</Label>
                  <Select value={draft.status_spy} onValueChange={(v) => updateDraft({ status_spy: v })}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RADAR">🔍 Radar</SelectItem>
                      <SelectItem value="TRIAGEM">⚡ Triagem</SelectItem>
                      <SelectItem value="DEEP_DIVE">🎯 Deep Dive</SelectItem>
                      <SelectItem value="MONITORANDO">👁️ Monitorando</SelectItem>
                      <SelectItem value="PRODUCAO">🚀 Produção</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-medium">Prioridade</Label>
                  <Select value={draft.prioridade} onValueChange={(v) => updateDraft({ prioridade: v })}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="URGENTE">🔴 Urgente</SelectItem>
                      <SelectItem value="ALTA">🟠 Alta</SelectItem>
                      <SelectItem value="MEDIA">🟡 Média</SelectItem>
                      <SelectItem value="BAIXA">🟢 Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-xs font-medium">Nicho</Label>
                <Select value={draft.nicho || ''} onValueChange={(v) => updateDraft({ nicho: v })}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {NICHOS.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* ===== B) TRÁFEGO ===== */}
            <Section title="Tráfego" icon={BarChart3} count={draft.trafego_atual ? 1 : 0}>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Visitas 30d</Label>
                  <Input
                    type="number"
                    value={draft.trafego_atual || ''}
                    onChange={(e) => updateDraft({ trafego_atual: e.target.valueAsNumber || undefined })}
                    placeholder="50000"
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Data do dado</Label>
                  <Input
                    type="date"
                    value={draft.trafego_data || ''}
                    onChange={(e) => updateDraft({ trafego_data: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Fonte</Label>
                  <Select value={draft.trafego_fonte || ''} onValueChange={(v) => updateDraft({ trafego_fonte: v })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Fonte..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="semrush_csv">Semrush</SelectItem>
                      <SelectItem value="similarweb">SimilarWeb</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Tendência %</Label>
                  <Input
                    type="number"
                    value={draft.trafego_tendencia ?? ''}
                    onChange={(e) => updateDraft({ trafego_tendencia: e.target.valueAsNumber || undefined })}
                    placeholder="+15"
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </Section>

            {/* ===== C) FONTE DE CAPTURA ===== */}
            <Section title="Fonte de Captura" icon={Search} count={draft.fontes.length}>
              {draft.fontes.map((f, i) => (
                <FonteFields
                  key={i}
                  fonte={f}
                  onChange={(updated) => updateFonte(i, updated)}
                  onRemove={() => removeFonte(i)}
                  footprints={(footprints as any[]) || []}
                  keywords={(keywords as any[]) || []}
                />
              ))}
              <Button variant="outline" size="sm" className="w-full h-8 text-xs" onClick={addFonte}>
                <Plus className="h-3 w-3 mr-1" /> Adicionar Fonte
              </Button>
            </Section>

            {/* ===== D) DOMÍNIOS EXTRAS ===== */}
            <Section title="Domínios Extras" icon={Globe} count={draft.dominios_extras.length}>
              {draft.dominios_extras.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={d.dominio}
                    onChange={(e) => updateDominio(i, { ...d, dominio: cleanDomain(e.target.value) })}
                    placeholder="dominio.com"
                    className="h-8 text-xs flex-1"
                  />
                  <Select value={d.tipo} onValueChange={(v) => updateDominio(i, { ...d, tipo: v })}>
                    <SelectTrigger className="h-8 text-xs w-28"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TIPO_DOMINIO.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => removeDominio(i)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full h-8 text-xs" onClick={addDominio}>
                <Plus className="h-3 w-3 mr-1" /> Domínio
              </Button>
            </Section>

            {/* ===== E) BIBLIOTECAS DE ANÚNCIOS ===== */}
            <Section title="Bibliotecas de Anúncios" icon={Library} count={draft.bibliotecas.length}>
              {draft.bibliotecas.map((b, i) => (
                <div key={i} className="border border-border rounded-md p-2 space-y-2 bg-muted/20">
                  <div className="flex items-center gap-2">
                    <Select value={b.plataforma} onValueChange={(v) => updateBiblioteca(i, { ...b, plataforma: v })}>
                      <SelectTrigger className="h-8 text-xs flex-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PLATAFORMAS_ADS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      value={b.total_anuncios || ''}
                      onChange={(e) => updateBiblioteca(i, { ...b, total_anuncios: e.target.valueAsNumber || undefined })}
                      placeholder="Ads"
                      className="h-8 text-xs w-20"
                    />
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => removeBiblioteca(i)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                  <Input
                    value={b.pagina_nome || ''}
                    onChange={(e) => updateBiblioteca(i, { ...b, pagina_nome: e.target.value })}
                    placeholder="Nome da página"
                    className="h-8 text-xs"
                  />
                  <Input
                    value={b.biblioteca_url || ''}
                    onChange={(e) => updateBiblioteca(i, { ...b, biblioteca_url: e.target.value })}
                    placeholder="URL da biblioteca"
                    className="h-8 text-xs"
                  />
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full h-8 text-xs" onClick={addBiblioteca}>
                <Plus className="h-3 w-3 mr-1" /> Biblioteca
              </Button>
              {draft.bibliotecas.length > 1 && (
                <Badge variant="secondary" className="text-xs">🔥 Escalada detectada ({draft.bibliotecas.length} bibliotecas)</Badge>
              )}
            </Section>

            {/* ===== F) URLS DO FUNIL ===== */}
            <Section title="URLs do Funil" icon={Link2} count={draft.funil_paginas.length}>
              {draft.funil_paginas.map((p, i) => (
                <div key={i} className="border border-border rounded-md p-2 space-y-2 bg-muted/20">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                    <Select value={p.tipo_pagina} onValueChange={(v) => updatePagina(i, { ...p, tipo_pagina: v })}>
                      <SelectTrigger className="h-8 text-xs w-28"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {TIPOS_PAGINA.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {(p.tipo_pagina === 'CHECKOUT' || p.tipo_pagina === 'UPSELL' || p.tipo_pagina === 'DOWNSELL') && (
                      <Input
                        type="number"
                        value={p.preco || ''}
                        onChange={(e) => updatePagina(i, { ...p, preco: e.target.valueAsNumber || undefined })}
                        placeholder="R$"
                        className="h-8 text-xs w-20"
                      />
                    )}
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => removePagina(i)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                  <Input
                    value={p.url}
                    onChange={(e) => updatePagina(i, { ...p, url: e.target.value })}
                    placeholder="https://..."
                    className="h-8 text-xs"
                  />
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full h-8 text-xs" onClick={addPagina}>
                <Plus className="h-3 w-3 mr-1" /> Página do Funil
              </Button>
            </Section>

            {/* ===== G) NOTAS RÁPIDAS ===== */}
            <Section title="Notas & Tags" icon={StickyNote} count={draft.notas_spy ? 1 : 0}>
              <Textarea
                value={draft.notas_spy}
                onChange={(e) => updateDraft({ notas_spy: e.target.value })}
                placeholder="Observações rápidas sobre essa oferta..."
                rows={3}
                className="text-xs"
              />
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                    placeholder="Adicionar tag..."
                    className="h-8 text-xs flex-1"
                  />
                  <Button variant="outline" size="sm" className="h-8 text-xs" onClick={addTag}>
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                {draft.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {draft.tags.map((t) => (
                      <Badge key={t} variant="secondary" className="text-xs cursor-pointer" onClick={() => updateDraft({ tags: draft.tags.filter((x) => x !== t) })}>
                        {t} <X className="h-2.5 w-2.5 ml-1" />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </Section>
          </div>
        </ScrollArea>

        {/* ===== FOOTER ===== */}
        <div className="border-t border-border p-4 space-y-2">
          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={() => handleSave(false)}
              disabled={saving}
            >
              {saving ? 'Salvando...' : '⚡ Salvar e Ver'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleSave(true)}
              disabled={saving}
            >
              <Plus className="h-4 w-4 mr-1" /> Outro
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground" onClick={clearDraft}>
            Limpar formulário
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
