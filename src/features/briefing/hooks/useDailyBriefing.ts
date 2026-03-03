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

export interface BriefingMetrics {
  totalRadar: number;
  totalRadarChange: number | null;
  spikes7d: number;
  pendingImports: number;
  creativesStale: number;
  newOffersSinceYesterday: number;
}

export interface BriefingSpikeAlert {
  id: string;
  spied_offer_id: string;
  offer_name: string;
  domain: string;
  change_percent: number;
  previous_visits: number;
  current_visits: number;
  detected_at: string;
}

export function useBriefingMetrics() {
  return useQuery({
    queryKey: ["briefing-metrics"],
    queryFn: async (): Promise<BriefingMetrics> => {
      const workspaceId = await getWorkspaceId();
      if (!workspaceId) {
        return { totalRadar: 0, totalRadarChange: null, spikes7d: 0, pendingImports: 0, creativesStale: 0, newOffersSinceYesterday: 0 };
      }

      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const seventyTwoHoursAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000).toISOString();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

      const [radarRes, spikesRes, importsRes, creativesRes, newOffersRes] = await Promise.all([
        supabase
          .from("spied_offers")
          .select("id", { count: "exact", head: true })
          .eq("workspace_id", workspaceId),
        supabase
          .from("spike_alerts")
          .select("id", { count: "exact", head: true })
          .eq("workspace_id", workspaceId)
          .gte("created_at", sevenDaysAgo),
        supabase
          .from("import_batches")
          .select("id", { count: "exact", head: true })
          .eq("workspace_id", workspaceId)
          .eq("status", "pending"),
        supabase
          .from("ad_creatives")
          .select("id", { count: "exact", head: true })
          .eq("workspace_id", workspaceId)
          .eq("status", "testing")
          .lte("test_started_at", seventyTwoHoursAgo),
        supabase
          .from("spied_offers")
          .select("id", { count: "exact", head: true })
          .eq("workspace_id", workspaceId)
          .gte("created_at", yesterday),
      ]);

      return {
        totalRadar: radarRes.count ?? 0,
        totalRadarChange: null,
        spikes7d: spikesRes.count ?? 0,
        pendingImports: importsRes.count ?? 0,
        creativesStale: creativesRes.count ?? 0,
        newOffersSinceYesterday: newOffersRes.count ?? 0,
      };
    },
    staleTime: 5 * 60_000,
    retry: 1,
  });
}

export function useBriefingSpikeAlerts(limit = 3) {
  return useQuery({
    queryKey: ["briefing-spike-alerts", limit],
    queryFn: async (): Promise<BriefingSpikeAlert[]> => {
      const workspaceId = await getWorkspaceId();
      if (!workspaceId) return [];

      const { data: alerts, error } = await supabase
        .from("spike_alerts")
        .select("id, spied_offer_id, domain, change_percent, previous_visits, current_visits, detected_at")
        .eq("workspace_id", workspaceId)
        .eq("is_dismissed", false)
        .order("change_percent", { ascending: false })
        .limit(limit);

      if (error) {
        if (error.code === "PGRST202") return [];
        throw new Error(error.message);
      }
      if (!alerts || alerts.length === 0) return [];

      // Fetch offer names for the spike alerts
      const offerIds = [...new Set(alerts.map((a) => a.spied_offer_id))];
      const { data: offers } = await supabase
        .from("spied_offers")
        .select("id, nome")
        .in("id", offerIds);

      const offerMap = new Map(offers?.map((o) => [o.id, o.nome]) ?? []);

      return alerts.map((alert) => ({
        id: alert.id,
        spied_offer_id: alert.spied_offer_id,
        offer_name: offerMap.get(alert.spied_offer_id) ?? "Oferta desconhecida",
        domain: alert.domain,
        change_percent: alert.change_percent ?? 0,
        previous_visits: alert.previous_visits ?? 0,
        current_visits: alert.current_visits ?? 0,
        detected_at: alert.detected_at ?? "",
      }));
    },
    staleTime: 5 * 60_000,
    retry: 1,
  });
}
