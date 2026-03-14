import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** Fetch the current user's workspace_id. Cached for 30 minutes via React Query. */
async function fetchWorkspaceId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data, error } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .single();
  if (error || !data?.workspace_id) throw new Error("Workspace not found");
  return data.workspace_id;
}

/**
 * Shared hook for workspace_id. Uses React Query to cache the result
 * across all consumers — avoids N redundant queries to workspace_members.
 */
export function useWorkspaceId() {
  return useQuery({
    queryKey: ["workspace-id"],
    queryFn: fetchWorkspaceId,
    staleTime: 30 * 60 * 1000, // 30 min
    gcTime: 60 * 60 * 1000,    // 1 hour garbage collection
  });
}
