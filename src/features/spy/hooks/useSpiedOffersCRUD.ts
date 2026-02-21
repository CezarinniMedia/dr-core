import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/shared/hooks/use-toast';

// ============================================
// SPIED OFFERS (Main entity CRUD)
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
      const pageSize = 1000;
      const PARALLEL = 5;

      // Build query helper with filters applied
      const buildQuery = (from: number) => {
        let query = supabase
          .from('spied_offers')
          .select(`
            *,
            offer_domains(count),
            offer_ad_libraries(count),
            offer_funnel_steps(count),
            ad_creatives(count)
          `)
          .order('updated_at', { ascending: false })
          .range(from, from + pageSize - 1);

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
        return query;
      };

      // First page + count
      const buildCountQuery = () => {
        let query = supabase
          .from('spied_offers')
          .select('id', { count: 'exact', head: true });

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
        return query;
      };

      // Get count and first page in parallel
      const [countResult, firstResult] = await Promise.all([
        buildCountQuery(),
        buildQuery(0),
      ]);

      if (firstResult.error) throw firstResult.error;
      if (!firstResult.data || firstResult.data.length === 0) return [];

      const all: any[] = [...firstResult.data];
      const total = countResult.count || 0;

      if (firstResult.data.length < pageSize || total <= pageSize) return all;

      // Fetch remaining pages in parallel
      const totalPages = Math.ceil(total / pageSize);
      for (let batch = 1; batch < totalPages; batch += PARALLEL) {
        const promises = [];
        for (let p = batch; p < Math.min(batch + PARALLEL, totalPages); p++) {
          promises.push(buildQuery(p * pageSize));
        }
        const results = await Promise.all(promises);
        for (const { data, error } of results) {
          if (error) throw error;
          if (data) all.push(...data);
        }
      }

      return all;
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
