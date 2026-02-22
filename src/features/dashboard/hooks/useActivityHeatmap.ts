import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subMonths, format } from "date-fns";

interface ActivityDay {
  date: string;
  count: number;
}

export function useActivityHeatmap(months = 3) {
  return useQuery({
    queryKey: ["activity-heatmap", months],
    queryFn: async (): Promise<ActivityDay[]> => {
      const since = format(subMonths(new Date(), months), "yyyy-MM-dd");

      const { data, error } = await supabase
        .from("activity_log")
        .select("created_at")
        .gte("created_at", since)
        .order("created_at", { ascending: true });

      if (error) throw new Error(error.message);
      if (!data) return [];

      const countMap = new Map<string, number>();
      for (const row of data) {
        if (!row.created_at) continue;
        const day = row.created_at.substring(0, 10);
        countMap.set(day, (countMap.get(day) ?? 0) + 1);
      }

      return Array.from(countMap.entries()).map(([date, count]) => ({ date, count }));
    },
    staleTime: 5 * 60_000,
    retry: 1,
  });
}
