import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
      toast({ title: `${data?.length ?? 0} registros de trafego importados!` });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro na importacao', description: error.message, variant: 'destructive' });
    },
  });
}

// Returns Map<spied_offer_id, latest_visits> for the selected traffic provider
// provider="similarweb" -> period_type="monthly_sw" | provider="semrush" -> period_type="monthly"
export function useLatestTrafficPerOffer(provider: 'similarweb' | 'semrush') {
  return useQuery({
    queryKey: ['latest-traffic-per-offer', provider],
    queryFn: async () => {
      const periodType = provider === 'similarweb' ? 'monthly_sw' : 'monthly';
      const { data, error } = await supabase
        .from('offer_traffic_data')
        .select('spied_offer_id, visits, period_date')
        .eq('period_type', periodType)
        .order('period_date', { ascending: false });

      if (error) throw error;

      // Keep the most recent record per offer (data is already ordered by period_date desc)
      const map = new Map<string, number>();
      for (const record of data || []) {
        if (!map.has(record.spied_offer_id)) {
          map.set(record.spied_offer_id, record.visits ?? 0);
        }
      }
      return map;
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

// ============================================
// MATERIALIZED VIEW: Traffic Summary (BD-2.5)
// Pre-calculado via mv_offer_traffic_summary
// Refresh automatico a cada 15min via pg_cron
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
    staleTime: 15 * 60_000, // 15min — alinhado com refresh da materialized view
  });
}
