import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/shared/hooks/use-toast";
import { analytics } from "@/shared/lib/analytics";
import { logger } from "@/shared/lib/logger";

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

export function useCriativos(ofertaId?: string, status?: string) {
  return useQuery({
    queryKey: ["criativos", ofertaId, status],
    queryFn: async () => {
      let query = supabase
        .from("criativos")
        .select("*")
        .order("created_at", { ascending: false });

      if (ofertaId) query = query.eq("oferta_id", ofertaId);
      if (status) query = query.eq("status", status);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateCriativo() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (criativo: {
      oferta_id: string;
      nome: string;
      tipo: string;
      hook_text: string;
      copy_body?: string;
      cta?: string;
      shot_list?: unknown[];
      file_url?: string;
      thumbnail_url?: string;
      plataforma?: string;
      tags?: string[];
      angulo?: string;
    }) => {
      const workspaceId = await getWorkspaceId();
      const { data, error } = await supabase
        .from("criativos")
        .insert({ ...criativo, workspace_id: workspaceId } as any)
        .select()
        .single();

      if (error) throw error;
      analytics.track({ event: "CREATIVE_UPLOADED", workspaceId });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["criativos"] });
      toast({ title: "Criativo criado!" });
    },
    onError: (error: any) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateCriativo() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const { data: result, error } = await supabase
        .from("criativos")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["criativos"] });
      queryClient.invalidateQueries({ queryKey: ["criativo", variables.id] });
    },
  });
}

export function useUpdateCriativoStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from("criativos")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["criativos"] });
    },
  });
}

export function useDeleteCriativo() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("criativos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["criativos"] });
      toast({ title: "Criativo deletado!" });
    },
  });
}

// HOOKS
export function useHooks(ofertaId: string) {
  return useQuery({
    queryKey: ["hooks", ofertaId],
    enabled: !!ofertaId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hooks")
        .select("*")
        .eq("oferta_id", ofertaId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useGenerateHooks() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      ofertaId,
      angulo,
      quantidade,
      avatarContext,
    }: {
      ofertaId: string;
      angulo: string;
      quantidade: number;
      avatarContext: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("generate-hooks", {
        body: { ofertaId, angulo, quantidade, avatarContext },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Generation failed");

      logger.info("Hooks generated", { count: data.hooks.length });
      return data.hooks;
    },
    onSuccess: (hooks) => {
      queryClient.invalidateQueries({ queryKey: ["hooks"] });
      toast({
        title: `${hooks.length} hooks gerados!`,
        description: "Hooks salvos com sucesso.",
      });
    },
    onError: (error: any) => {
      logger.error("Hook generation failed", error);
      toast({ title: "Erro na geração", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateHookStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("hooks").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hooks"] });
    },
  });
}

export function useDeleteHook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("hooks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hooks"] });
    },
  });
}
