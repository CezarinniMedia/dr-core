import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/shared/hooks/use-toast";
import { analytics } from "@/shared/lib/analytics";
import { logger } from "@/shared/lib/logger";

export function useAvatares(ofertaId?: string) {
  return useQuery({
    queryKey: ["avatares", ofertaId],
    queryFn: async () => {
      let query = supabase
        .from("avatares")
        .select("*, ofertas(nome, vertical)")
        .order("created_at", { ascending: false });

      if (ofertaId) query = query.eq("oferta_id", ofertaId);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useAvatar(id: string) {
  return useQuery({
    queryKey: ["avatar", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("avatares")
        .select("*, ofertas(nome, vertical)")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });
}

export function useCreateAvatar() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (avatar: {
      oferta_id: string;
      nome: string;
      estado_atual?: string;
      estado_desejado?: string;
      pain_matrix?: Array<{ nivel: number; dor: string }>;
      desire_matrix?: Array<{ nivel: number; desejo: string }>;
      objecoes?: Array<{ objecao: string; tipo: string }>;
      gatilhos_emocionais?: string[];
      linguagem_avatar?: string;
      demographics?: string;
      notas?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: member } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", user?.id)
        .limit(1)
        .single();

      const { data, error } = await supabase
        .from("avatares")
        .insert({
          ...avatar,
          workspace_id: member?.workspace_id,
          versao: 1,
        })
        .select()
        .single();

      if (error) throw error;
      analytics.track({ event: "AVATAR_CREATED_MANUAL", workspaceId: member?.workspace_id });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["avatares"] });
      toast({ title: "Avatar criado com sucesso!" });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao criar avatar", description: error.message, variant: "destructive" });
    },
  });
}

export function useExtractAvatar() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      ofertaId,
      ofertaNome,
      vertical,
      researchNotes,
    }: {
      ofertaId: string;
      ofertaNome: string;
      vertical: string;
      researchNotes: string[];
    }) => {
      const { data, error } = await supabase.functions.invoke("extract-avatar", {
        body: { ofertaId, ofertaNome, vertical, researchNotes },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Extraction failed");

      logger.info("Avatar extracted successfully", { avatarId: data.avatar.id });

      const { data: member } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
        .limit(1)
        .single();

      analytics.track({
        event: "AVATAR_EXTRACTED",
        workspaceId: member?.workspace_id,
        properties: { ofertaId, avatarId: data.avatar.id },
      });

      return data.avatar;
    },
    onSuccess: (avatar) => {
      queryClient.invalidateQueries({ queryKey: ["avatares"] });
      toast({
        title: "Avatar extraído!",
        description: `Avatar "${avatar.nome}" criado com sucesso.`,
      });
    },
    onError: (error: any) => {
      logger.error("Avatar extraction failed", error);
      toast({
        title: "Erro na extração",
        description: error.message || "Falha ao extrair avatar.",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateAvatar() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const { data: result, error } = await supabase
        .from("avatares")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["avatares"] });
      queryClient.invalidateQueries({ queryKey: ["avatar", variables.id] });
      toast({ title: "Avatar atualizado!" });
    },
    onError: (error: any) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteAvatar() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("avatares").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["avatares"] });
      toast({ title: "Avatar deletado!" });
    },
  });
}

// Research Notes hooks
export function useResearchNotes(ofertaId: string) {
  return useQuery({
    queryKey: ["research-notes", ofertaId],
    enabled: !!ofertaId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("research_notes")
        .select("*")
        .eq("oferta_id", ofertaId)
        .order("relevance_score", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useCreateResearchNote() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (note: {
      oferta_id: string;
      tipo?: string;
      source_url?: string;
      content: string;
      insights?: string[];
      tags?: string[];
      relevance_score?: number;
    }) => {
      const { data: member } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
        .limit(1)
        .single();

      const { data, error } = await supabase
        .from("research_notes")
        .insert({ ...note, workspace_id: member?.workspace_id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["research-notes"] });
      toast({ title: "Research note salva!" });
    },
    onError: (error: any) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteResearchNote() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("research_notes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["research-notes"] });
      toast({ title: "Note deletada!" });
    },
  });
}
