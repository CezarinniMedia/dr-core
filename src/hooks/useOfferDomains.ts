import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
