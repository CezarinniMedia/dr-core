import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

// ===== TYPES =====

export interface FonteCaptura {
  metodo: string;
  footprint_usado?: string;
  keyword_usada?: string;
  query_usada?: string;
  footprint_categoria?: string;
  notas?: string;
}

export interface DominioExtra {
  dominio: string;
  tipo: string; // PRINCIPAL, VARIACAO, CLOAKER, PRELAND
}

export interface BibliotecaAnuncio {
  plataforma: string;
  pagina_nome?: string;
  pagina_url?: string;
  biblioteca_url?: string;
  total_anuncios?: number;
}

export interface FunilPagina {
  url: string;
  tipo_pagina: string; // VSL, CHECKOUT, UPSELL, PRELAND, QUIZ, OBRIGADO
  nome?: string;
  preco?: number;
  produto_nome?: string;
  ordem: number;
}

export interface QuickAddDraft {
  // Essencial
  dominio_principal: string;
  nome: string;
  status_spy: string;
  prioridade: string;
  // Tráfego
  trafego_atual?: number;
  trafego_data?: string;
  trafego_fonte?: string;
  trafego_tendencia?: number;
  // Fonte
  fontes: FonteCaptura[];
  // Domínios extras
  dominios_extras: DominioExtra[];
  // Bibliotecas
  bibliotecas: BibliotecaAnuncio[];
  // Funil
  funil_paginas: FunilPagina[];
  // Notas
  notas_spy: string;
  tags: string[];
  // Meta
  nicho?: string;
  checkout_provider?: string;
  vsl_player?: string;
  tem_quiz?: boolean;
  ticket_front?: number;
}

const DRAFT_KEY = 'quick-add-draft';
const DRAFT_TIMESTAMP_KEY = 'quick-add-draft-ts';

const EMPTY_DRAFT: QuickAddDraft = {
  dominio_principal: '',
  nome: '',
  status_spy: 'RADAR',
  prioridade: 'MEDIA',
  fontes: [],
  dominios_extras: [],
  bibliotecas: [],
  funil_paginas: [],
  notas_spy: '',
  tags: [],
};

