import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

async function getWorkspaceId() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: member } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();
  return member?.workspace_id ?? null;
}

export interface DashboardMetrics {
  total_active_offers: number;
  hot_offers: number;
  scaling_offers: number;
  analyzing_offers: number;
  radar_offers: number;
  cloned_offers: number;
  total_offers_all: number;
  total_domains: number;
  total_traffic_points: number;
  spikes_last_30d: number;
  unread_spikes: number;
  last_offer_updated: string;
  refreshed_at: string;
}

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: async (): Promise<DashboardMetrics | null> => {
      const workspaceId = await getWorkspaceId();
      if (!workspaceId) return null;

      const { data, error } = await supabase.rpc("get_dashboard_metrics", {
        p_workspace_id: workspaceId,
      });

      // Graceful fallback if RPC not available
      if (error) {
        if (error.code === 'PGRST202') return null;
        throw new Error(error.message);
      }
      if (!data || data.length === 0) return null;
      return data[0] as DashboardMetrics;
    },
    staleTime: 5 * 60_000,
    retry: 1,
  });
}

// H2 fix: filter activity_log by workspace_id (defense-in-depth, not only RLS)
export function useDashboardActivity(limit = 10) {
  return useQuery({
    queryKey: ["dashboard-activity", limit],
    queryFn: async () => {
      const workspaceId = await getWorkspaceId();
      if (!workspaceId) return [];

      const { data, error } = await supabase
        .from("activity_log")
        .select("id, action, entity_type, entity_id, metadata, created_at")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw new Error(error.message);
      return data ?? [];
    },
    staleTime: 2 * 60_000,
    retry: 1,
  });
}

export function useDetectSpikes(threshold = 100, lookbackDays = 90) {
  return useQuery({
    queryKey: ["detect-spikes", threshold, lookbackDays],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("detect_spikes", {
        p_threshold: threshold,
        p_lookback_days: lookbackDays,
      });

      if (error) {
        if (error.code === 'PGRST202') return [];
        throw new Error(error.message);
      }
      return data ?? [];
    },
    staleTime: 5 * 60_000,
    retry: 1,
  });
}
