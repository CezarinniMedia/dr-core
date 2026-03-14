import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateAdCreative } from "@/hooks/useCompetitors";
import { storage } from "@/lib/storage";
import { Loader2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdCreativeFormDialogProps {
  open: boolean;
  onClose: () => void;
  competitorId: string;
}

export function AdCreativeFormDialog({ open, onClose, competitorId }: AdCreativeFormDialogProps) {
  const createMutation = useCreateAdCreative();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    tipo: "IMAGE",
    platform: "FACEBOOK",
    first_seen: new Date().toISOString().split("T")[0],
    file_url: "",
    copy_headline: "",
    copy_body: "",
    cta_text: "",
    angulo: "",
    tags: "",
  });

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${competitorId}/${Date.now()}.${ext}`;
      const result = await storage.uploadFile("spy-assets", path, file);
      if ("error" in result) throw new Error(result.error);

      update("file_url", result.url);
    } catch (err: any) {
      toast({ title: "Erro no upload", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    if (!form.file_url || !form.tipo || !form.platform) return;
    createMutation.mutate(
      {
        competitor_id: competitorId,
        tipo: form.tipo,
        platform: form.platform,
        first_seen: form.first_seen,
        file_url: form.file_url,
        copy_headline: form.copy_headline || undefined,
        copy_body: form.copy_body || undefined,
        cta_text: form.cta_text || undefined,
        angulo: form.angulo || undefined,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()) : undefined,
      },
      {
        onSuccess: () => {
          onClose();
          setForm({ tipo: "IMAGE", platform: "FACEBOOK", first_seen: new Date().toISOString().split("T")[0], file_url: "", copy_headline: "", copy_body: "", cta_text: "", angulo: "", tags: "" });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Salvar Ad Creative</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo *</Label>
              <Select value={form.tipo} onValueChange={(v) => update("tipo", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="IMAGE">Imagem</SelectItem>
                  <SelectItem value="VIDEO">Vídeo</SelectItem>
                  <SelectItem value="CAROUSEL">Carrossel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Plataforma *</Label>
              <Select value={form.platform} onValueChange={(v) => update("platform", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="FACEBOOK">Facebook</SelectItem>
                  <SelectItem value="GOOGLE">Google</SelectItem>
                  <SelectItem value="TIKTOK">TikTok</SelectItem>
                  <SelectItem value="YOUTUBE">YouTube</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Arquivo (screenshot/vídeo) *</Label>
            {form.file_url ? (
              <div className="space-y-2">
                <img src={form.file_url} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                <Button variant="outline" size="sm" onClick={() => update("file_url", "")}>Trocar arquivo</Button>
              </div>
            ) : (
              <div>
                <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer hover:border-primary/50 transition-colors">
                  {uploading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">Clique para upload</span>
                    </>
                  )}
                  <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileUpload} disabled={uploading} />
                </label>
                <p className="text-xs text-muted-foreground mt-1">Ou cole a URL:</p>
                <Input value={form.file_url} onChange={(e) => update("file_url", e.target.value)} placeholder="https://..." className="mt-1" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Primeira vez visto</Label>
            <Input type="date" value={form.first_seen} onChange={(e) => update("first_seen", e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Headline</Label>
            <Input value={form.copy_headline} onChange={(e) => update("copy_headline", e.target.value)} placeholder="Headline do ad..." />
          </div>

          <div className="space-y-2">
            <Label>Copy Body</Label>
            <Textarea value={form.copy_body} onChange={(e) => update("copy_body", e.target.value)} placeholder="Texto do ad..." rows={3} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>CTA</Label>
              <Input value={form.cta_text} onChange={(e) => update("cta_text", e.target.value)} placeholder="Saiba mais" />
            </div>
            <div className="space-y-2">
              <Label>Ângulo</Label>
              <Select value={form.angulo} onValueChange={(v) => update("angulo", v)}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="DOR">Dor</SelectItem>
                  <SelectItem value="DESEJO">Desejo</SelectItem>
                  <SelectItem value="CURIOSIDADE">Curiosidade</SelectItem>
                  <SelectItem value="AUTORIDADE">Autoridade</SelectItem>
                  <SelectItem value="PROVA_SOCIAL">Prova Social</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tags (separadas por vírgula)</Label>
            <Input value={form.tags} onChange={(e) => update("tags", e.target.value)} placeholder="dor, desejo, curiosidade" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={!form.file_url || createMutation.isPending}>
            {createMutation.isPending ? "Salvando..." : "Salvar Ad"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
