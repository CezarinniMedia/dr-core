import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/shared/hooks/use-toast";

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

// ─── DORKS ───────────────────────────────────────────────────

export interface ArsenalDork {
  id: string;
  nome: string | null;
  dork_query: string;
  tipo: string | null;
  ferramenta: string | null;
  objetivo: string | null;
  eficacia: number | null;
  exemplo_resultado: string | null;
  tags: string[] | null;
  notas: string | null;
  is_favorito: boolean | null;
  vezes_usado: number | null;
  ultima_verificacao: string | null;
  workspace_id: string;
  created_at: string;
  updated_at: string;
}

export function useArsenalDorks(search?: string) {
  return useQuery({
    queryKey: ["arsenal-dorks", search],
    queryFn: async () => {
      let query = (supabase as any)
        .from("arsenal_dorks")
        .select("*")
        .order("is_favorito", { ascending: false })
        .order("vezes_usado", { ascending: false })
        .order("created_at", { ascending: false });

      if (search) {
        const sanitized = search.replace(/[%_\\]/g, '\\$&');
        query = query.or(`dork_query.ilike.%${sanitized}%,nome.ilike.%${sanitized}%,objetivo.ilike.%${sanitized}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ArsenalDork[];
    },
  });
}

export function useCreateDork() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (dork: Partial<ArsenalDork> & { dork_query: string }) => {
      const workspaceId = await getWorkspaceId();
      const { data, error } = await (supabase as any)
        .from("arsenal_dorks")
        .insert({ ...dork, workspace_id: workspaceId })
        .select()
        .single();
      if (error) throw error;
      return data as ArsenalDork;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["arsenal-dorks"] });
      toast({ title: "Dork criado!" });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });
}

export function useUpdateDork() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ArsenalDork> }) => {
      const { error } = await (supabase as any)
        .from("arsenal_dorks")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["arsenal-dorks"] }),
  });
}

export function useDeleteDork() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("arsenal_dorks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["arsenal-dorks"] });
      toast({ title: "Dork removido!" });
    },
  });
}

// ─── FOOTPRINTS ──────────────────────────────────────────────

export interface ArsenalFootprint {
  id: string;
  footprint: string;
  nome: string | null;
  categoria: string | null;
  ferramenta: string | null;
  query_publicwww: string | null;
  query_google_dorks: string | null;
  plataforma: string | null;
  regiao: string | null;
  resultados_tipicos: string | null;
  eficacia: number | null;
  combina_com: unknown[] | null;
  tags: string[] | null;
  notas: string | null;
  is_favorito: boolean | null;
  vezes_usado: number | null;
  workspace_id: string;
  created_at: string;
  updated_at: string;
}

export function useArsenalFootprints(search?: string) {
  return useQuery({
    queryKey: ["arsenal-footprints", search],
    queryFn: async () => {
      let query = (supabase as any)
        .from("arsenal_footprints")
        .select("*")
        .order("is_favorito", { ascending: false })
        .order("vezes_usado", { ascending: false })
        .order("created_at", { ascending: false });

      if (search) {
        const sanitized = search.replace(/[%_\\]/g, '\\$&');
        query = query.or(`footprint.ilike.%${sanitized}%,nome.ilike.%${sanitized}%,categoria.ilike.%${sanitized}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ArsenalFootprint[];
    },
  });
}

export function useCreateFootprint() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (fp: Partial<ArsenalFootprint> & { footprint: string }) => {
      const workspaceId = await getWorkspaceId();
      const { data, error } = await (supabase as any)
        .from("arsenal_footprints")
        .insert({ ...fp, workspace_id: workspaceId })
        .select()
        .single();
      if (error) throw error;
      return data as ArsenalFootprint;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["arsenal-footprints"] });
      toast({ title: "Footprint criado!" });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });
}

export function useUpdateFootprint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ArsenalFootprint> }) => {
      const { error } = await (supabase as any)
        .from("arsenal_footprints")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["arsenal-footprints"] }),
  });
}

export function useDeleteFootprint() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("arsenal_footprints").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["arsenal-footprints"] });
      toast({ title: "Footprint removido!" });
    },
  });
}

// ─── KEYWORDS ────────────────────────────────────────────────

export interface ArsenalKeyword {
  id: string;
  keyword: string;
  tipo: string | null;
  plataforma: string | null;
  eficacia: number | null;
  idioma: string | null;
  nichos: string[] | null;
  combinacoes: unknown[] | null;
  tags: string[] | null;
  notas: string | null;
  is_favorito: boolean | null;
  vezes_usado: number | null;
  workspace_id: string;
  created_at: string;
  updated_at: string;
}

export function useArsenalKeywords(search?: string) {
  return useQuery({
    queryKey: ["arsenal-keywords", search],
    queryFn: async () => {
      let query = (supabase as any)
        .from("arsenal_keywords")
        .select("*")
        .order("is_favorito", { ascending: false })
        .order("vezes_usado", { ascending: false })
        .order("created_at", { ascending: false });

      if (search) {
        const sanitized = search.replace(/[%_\\]/g, '\\$&');
        query = query.or(`keyword.ilike.%${sanitized}%,tipo.ilike.%${sanitized}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ArsenalKeyword[];
    },
  });
}

export function useCreateKeyword() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (kw: Partial<ArsenalKeyword> & { keyword: string }) => {
      const workspaceId = await getWorkspaceId();
      const { data, error } = await (supabase as any)
        .from("arsenal_keywords")
        .insert({ ...kw, workspace_id: workspaceId })
        .select()
        .single();
      if (error) throw error;
      return data as ArsenalKeyword;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["arsenal-keywords"] });
      toast({ title: "Keyword criada!" });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });
}

export function useUpdateKeyword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ArsenalKeyword> }) => {
      const { error } = await (supabase as any)
        .from("arsenal_keywords")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["arsenal-keywords"] }),
  });
}

export function useDeleteKeyword() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("arsenal_keywords").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["arsenal-keywords"] });
      toast({ title: "Keyword removida!" });
    },
  });
}

// ─── SHARED: Toggle Favorito + Increment Usage ──────────────

export function useToggleFavorito() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ table, id, current }: { table: "arsenal_dorks" | "arsenal_footprints" | "arsenal_keywords"; id: string; current: boolean }) => {
      const { error } = await (supabase as any)
        .from(table)
        .update({ is_favorito: !current })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["arsenal-dorks"] });
      queryClient.invalidateQueries({ queryKey: ["arsenal-footprints"] });
      queryClient.invalidateQueries({ queryKey: ["arsenal-keywords"] });
    },
  });
}

export function useIncrementUsage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ table, id, current }: { table: "arsenal_dorks" | "arsenal_footprints" | "arsenal_keywords"; id: string; current: number }) => {
      const { error } = await (supabase as any)
        .from(table)
        .update({ vezes_usado: current + 1 })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["arsenal-dorks"] });
      queryClient.invalidateQueries({ queryKey: ["arsenal-footprints"] });
      queryClient.invalidateQueries({ queryKey: ["arsenal-keywords"] });
    },
  });
}
