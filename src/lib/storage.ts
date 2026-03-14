import { supabase } from "@/integrations/supabase/client";

export type StorageBucket = "avatars" | "creatives" | "spy-assets" | "documents";

/**
 * Get the current user's workspace_id.
 * Required for storage path prefixing (RLS uses folder path for isolation).
 */
export async function getWorkspaceId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: member, error } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .single();

  if (error || !member) throw new Error("No workspace found");
  return member.workspace_id;
}

class StorageService {
  /**
   * Upload file to storage.
   * Path is automatically prefixed with workspace_id for RLS compliance.
   * Convention: {workspace_id}/{rest_of_path}
   */
  async uploadFile(
    bucket: StorageBucket,
    path: string,
    file: File
  ): Promise<{ url: string; path: string } | { error: string }> {
    try {
      const workspaceId = await getWorkspaceId();
      const fullPath = `${workspaceId}/${path}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fullPath, file, { cacheControl: "3600", upsert: false });

      if (error) {
        console.error("Upload error:", error);
        return { error: error.message };
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(data.path);

      return { url: publicUrl, path: data.path };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      console.error("Upload error:", msg);
      return { error: msg };
    }
  }

  /**
   * Delete file from storage
   */
  async deleteFile(bucket: StorageBucket, path: string) {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) return { error: error.message };
    return { success: true };
  }

  /**
   * Get signed URL for private files (1 hour expiry)
   */
  async getSignedUrl(bucket: StorageBucket, path: string) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 3600);
    if (error) return { error: error.message };
    return { url: data.signedUrl };
  }

  /**
   * List files in a folder
   */
  async listFiles(bucket: StorageBucket, folder: string) {
    const { data, error } = await supabase.storage.from(bucket).list(folder);
    if (error) return { error: error.message };
    return { files: data };
  }
}

export const storage = new StorageService();
