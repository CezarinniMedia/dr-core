import { useQueryClient } from "@tanstack/react-query";
import { useRealtimeSubscription } from "@/shared/hooks/useRealtimeSubscription";
import { useDetectSpikes } from "./useDashboardMetrics";
import { useToast } from "@/shared/hooks/use-toast";

interface SpikeAlertRow extends Record<string, unknown> {
  id: string;
  workspace_id: string;
  offer_id: string;
  domain: string;
  period_date: string;
  previous_visits: number;
  current_visits: number;
  change_percent: number;
  alert_type: string;
  is_read: boolean;
  is_dismissed: boolean;
  detected_at: string;
}

export function useSpikeAlerts(threshold = 100, lookbackDays = 90) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const spikesQuery = useDetectSpikes(threshold, lookbackDays);

  useRealtimeSubscription<SpikeAlertRow>({
    table: "spike_alerts",
    event: "INSERT",
    onInsert: (newAlert) => {
      queryClient.invalidateQueries({ queryKey: ["detect-spikes"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });

      toast({
        title: `Spike detectado: ${newAlert.domain}`,
        description: `+${newAlert.change_percent}% de trafego`,
        variant: "default",
      });
    },
  });

  return spikesQuery;
}
