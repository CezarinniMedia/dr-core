import { useDetectSpikes } from "./useDashboardMetrics";

// Realtime subscription + toast moved to useSpikeNotifications (global, in AppHeader).
// This hook now only provides the detect_spikes RPC query for the Dashboard.

export function useSpikeAlerts(threshold = 100, lookbackDays = 90) {
  return useDetectSpikes(threshold, lookbackDays);
}
