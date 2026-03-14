import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { storage, type StorageBucket } from "@/lib/storage";
import { logger } from "@/lib/logger";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  bucket: StorageBucket;
  path: string;
  accept?: Record<string, string[]>;
  maxSize?: number;
  onSuccess?: (url: string, path: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function FileUpload({
  bucket,
  path,
  accept = { "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"] },
  maxSize = 10 * 1024 * 1024,
  onSuccess,
  onError,
  className,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; url: string } | null>(null);
  const { toast } = useToast();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setUploading(true);

      try {
        const timestamp = Date.now();
        const filePath = `${path}/${timestamp}-${file.name}`;
        const result = await storage.uploadFile(bucket, filePath, file);

        if ("error" in result) throw new Error(result.error);

        setUploadedFile({ name: file.name, url: result.url });
        logger.info("File uploaded successfully", { bucket, path: result.path });
        toast({ title: "Upload concluído!", description: file.name });
        onSuccess?.(result.url, result.path);
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Upload failed";
        logger.error("File upload error", error as Error, { bucket, path });
        toast({ title: "Erro no upload", description: msg, variant: "destructive" });
        onError?.(msg);
      } finally {
        setUploading(false);
      }
    },
    [bucket, path, onSuccess, onError, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
  });

  if (uploadedFile) {
    return (
      <div className={cn("flex items-center gap-3 rounded-lg border border-border bg-card p-3", className)}>
        <CheckCircle className="h-5 w-5 text-success shrink-0" />
        <span className="text-sm truncate flex-1">{uploadedFile.name}</span>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setUploadedFile(null)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 cursor-pointer transition-colors",
        isDragActive
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50 hover:bg-muted/30",
        className
      )}
    >
      <input {...getInputProps()} />
      {uploading ? (
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Fazendo upload...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">
            {isDragActive ? "Solte o arquivo aqui" : "Clique ou arraste um arquivo"}
          </p>
          <p className="text-xs text-muted-foreground">
            Máximo {(maxSize / 1024 / 1024).toFixed(0)}MB
          </p>
        </div>
      )}
    </div>
  );
}
