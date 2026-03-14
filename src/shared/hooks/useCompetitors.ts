import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { analytics } from "@/lib/analytics";

async function getWorkspaceId() {
  const { data: { user } } = await supabase.auth.getUser();
  const { data: member } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user?.id)
    .limit(1)
    .single();
  return member?.workspace_id;
}

export function useCompetitors(status?: string) {
  return useQuery({
    queryKey: ["competitors", status],
    queryFn: async () => {
      let query = supabase
        .from("competitors")
        .select("*, ad_creatives(count)")
        .order("updated_at", { ascending: false });

      if (status) query = query.eq("status_tracking", status);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useCompetitor(id: string) {
  return useQuery({
    queryKey: ["competitor", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("competitors")
        .select("*, ad_creatives(*), funnel_maps(*)")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });
}

export function useCreateCompetitor() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (competitor: {
      nome: string;
      dominio?: string;
      vertical?: string;
      status_tracking?: string;
      traffic_score?: number;
      fb_page_url?: string;
      ig_handle?: string;
      tiktok_handle?: string;
      notas?: string;
      oferta_id?: string;
    }) => {
      const workspaceId = await getWorkspaceId();
      const { data, error } = await supabase
        .from("competitors")
        .insert({ ...competitor, workspace_id: workspaceId })
        .select()
        .single();

      if (error) throw error;
      analytics.track({ event: "COMPETITOR_ADDED", workspaceId });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competitors"] });
      toast({ title: "Competitor adicionado!" });
    },
    onError: (error: any) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateCompetitor() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const { data: result, error } = await supabase
        .from("competitors")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["competitors"] });
      queryClient.invalidateQueries({ queryKey: ["competitor", variables.id] });
      toast({ title: "Competitor atualizado!" });
    },
  });
}

export function useDeleteCompetitor() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("competitors").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competitors"] });
      toast({ title: "Competitor deletado!" });
    },
  });
}

// AD CREATIVES
export function useAdCreatives(competitorId: string) {
  return useQuery({
    queryKey: ["ad-creatives", competitorId],
    enabled: !!competitorId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ad_creatives")
        .select("*")
        .eq("competitor_id", competitorId)
        .order("first_seen", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useCreateAdCreative() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (creative: {
      competitor_id: string;
      tipo: string;
      file_url: string;
      platform: string;
      first_seen: string;
      copy_headline?: string;
      copy_body?: string;
      cta_text?: string;
      thumbnail_url?: string;
      last_seen?: string;
      status?: string;
      tags?: string[];
      angulo?: string;
      likes?: number;
      comments?: number;
      shares?: number;
    }) => {
      const workspaceId = await getWorkspaceId();
      const { data, error } = await supabase
        .from("ad_creatives")
        .insert({ ...creative, workspace_id: workspaceId })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ad-creatives"] });
      toast({ title: "Ad creative salvo!" });
    },
    onError: (error: any) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteAdCreative() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ad_creatives").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ad-creatives"] });
      toast({ title: "Ad deletado!" });
    },
  });
}

// FUNNEL MAPS
export function useFunnelMaps(competitorId: string) {
  return useQuery({
    queryKey: ["funnel-maps", competitorId],
    enabled: !!competitorId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("funnel_maps")
        .select("*")
        .eq("competitor_id", competitorId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useCreateFunnelMap() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (funnelMap: {
      competitor_id: string;
      nome: string;
      steps: unknown[];
      aov_estimate?: number;
      checkout_provider?: string;
      notas?: string;
    }) => {
      const workspaceId = await getWorkspaceId();
      const { data, error } = await supabase
        .from("funnel_maps")
        .insert({ ...funnelMap, workspace_id: workspaceId } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["funnel-maps"] });
      toast({ title: "Funnel map criado!" });
    },
    onError: (error: any) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });
}
