import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
