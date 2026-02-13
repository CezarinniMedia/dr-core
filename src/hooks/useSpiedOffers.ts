import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// ============================================
// SPIED OFFERS (Main entity)
// ============================================

export function useSpiedOffers(filters?: {
  status?: string;
  vertical?: string;
  discovery_source?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['spied-offers', filters],
    queryFn: async () => {
      let query = supabase
        .from('spied_offers')
        .select(`
          *,
          offer_domains(count),
          offer_ad_libraries(count),
          offer_funnel_steps(count),
          ad_creatives(count)
        `)
        .order('updated_at', { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.vertical) {
        query = query.eq('vertical', filters.vertical);
      }
      if (filters?.discovery_source) {
        query = query.eq('discovery_source', filters.discovery_source);
      }
      if (filters?.search) {
        query = query.or(
          `nome.ilike.%${filters.search}%,main_domain.ilike.%${filters.search}%,product_name.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

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
          offer_traffic_data(*),
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

      const { data, error } = await supabase
        .from('spied_offers')
        .insert({ ...offer, workspace_id: member?.workspace_id } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spied-offers'] });
      toast({ title: '✅ Oferta adicionada ao radar!' });
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

// ============================================
// OFFER DOMAINS
// ============================================

export function useOfferDomains(offerId: string) {
  return useQuery({
    queryKey: ['offer-domains', offerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('offer_domains')
        .select('*')
        .eq('spied_offer_id', offerId)
        .order('is_main', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!offerId,
  });
}

export function useCreateOfferDomain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (domain: Record<string, unknown>) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: member } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', user?.id ?? '')
        .single();

      const { data, error } = await supabase
        .from('offer_domains')
        .insert({ ...domain, workspace_id: member?.workspace_id } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['offer-domains', data.spied_offer_id] });
      queryClient.invalidateQueries({ queryKey: ['spied-offer', data.spied_offer_id] });
    },
  });
}

export function useDeleteOfferDomain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, offerId }: { id: string; offerId: string }) => {
      const { error } = await supabase.from('offer_domains').delete().eq('id', id);
      if (error) throw error;
      return offerId;
    },
    onSuccess: (offerId) => {
      queryClient.invalidateQueries({ queryKey: ['offer-domains', offerId] });
      queryClient.invalidateQueries({ queryKey: ['spied-offer', offerId] });
    },
  });
}

// ============================================
// AD LIBRARIES
// ============================================

export function useOfferAdLibraries(offerId: string) {
  return useQuery({
    queryKey: ['offer-ad-libraries', offerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('offer_ad_libraries')
        .select('*')
        .eq('spied_offer_id', offerId)
        .order('ad_count', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!offerId,
  });
}

export function useCreateOfferAdLibrary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (library: Record<string, unknown>) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: member } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', user?.id ?? '')
        .single();

      const { data, error } = await supabase
        .from('offer_ad_libraries')
        .insert({ ...library, workspace_id: member?.workspace_id } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['offer-ad-libraries', data.spied_offer_id] });
      queryClient.invalidateQueries({ queryKey: ['spied-offer', data.spied_offer_id] });
    },
  });
}

export function useDeleteOfferAdLibrary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, offerId }: { id: string; offerId: string }) => {
      const { error } = await supabase.from('offer_ad_libraries').delete().eq('id', id);
      if (error) throw error;
      return offerId;
    },
    onSuccess: (offerId) => {
      queryClient.invalidateQueries({ queryKey: ['offer-ad-libraries', offerId] });
      queryClient.invalidateQueries({ queryKey: ['spied-offer', offerId] });
    },
  });
}

// ============================================
// FUNNEL STEPS
// ============================================

export function useOfferFunnelSteps(offerId: string) {
  return useQuery({
    queryKey: ['offer-funnel-steps', offerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('offer_funnel_steps')
        .select('*')
        .eq('spied_offer_id', offerId)
        .order('step_order', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!offerId,
  });
}

export function useCreateFunnelStep() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (step: Record<string, unknown>) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: member } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', user?.id ?? '')
        .single();

      const { data, error } = await supabase
        .from('offer_funnel_steps')
        .insert({ ...step, workspace_id: member?.workspace_id } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['offer-funnel-steps', data.spied_offer_id] });
      queryClient.invalidateQueries({ queryKey: ['spied-offer', data.spied_offer_id] });
    },
  });
}

export function useUpdateFunnelStep() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const { data: result, error } = await supabase
        .from('offer_funnel_steps')
        .update(data as any)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['offer-funnel-steps', data.spied_offer_id] });
    },
  });
}

export function useDeleteFunnelStep() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, offerId }: { id: string; offerId: string }) => {
      const { error } = await supabase.from('offer_funnel_steps').delete().eq('id', id);
      if (error) throw error;
      return offerId;
    },
    onSuccess: (offerId) => {
      queryClient.invalidateQueries({ queryKey: ['offer-funnel-steps', offerId] });
      queryClient.invalidateQueries({ queryKey: ['spied-offer', offerId] });
    },
  });
}

// ============================================
// TRAFFIC DATA
// ============================================

export function useOfferTrafficData(offerId: string, domain?: string) {
  return useQuery({
    queryKey: ['offer-traffic', offerId, domain],
    queryFn: async () => {
      let query = supabase
        .from('offer_traffic_data')
        .select('*')
        .eq('spied_offer_id', offerId)
        .order('period_date', { ascending: true });

      if (domain) {
        query = query.eq('domain', domain);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!offerId,
  });
}

export function useBulkInsertTrafficData() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ offerId, records }: { offerId: string; records: Record<string, unknown>[] }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: member } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', user?.id ?? '')
        .single();

      const enrichedRecords = records.map(r => ({
        ...r,
        spied_offer_id: offerId,
        workspace_id: member?.workspace_id,
        source: 'semrush_csv',
      }));

      const { data, error } = await supabase
        .from('offer_traffic_data')
        .upsert(enrichedRecords as any[], {
          onConflict: 'spied_offer_id,domain,period_type,period_date',
        })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['offer-traffic', variables.offerId] });
      toast({ title: `✅ ${data?.length ?? 0} registros de tráfego importados!` });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro na importação', description: error.message, variant: 'destructive' });
    },
  });
}

// ============================================
// UPDATE HOOKS (for inline editing)
// ============================================

export function useUpdateOfferDomain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, offerId, data }: { id: string; offerId: string; data: Record<string, unknown> }) => {
      const { data: result, error } = await supabase
        .from('offer_domains')
        .update(data as any)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return { result, offerId };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['offer-domains', variables.offerId] });
      queryClient.invalidateQueries({ queryKey: ['spied-offer', variables.offerId] });
    },
  });
}

export function useUpdateOfferAdLibrary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, offerId, data }: { id: string; offerId: string; data: Record<string, unknown> }) => {
      const { data: result, error } = await supabase
        .from('offer_ad_libraries')
        .update(data as any)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return { result, offerId };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['offer-ad-libraries', variables.offerId] });
      queryClient.invalidateQueries({ queryKey: ['spied-offer', variables.offerId] });
    },
  });
}

export function useUpdateTrafficData() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, offerId, data }: { id: string; offerId: string; data: Record<string, unknown> }) => {
      const { data: result, error } = await supabase
        .from('offer_traffic_data')
        .update(data as any)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return { result, offerId };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['offer-traffic', variables.offerId] });
    },
  });
}

export function useDeleteTrafficData() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, offerId }: { id: string; offerId: string }) => {
      const { error } = await supabase.from('offer_traffic_data').delete().eq('id', id);
      if (error) throw error;
      return offerId;
    },
    onSuccess: (offerId) => {
      queryClient.invalidateQueries({ queryKey: ['offer-traffic', offerId] });
    },
  });
}
