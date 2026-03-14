import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeSubscription } from "./useRealtimeSubscription";

async function getWorkspaceId(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: member } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();
  return member?.workspace_id ?? null;
}

export interface SpikeNotification {
  id: string;
  spied_offer_id: string;
  domain: string;
  period_date: string;
  previous_visits: number | null;
  current_visits: number | null;
  change_percent: number | null;
  alert_type: string;
  detected_at: string | null;
  created_at: string | null;
  seen_at: string | null;
  offer_name: string;
  main_domain: string | null;
}

interface SpikeAlertInsert extends Record<string, unknown> {
  id: string;
  workspace_id: string;
  spied_offer_id: string;
  domain: string;
  previous_visits: number | null;
  current_visits: number | null;
  change_percent: number | null;
  alert_type: string;
  created_at: string | null;
  seen_at: string | null;
}

export interface NewSpikePayload {
  id: string;
  spied_offer_id: string;
  domain: string;
  previous_visits: number | null;
  current_visits: number | null;
  change_percent: number | null;
  offer_name: string;
}

interface UseSpikeNotificationsOptions {
  onNewSpike?: (spike: NewSpikePayload) => void;
}

export function useSpikeNotifications(
  options: UseSpikeNotificationsOptions = {}
) {
  const { onNewSpike } = options;
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  // Badge count — unseen spikes in last 7 days
  const countQuery = useQuery({
    queryKey: ["spike-notifications-count"],
    queryFn: async () => {
      const workspaceId = await getWorkspaceId();
      if (!workspaceId) return 0;
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const { count, error } = await supabase
        .from("spike_alerts")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", workspaceId)
        .is("seen_at", null)
        .gte("created_at", sevenDaysAgo.toISOString());
      if (error) throw error;
      return count ?? 0;
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  // Dropdown list — recent spikes with offer name (lazy: only when dropdown is open)
  const listQuery = useQuery({
    queryKey: ["spike-notifications-list"],
    queryFn: async () => {
      const workspaceId = await getWorkspaceId();
      if (!workspaceId) return [];
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const { data, error } = await supabase
        .from("spike_alerts")
        .select(
          `
          id, spied_offer_id, domain, period_date,
          previous_visits, current_visits, change_percent,
          alert_type, detected_at, created_at, seen_at,
          spied_offers!spike_alerts_spied_offer_id_fkey (nome, main_domain)
        `
        )
        .eq("workspace_id", workspaceId)
        .gte("created_at", sevenDaysAgo.toISOString())
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []).map((item: any) => ({
        id: item.id,
        spied_offer_id: item.spied_offer_id,
        domain: item.domain,
        period_date: item.period_date,
        previous_visits: item.previous_visits,
        current_visits: item.current_visits,
        change_percent: item.change_percent,
        alert_type: item.alert_type,
        detected_at: item.detected_at,
        created_at: item.created_at,
        seen_at: item.seen_at,
        offer_name: item.spied_offers?.nome ?? item.domain,
        main_domain: item.spied_offers?.main_domain ?? null,
      })) as SpikeNotification[];
    },
    enabled: isOpen,
    staleTime: 15_000,
  });

  // Mark all as seen
  const markAllSeenMutation = useMutation({
    mutationFn: async () => {
      const workspaceId = await getWorkspaceId();
      if (!workspaceId) return;
      const { error } = await supabase
        .from("spike_alerts")
        .update({
          seen_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("workspace_id", workspaceId)
        .is("seen_at", null);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["spike-notifications-count"],
      });
      queryClient.invalidateQueries({
        queryKey: ["spike-notifications-list"],
      });
    },
  });

  // Realtime subscription — new spike alerts
  const handleInsert = useCallback(
    async (newAlert: SpikeAlertInsert) => {
      queryClient.invalidateQueries({
        queryKey: ["spike-notifications-count"],
      });
      queryClient.invalidateQueries({
        queryKey: ["spike-notifications-list"],
      });
      queryClient.invalidateQueries({ queryKey: ["detect-spikes"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });

      if (onNewSpike) {
        // Fetch offer name for toast display
        const { data: offer } = await supabase
          .from("spied_offers")
          .select("nome")
          .eq("id", newAlert.spied_offer_id)
          .single();

        onNewSpike({
          id: newAlert.id,
          spied_offer_id: newAlert.spied_offer_id,
          domain: newAlert.domain,
          previous_visits: newAlert.previous_visits,
          current_visits: newAlert.current_visits,
          change_percent: newAlert.change_percent,
          offer_name: offer?.nome ?? newAlert.domain,
        });
      }
    },
    [queryClient, onNewSpike]
  );

  useRealtimeSubscription<SpikeAlertInsert>({
    table: "spike_alerts",
    event: "INSERT",
    onInsert: handleInsert,
  });

  return {
    unseenCount: countQuery.data ?? 0,
    isLoading: countQuery.isLoading,
    spikes: listQuery.data ?? [],
    isLoadingList: listQuery.isLoading,
    isOpen,
    setIsOpen,
    markAllAsSeen: markAllSeenMutation.mutate,
    isMarkingAsSeen: markAllSeenMutation.isPending,
  };
}
