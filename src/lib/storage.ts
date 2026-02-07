import { supabase } from "@/integrations/supabase/client";

export type StorageBucket = "avatars" | "creatives" | "spy-assets" | "documents";

class StorageService {
  /**
   * Upload file to storage
   */
  async uploadFile(
    bucket: StorageBucket,
    path: string,
    file: File
  ): Promise<{ url: string; path: string } | { error: string }> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { cacheControl: "3600", upsert: false });

    if (error) {
      console.error("Upload error:", error);
      return { error: error.message };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(data.path);

    return { url: publicUrl, path: data.path };
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
