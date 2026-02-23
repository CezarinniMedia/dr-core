import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/shared/hooks/use-toast';

// ============================================
// Helper: get workspace_id from authenticated user
// ============================================
async function getWorkspaceId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  const { data: member } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user?.id ?? '')
    .single();
  if (!member?.workspace_id) throw new Error('Workspace not found');
  return member.workspace_id;
}

// ============================================
// SPIED OFFERS — Paginated (Primary hook for SpyRadar)
// Uses RPC get_spied_offers_paginated — single DB call for 1 page + counts
// ============================================

export interface PaginatedOffersResult {
  data: PaginatedOffer[];
  totalCount: number;
}

export interface PaginatedOffer {
  id: string;
  nome: string;
  main_domain: string | null;
  status: string | null;
  vertical: string | null;
  subnicho: string | null;
  geo: string | null;
  priority: number | null;
  discovery_source: string | null;
  discovered_at: string | null;
  product_name: string | null;
  product_ticket: number | null;
  product_currency: string | null;
  product_promise: string | null;
  notas: string | null;
  screenshot_url: string | null;
  traffic_trend: string | null;
  estimated_monthly_traffic: number | null;
  estimated_monthly_revenue: number | null;
  operator_name: string | null;
  checkout_provider: string | null;
  vsl_player: string | null;
  discovery_query: string | null;
  created_at: string | null;
  updated_at: string | null;
  domain_count: number;
  ad_library_count: number;
  funnel_step_count: number;
  creative_count: number;
  // Compat with SpiedOffer interface — allow arbitrary fields
  [key: string]: unknown;
}

export function useSpiedOffers(filters?: {
  status?: string;
  statuses?: string[];
  excludeStatuses?: string[];
  vertical?: string;
  discovery_source?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  const page = filters?.page ?? 0;
  const pageSize = filters?.pageSize ?? 50;

  return useQuery({
    queryKey: ['spied-offers', filters],
    queryFn: async (): Promise<PaginatedOffersResult> => {
      const workspaceId = await getWorkspaceId();

      // Build statuses array: single status OR multi-status filter
      let statuses: string[] | null = null;
      if (filters?.statuses && filters.statuses.length > 0) {
        statuses = filters.statuses;
      } else if (filters?.status && filters.status !== 'all') {
        statuses = [filters.status];
      }

      const { data, error } = await supabase.rpc('get_spied_offers_paginated', {
        p_workspace_id: workspaceId,
        p_limit: pageSize,
        p_offset: page * pageSize,
        p_statuses: statuses,
        p_exclude_statuses: filters?.excludeStatuses ?? null,
        p_vertical: filters?.vertical || null,
        p_discovery_source: filters?.discovery_source || null,
        p_search: filters?.search || null,
      });

      if (error) throw error;

      const rows = (data || []) as PaginatedOffer[];
      const totalCount = rows.length > 0 ? Number(rows[0].total_count) : 0;

      return { data: rows, totalCount };
    },
    placeholderData: keepPreviousData,
    staleTime: 2 * 60_000, // 2min
  });
}

// Lazy-load: only loads offer core + domains/libraries/funnel/creatives (NOT traffic data).
// Traffic data is loaded separately in SpyTrafficTab via useOfferTrafficData when tab is opened.
export function useSpiedOffer(id: string) {
  return useQuery({
    queryKey: ['spied-offer', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('spied_offers')
        .select(`
          *,
          offer_domains(*),
          offer_ad_libraries(*),
          offer_funnel_steps(*),
          ad_creatives(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateSpiedOffer() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (offer: Record<string, unknown>) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: member } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', user?.id ?? '')
        .single();

      const workspaceId = member?.workspace_id;

      // Dedup check: if main_domain is provided, check if it already exists
      const domain = typeof offer.main_domain === 'string' ? offer.main_domain.trim().toLowerCase() : null;
      if (domain) {
        const { data: existing } = await supabase
          .from('spied_offers')
          .select('id, nome')
          .eq('workspace_id', workspaceId)
          .ilike('main_domain', domain)
          .limit(1)
          .maybeSingle();

        if (existing) {
          throw new Error(`Domínio "${domain}" já existe no radar: "${existing.nome}"`);
        }
      }

      const { data, error } = await supabase
        .from('spied_offers')
        .insert({ ...offer, workspace_id: workspaceId } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spied-offers'] });
      toast({ title: 'Oferta adicionada ao radar!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateSpiedOffer() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const { data: result, error } = await supabase
        .from('spied_offers')
        .update(data as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['spied-offers'] });
      queryClient.invalidateQueries({ queryKey: ['spied-offer', variables.id] });
      toast({ title: 'Oferta atualizada!' });
    },
  });
}

export function useDeleteSpiedOffer() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('spied_offers').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spied-offers'] });
      toast({ title: 'Oferta removida do radar.' });
    },
  });
}
