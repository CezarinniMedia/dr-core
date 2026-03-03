import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/shared/hooks/use-toast";

export interface DecisionMetrics {
  ctr: number | null;
  cpa: number | null;
  roas: number | null;
}

export interface Benchmarks {
  ctr_min: number;
  cpa_max: number;
  roas_min: number;
}

export const DEFAULT_BENCHMARKS: Benchmarks = {
  ctr_min: 1.5,
  cpa_max: 25,
  roas_min: 2.5,
};

export type DecisionVerdict = "WINNER" | "KILLED";

export type Recommendation = "WINNER" | "KILL" | "MIXED";

export function calculateRecommendation(
  metrics: DecisionMetrics,
  benchmarks: Benchmarks = DEFAULT_BENCHMARKS
): Recommendation {
  const ctrPass = metrics.ctr !== null && metrics.ctr >= benchmarks.ctr_min;
  const cpaPass = metrics.cpa !== null && metrics.cpa <= benchmarks.cpa_max;
  const roasPass = metrics.roas !== null && metrics.roas >= benchmarks.roas_min;

  const allFilled = metrics.ctr !== null && metrics.cpa !== null && metrics.roas !== null;
  if (!allFilled) return "MIXED";

  if (ctrPass && cpaPass && roasPass) return "WINNER";
  if (!ctrPass && !cpaPass && !roasPass) return "KILL";
  return "MIXED";
}

export function getMetricStatus(
  metric: "ctr" | "cpa" | "roas",
  value: number | null,
  benchmarks: Benchmarks = DEFAULT_BENCHMARKS
): "pass" | "fail" | "empty" {
  if (value === null) return "empty";
  switch (metric) {
    case "ctr":
      return value >= benchmarks.ctr_min ? "pass" : "fail";
    case "cpa":
      return value <= benchmarks.cpa_max ? "pass" : "fail";
    case "roas":
      return value >= benchmarks.roas_min ? "pass" : "fail";
  }
}

interface DecisionPayload {
  id: string;
  verdict: DecisionVerdict;
  metrics: DecisionMetrics;
  notes: string;
}

export function useCreativeDecision() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async ({ id, verdict, metrics, notes }: DecisionPayload) => {
      const status = verdict === "WINNER" ? "WINNER" : "KILLED";

      const { data, error } = await supabase
        .from("criativos")
        .update({
          status,
          decision_metrics: metrics as any,
          decision_notes: notes || null,
          decided_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["criativos"] });

      if (variables.verdict === "WINNER") {
        toast({
          title: "Criativo WINNER!",
          description: `Promovido para escalar. ROAS: ${variables.metrics.roas}x`,
        });
      } else {
        toast({
          title: "Criativo killed",
          description: "Learning salvo.",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erro na decisao",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    submitDecision: mutation.mutate,
    submitDecisionAsync: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
  };
}

export function useUndoKill() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("criativos")
        .update({
          status: "TEST",
          decision_metrics: null,
          decision_notes: null,
          decided_at: null,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["criativos"] });
      toast({ title: "Kill desfeito", description: "Criativo retornou para teste." });
    },
  });
}
