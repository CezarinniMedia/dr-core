import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ImportJob {
  id: string;
  tipo: string;
  status: string | null;
  arquivo_nome: string | null;
  total_linhas: number | null;
  linhas_processadas: number | null;
  linhas_importadas: number | null;
  linhas_erro: number | null;
  linhas_ignoradas: number | null;
  ofertas_criadas: number | null;
  ofertas_atualizadas: number | null;
  ofertas_novas_criadas: number | null;
  ofertas_existentes_atualizadas: number | null;
  dominios_novos: number | null;
  erro_mensagem: string | null;
  erro_msg: string | null;
  config: Record<string, unknown> | null;
  contexto: Record<string, unknown> | null;
  created_at: string | null;
  completed_at: string | null;
  workspace_id: string | null;
}

export function useImportHistory(limit = 50) {
  return useQuery({
    queryKey: ["import-history", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("import_batches")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as ImportJob[];
    },
    staleTime: 30_000,
  });
}

export function useCreateImportJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (job: {
      tipo: string;
      arquivo_nome?: string;
      total_linhas?: number;
      config?: Record<string, unknown>;
      contexto?: Record<string, unknown>;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: member } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", user?.id ?? "")
        .single();

      const { data, error } = await supabase
        .from("import_batches")
        .insert({
          tipo: job.tipo,
          status: "processing",
          arquivo_nome: job.arquivo_nome ?? null,
          total_linhas: job.total_linhas ?? null,
          config: job.config ? (job.config as any) : null,
          contexto: job.contexto ? (job.contexto as any) : null,
          workspace_id: member?.workspace_id ?? null,
        })
        .select("id")
        .single();
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["import-history"] });
    },
  });
}

export function useUpdateImportJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: string;
      status?: string;
      linhas_processadas?: number;
      linhas_importadas?: number;
      linhas_erro?: number;
      linhas_ignoradas?: number;
      ofertas_criadas?: number;
      ofertas_atualizadas?: number;
      ofertas_novas_criadas?: number;
      ofertas_existentes_atualizadas?: number;
      dominios_novos?: number;
      erro_mensagem?: string;
      completed_at?: string;
    }) => {
      const { id, ...updates } = params;
      const payload: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(updates)) {
        if (val !== undefined) payload[key] = val;
      }
      const { error } = await supabase
        .from("import_batches")
        .update(payload)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["import-history"] });
    },
  });
}
