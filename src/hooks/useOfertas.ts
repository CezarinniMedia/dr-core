import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { analytics } from "@/lib/analytics";
import { useToast } from "@/hooks/use-toast";
import { slugify } from "@/lib/utils";

export interface Oferta {
  id: string;
  workspace_id: string;
  nome: string;
  slug: string;
  vertical: string | null;
  mercado: string | null;
  status: string;
  ticket_front: number | null;
  aov_target: number | null;
  cpa_target: number | null;
  roas_target: number | null;
  promessa_principal: string | null;
  mecanismo_unico: string | null;
  data_lancamento: string | null;
  created_at: string;
  updated_at: string;
}

export type OfertaInsert = Omit<Oferta, "id" | "workspace_id" | "created_at" | "updated_at">;

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

// ===== SPY HOOKS =====

export function useOfertasSpy(filters?: {
  status_spy?: string;
  nicho?: string;
  prioridade?: string;
  minTrafego?: number;
}) {
  return useQuery({
    queryKey: ['ofertas', 'spy', filters],
    queryFn: async () => {
      let query = (supabase as any)
        .from('ofertas')
        .select(`
          *,
          oferta_dominios(count),
          fontes_captura(count),
          ad_bibliotecas(count)
        `)
        .neq('status_spy', 'ARQUIVADA')
        .order('updated_at', { ascending: false });

      if (filters?.status_spy) query = query.eq('status_spy', filters.status_spy);
      if (filters?.nicho) query = query.eq('nicho', filters.nicho);
      if (filters?.prioridade) query = query.eq('prioridade', filters.prioridade);
      if (filters?.minTrafego) query = query.gte('trafego_atual', filters.minTrafego);

      const { data, error } = await query;
      if (error) throw error;

      return (data as any[])?.map(o => ({
        ...o,
        _count_dominios: o.oferta_dominios?.[0]?.count || 0,
        _count_fontes: o.fontes_captura?.[0]?.count || 0,
        _count_bibliotecas: o.ad_bibliotecas?.[0]?.count || 0,
      }));
    },
  });
}

export function useOfertaSpyDetail(id: string) {
  return useQuery({
    queryKey: ['oferta', 'spy-detail', id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('ofertas')
        .select(`
          *,
          oferta_dominios(*),
          trafego_historico(*),
          fontes_captura(*),
          ad_bibliotecas(*),
          funil_paginas(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}
