import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PipelineViewStatus {
  view_name: string;
  last_refreshed: string | null;
  row_count: number;
}

export interface PipelineRefreshResult {
  view_name: string;
  refreshed_at: string;
  duration_ms: number;
}

export function usePipelineStatus() {
  return useQuery({
    queryKey: ["pipeline-status"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_pipeline_status");
      if (error) throw error;
      return (data ?? []) as PipelineViewStatus[];
    },
    staleTime: 60_000,
    refetchInterval: 5 * 60_000, // Auto-refetch every 5 min
  });
}

export function useRefreshPipeline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("refresh_pipeline");
      if (error) throw error;
      return (data ?? []) as PipelineRefreshResult[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipeline-status"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["spied-offers"] });
    },
  });
}
