import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { useToast } from '@/shared/hooks/use-toast';

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

      const { data, error } = await supabase.rpc('bulk_upsert_traffic_data', {
        p_records: enrichedRecords as unknown as Json,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['offer-traffic', variables.offerId] });
      toast({ title: `${data ?? 0} registros de trafego importados!` });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro na importacao', description: error.message, variant: 'destructive' });
    },
  });
}

// Returns Map<spied_offer_id, latest_visits> for the selected traffic provider
// Tries RPC first (DISTINCT ON in DB), falls back to direct query if RPC unavailable
// Filters by source field (more reliable than period_type — historical records may have wrong period_type)
export function useLatestTrafficPerOffer(provider: 'similarweb' | 'semrush') {
  return useQuery({
    queryKey: ['latest-traffic-per-offer', provider],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: member } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', user?.id ?? '')
        .single();

      if (!member?.workspace_id) throw new Error('Workspace not found');

      // Try RPC first (optimal: DISTINCT ON server-side)
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_latest_traffic_per_offer', {
        p_workspace_id: member.workspace_id,
        p_source: provider,
      });

      if (!rpcError && rpcData) {
        const map = new Map<string, number>();
        for (const record of rpcData) {
          map.set(record.spied_offer_id, record.visits ?? 0);
        }
        return map;
      }

      // Fallback: paginated direct query with client-side dedup (when RPC not in PostgREST cache)
      // PostgREST default limit is 1000 rows — must paginate to cover all 87k+ traffic records
      console.warn('[useLatestTrafficPerOffer] RPC unavailable, using fallback query:', rpcError?.message);

      const PAGE_SIZE = 1000;
      const PARALLEL = 5;

      const buildQuery = () => {
        const q = supabase
          .from('offer_traffic_data')
          .select('spied_offer_id, visits, period_date')
          .order('period_date', { ascending: false });
        return provider === 'similarweb' ? q.eq('source', 'similarweb') : q.neq('source', 'similarweb');
      };

      // First page + count
      const { data: first, error: firstErr, count } = await supabase
        .from('offer_traffic_data')
        .select('spied_offer_id, visits, period_date', { count: 'exact' })
        .order('period_date', { ascending: false })
        [provider === 'similarweb' ? 'eq' : 'neq']('source', 'similarweb')
        .range(0, PAGE_SIZE - 1);

      if (firstErr) throw firstErr;

      const map = new Map<string, number>();
      for (const row of first || []) {
        if (row.spied_offer_id && !map.has(row.spied_offer_id)) {
          map.set(row.spied_offer_id, row.visits ?? 0);
        }
      }

      // Fetch remaining pages if needed
      if (first && first.length >= PAGE_SIZE && count && count > PAGE_SIZE) {
        const totalPages = Math.ceil(count / PAGE_SIZE);
        for (let batch = 1; batch < totalPages; batch += PARALLEL) {
          const promises = [];
          for (let p = batch; p < Math.min(batch + PARALLEL, totalPages); p++) {
            const from = p * PAGE_SIZE;
            promises.push(buildQuery().range(from, from + PAGE_SIZE - 1));
          }
          const results = await Promise.all(promises);
          for (const { data, error } of results) {
            if (error) throw error;
            for (const row of data || []) {
              if (row.spied_offer_id && !map.has(row.spied_offer_id)) {
                map.set(row.spied_offer_id, row.visits ?? 0);
              }
            }
          }
        }
      }

      return map;
    },
    staleTime: 5 * 60_000, // 5min — data doesn't change every minute
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

// ============================================
// MATERIALIZED VIEW: Traffic Summary (Phase 3)
// Pre-calculado via mv_traffic_summary → backward-compat view mv_offer_traffic_summary
// Refresh automatico a cada 6h via pg_cron
// ============================================

export type OfferTrafficSummary = {
  spied_offer_id: string;
  domain_count: number;
  total_visits: number;
  latest_period: string | null;
  earliest_period: string | null;
  latest_sw_visits: number | null;
  latest_sr_visits: number | null;
  avg_monthly_visits: number | null;
};

export function useOfferTrafficSummary(offerId: string) {
  return useQuery({
    queryKey: ['offer-traffic-summary', offerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mv_offer_traffic_summary')
        .select('spied_offer_id, domain_count, total_visits, latest_period, earliest_period, latest_sw_visits, latest_sr_visits, avg_monthly_visits')
        .eq('spied_offer_id', offerId)
        .maybeSingle<OfferTrafficSummary>();

      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!offerId,
    staleTime: 6 * 60 * 60_000, // 6h — alinhado com refresh da mv_traffic_summary (Phase 3)
  });
}
