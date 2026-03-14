import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export interface SpyViewFilters {
  statusFilter: string[];
  vertical: string;
  source: string;
  search: string;
  trafficDataSource: "similarweb" | "semrush";
  showArchived: boolean;
}

export interface SavedView {
  id: string;
  workspace_id: string;
  name: string;
  module: string;
  filters: SpyViewFilters;
  sort_config: Record<string, unknown>;
  visible_columns: string[];
  is_default: boolean;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

const DEFAULT_FILTERS: SpyViewFilters = {
  statusFilter: [],
  vertical: "",
  source: "",
  search: "",
  trafficDataSource: "similarweb",
  showArchived: false,
};

async function getWorkspaceId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  const { data: member } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user?.id ?? "")
    .single();
  if (!member?.workspace_id) throw new Error("Workspace not found");
  return member.workspace_id;
}

export function useSavedViews(module = "spy") {
  return useQuery({
    queryKey: ["saved-views", module],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("saved_views")
        .select("*")
        .eq("module", module)
        .order("is_pinned", { ascending: false })
        .order("name", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((row) => ({
        ...row,
        filters: (row.filters && typeof row.filters === "object" && !Array.isArray(row.filters))
          ? { ...DEFAULT_FILTERS, ...(row.filters as Record<string, unknown>) } as SpyViewFilters
          : DEFAULT_FILTERS,
        sort_config: (row.sort_config && typeof row.sort_config === "object" && !Array.isArray(row.sort_config))
          ? row.sort_config as Record<string, unknown>
          : {},
        visible_columns: row.visible_columns ?? [],
      })) as SavedView[];
    },
    staleTime: 60_000,
  });
}

export function useCreateSavedView() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      name: string;
      module?: string;
      filters: SpyViewFilters;
      visible_columns: string[];
      is_pinned?: boolean;
    }) => {
      const workspaceId = await getWorkspaceId();
      const { data, error } = await supabase
        .from("saved_views")
        .insert({
          workspace_id: workspaceId,
          name: params.name,
          module: params.module ?? "spy",
          filters: params.filters as unknown as Json,
          visible_columns: params.visible_columns,
          is_pinned: params.is_pinned ?? false,
        })
        .select("id")
        .single();
      if (error) throw error;
      return data.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-views"] });
    },
  });
}

export function useUpdateSavedView() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: string;
      name?: string;
      filters?: SpyViewFilters;
      visible_columns?: string[];
      is_pinned?: boolean;
      is_default?: boolean;
    }) => {
      const { id, ...updates } = params;
      const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.filters !== undefined) payload.filters = updates.filters;
      if (updates.visible_columns !== undefined) payload.visible_columns = updates.visible_columns;
      if (updates.is_pinned !== undefined) payload.is_pinned = updates.is_pinned;
      if (updates.is_default !== undefined) payload.is_default = updates.is_default;

      const { error } = await supabase
        .from("saved_views")
        .update(payload)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-views"] });
    },
  });
}

export function useDeleteSavedView() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("saved_views")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-views"] });
    },
  });
}
