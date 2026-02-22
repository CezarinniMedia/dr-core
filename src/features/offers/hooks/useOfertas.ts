import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { analytics } from "@/shared/lib/analytics";
import { useToast } from "@/shared/hooks/use-toast";
import { slugify } from "@/shared/lib/utils";

export interface Oferta {
  id: string;
  workspace_id: string;
  nome: string;
  slug: string;
  vertical: string | null;
  mercado: string | null;
  nicho: string | null;
  status: string;
  prioridade: number | null;
  ticket_front: number | null;
  aov_target: number | null;
  cpa_target: number | null;
  roas_target: number | null;
  promessa_principal: string | null;
  mecanismo_unico: string | null;
  dominio_principal: string | null;
  checkout_provider: string | null;
  vsl_player: string | null;
  plataforma_quiz: string | null;
  tem_cloaker: boolean | null;
  tem_quiz: boolean | null;
  data_lancamento: string | null;
  tags: string[] | null;
  urls_sites: string[] | null;
  fb_pages: string[] | null;
  trafego_atual: number | null;
  trafego_tendencia: string | null;
  notas: string | null;
  created_at: string;
  updated_at: string;
}

export type OfertaInsert = Partial<Omit<Oferta, "id" | "workspace_id" | "created_at" | "updated_at">> & { nome: string };

const OFERTA_STATUSES = ["RESEARCH", "TEST", "ATIVA", "PAUSE", "MORTA"] as const;
export type OfertaStatus = (typeof OFERTA_STATUSES)[number];

export function useOfertas(status?: string) {
  return useQuery({
    queryKey: ["ofertas", status],
    queryFn: async () => {
      let query = (supabase as any)
        .from("ofertas")
        .select("*")
        .order("created_at", { ascending: false });

      if (status) query = query.eq("status", status);

      const { data, error } = await query;
      if (error) throw error;
      return data as Oferta[];
    },
  });
}

export function useOferta(id: string | undefined) {
  return useQuery({
    queryKey: ["oferta", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("ofertas")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data as Oferta | null;
    },
  });
}

async function getUserWorkspaceId(): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { data, error } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (error || !data) throw new Error("Workspace não encontrado");
  return data.workspace_id;
}

export function useCreateOferta() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (oferta: Partial<OfertaInsert> & { nome: string }) => {
      const workspaceId = await getUserWorkspaceId();
      const slug = oferta.slug || slugify(oferta.nome);

      const { data, error } = await (supabase as any)
        .from("ofertas")
        .insert({
          ...oferta,
          slug,
          workspace_id: workspaceId,
        })
        .select()
        .single();

      if (error) throw error;
      analytics.track({ event: "OFERTA_CREATED", workspaceId });
      return data as Oferta;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ofertas"] });
      toast({ title: "Oferta criada com sucesso!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao criar oferta", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateOferta() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data: updates }: { id: string; data: Partial<OfertaInsert> }) => {
      const { data, error } = await (supabase as any)
        .from("ofertas")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Oferta;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["ofertas"] });
      queryClient.invalidateQueries({ queryKey: ["oferta", variables.id] });
      toast({ title: "Oferta atualizada!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteOferta() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("ofertas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ofertas"] });
      toast({ title: "Oferta deletada!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao deletar", description: error.message, variant: "destructive" });
    },
  });
}