export function cleanDomain(input: string): string {
  let d = input.trim().toLowerCase();
  d = d.replace(/^https?:\/\//, '');
  d = d.replace(/^www\./, '');
  d = d.replace(/\/.*$/, '');
  return d;
}

function nameFromDomain(domain: string): string {
  const parts = domain.split('.');
  if (parts.length > 1) parts.pop(); // remove TLD
  return parts
    .join(' ')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function useQuickAdd() {
  const [draft, setDraft] = useState<QuickAddDraft>(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as QuickAddDraft;
        setDraft(parsed);
      }
    } catch { /* ignore */ }
  }, []);

  // Auto-save draft every 5s
  useEffect(() => {
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      const hasContent = draft.dominio_principal || draft.nome;
      if (hasContent) {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        localStorage.setItem(DRAFT_TIMESTAMP_KEY, new Date().toISOString());
      }
    }, 5000);
    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    };
  }, [draft]);

  const hasDraft = useCallback(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (!saved) return false;
      const parsed = JSON.parse(saved) as QuickAddDraft;
      return !!(parsed.dominio_principal || parsed.nome);
    } catch { return false; }
  }, []);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY);
    localStorage.removeItem(DRAFT_TIMESTAMP_KEY);
    setDraft({ ...EMPTY_DRAFT });
    setDuplicateWarning(null);
  }, []);

  const updateDraft = useCallback((partial: Partial<QuickAddDraft>) => {
    setDraft((prev) => ({ ...prev, ...partial }));
  }, []);

  // Check duplicate domain
  const checkDuplicate = useCallback(async (domain: string) => {
    if (!domain) { setDuplicateWarning(null); return; }
    const cleaned = cleanDomain(domain);
    if (!cleaned) { setDuplicateWarning(null); return; }

    const { data } = await supabase
      .from('ofertas')
      .select('id, nome, dominio_principal')
      .eq('dominio_principal', cleaned)
      .limit(1)
      .maybeSingle();

    if (data) {
      setDuplicateWarning(`Já existe: "${data.nome}" (${data.dominio_principal})`);
    } else {
      // Also check oferta_dominios
      const { data: domData } = await supabase
        .from('oferta_dominios')
        .select('oferta_id, dominio')
        .eq('dominio', cleaned)
        .limit(1)
        .maybeSingle();

      if (domData) {
        setDuplicateWarning(`Domínio encontrado em outra oferta`);
      } else {
        setDuplicateWarning(null);
      }
    }
  }, []);

  // Auto-suggest name from domain
  const setDomainAndSuggestName = useCallback((rawDomain: string) => {
    const cleaned = cleanDomain(rawDomain);
    const updates: Partial<QuickAddDraft> = { dominio_principal: cleaned };
    if (!draft.nome && cleaned) {
      updates.nome = nameFromDomain(cleaned);
    }
    updateDraft(updates);
    checkDuplicate(cleaned);
  }, [draft.nome, updateDraft, checkDuplicate]);

  // Get workspace id
  const getWorkspaceId = async (): Promise<string> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');
    const { data, error } = await supabase
      .from('workspace_members')
      .select('workspace_id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();
    if (error || !data) throw new Error('Workspace não encontrado');
    return data.workspace_id;
  };

  // Save everything
  const save = useCallback(async (): Promise<{ ofertaId: string } | null> => {
    if (!draft.dominio_principal && !draft.nome) {
      toast({ title: 'Preencha ao menos o domínio ou nome', variant: 'destructive' });
      return null;
    }

    setSaving(true);
    try {
      const workspaceId = await getWorkspaceId();
      const slug = (draft.dominio_principal || draft.nome)
        .replace(/[^a-z0-9]/gi, '-').toLowerCase();

      // 1. Create oferta
      const { data: oferta, error: ofertaErr } = await supabase
        .from('ofertas')
        .insert({
          workspace_id: workspaceId,
          nome: draft.nome || nameFromDomain(draft.dominio_principal),
          slug,
          dominio_principal: draft.dominio_principal || null,
          status_spy: draft.status_spy,
          prioridade: draft.prioridade,
          trafego_atual: draft.trafego_atual || null,
          trafego_tendencia: draft.trafego_tendencia || null,
          trafego_atualizado_em: draft.trafego_data ? new Date(draft.trafego_data).toISOString() : null,
          notas_spy: draft.notas_spy || null,
          nicho: draft.nicho || null,
          checkout_provider: draft.checkout_provider || null,
          vsl_player: draft.vsl_player || null,
          tem_quiz: draft.tem_quiz || false,
          ticket_front: draft.ticket_front || null,
          tags: draft.tags.length > 0 ? draft.tags : [],
          escalada: draft.bibliotecas.length > 1,
        } as any)
        .select('id')
        .single();

      if (ofertaErr) throw ofertaErr;
      const ofertaId = oferta.id;

      // Parallel batch inserts
      const promises: PromiseLike<any>[] = [];

      // 2. Domínios (principal + extras)
      const allDominios: any[] = [];
      if (draft.dominio_principal) {
        allDominios.push({
          workspace_id: workspaceId,
          oferta_id: ofertaId,
          dominio: draft.dominio_principal,
          tipo: 'PRINCIPAL',
          is_principal: true,
        });
      }
      draft.dominios_extras.forEach((d) => {
        if (d.dominio) {
          allDominios.push({
            workspace_id: workspaceId,
            oferta_id: ofertaId,
            dominio: cleanDomain(d.dominio),
            tipo: d.tipo || 'VARIACAO',
            is_principal: false,
          });
        }
      });
      if (allDominios.length > 0) {
        promises.push(supabase.from('oferta_dominios').insert(allDominios).select());
      }

      // 3. Fontes de captura
      if (draft.fontes.length > 0) {
        const fontesData = draft.fontes.map((f) => ({
          workspace_id: workspaceId,
          oferta_id: ofertaId,
          metodo: f.metodo,
          footprint_usado: f.footprint_usado || null,
          footprint_categoria: f.footprint_categoria || null,
          keyword_usada: f.keyword_usada || null,
          query_usada: f.query_usada || null,
          notas: f.notas || null,
        }));
        promises.push(supabase.from('fontes_captura').insert(fontesData).select());
      }

      // 4. Bibliotecas de anúncios
      if (draft.bibliotecas.length > 0) {
        const biblioData = draft.bibliotecas.map((b) => ({
          workspace_id: workspaceId,
          oferta_id: ofertaId,
          plataforma: b.plataforma,
          pagina_nome: b.pagina_nome || null,
          pagina_url: b.pagina_url || null,
          biblioteca_url: b.biblioteca_url || null,
          total_anuncios: b.total_anuncios || null,
        }));
        promises.push(supabase.from('ad_bibliotecas').insert(biblioData).select());
      }

      // 5. Funil páginas
      if (draft.funil_paginas.length > 0) {
        const funilData = draft.funil_paginas.map((p, i) => ({
          workspace_id: workspaceId,
          oferta_id: ofertaId,
          url: p.url || null,
          tipo_pagina: p.tipo_pagina,
          nome: p.nome || null,
          preco: p.preco || null,
          produto_nome: p.produto_nome || null,
          ordem: p.ordem || i + 1,
        }));
        promises.push(supabase.from('funil_paginas').insert(funilData).select());
      }

      // 6. Tráfego histórico
      if (draft.trafego_atual && draft.trafego_data) {
        promises.push(
          supabase.from('trafego_historico').insert({
            workspace_id: workspaceId,
            oferta_id: ofertaId,
            dominio: draft.dominio_principal,
            periodo_tipo: 'MENSAL',
            periodo_data: draft.trafego_data,
            visitas: draft.trafego_atual,
            fonte_dados: draft.trafego_fonte || 'manual',
          }).select()
        );
      }

      await Promise.all(promises);

      // Success
      queryClient.invalidateQueries({ queryKey: ['ofertas'] });
      clearDraft();
      toast({ title: '✅ Oferta adicionada ao Radar!' });
      return { ofertaId };
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' });
      return null;
    } finally {
      setSaving(false);
    }
  }, [draft, queryClient, toast, clearDraft]);

  return {
    draft,
    updateDraft,
    setDomainAndSuggestName,
    save,
    saving,
    clearDraft,
    hasDraft,
    duplicateWarning,
  };
}
