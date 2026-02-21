import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useCreateCriativo } from "@/features/creatives/hooks/useCriativos";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";

interface CriativoFormDialogProps {
  open: boolean;
  onClose: () => void;
  ofertaId: string;
}

export function CriativoFormDialog({ open, onClose, ofertaId }: CriativoFormDialogProps) {
  const createMutation = useCreateCriativo();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    tipo: "IMAGE",
    hook_text: "",
    copy_body: "",
    cta: "",
    plataforma: "FACEBOOK",
    angulo: "",
    file_url: "",
  });

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${ofertaId}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("creatives").upload(path, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("creatives").getPublicUrl(path);
      update("file_url", urlData.publicUrl);
    } catch (err: any) {
      toast({ title: "Erro no upload", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    if (!form.nome.trim() || !form.hook_text.trim()) return;
    createMutation.mutate(
      {
        oferta_id: ofertaId,
        nome: form.nome,
        tipo: form.tipo,
        hook_text: form.hook_text,
        copy_body: form.copy_body || undefined,
        cta: form.cta || undefined,
        plataforma: form.plataforma || undefined,
        angulo: form.angulo || undefined,
        file_url: form.file_url || undefined,
      },
      {
        onSuccess: () => {
          onClose();
          setForm({ nome: "", tipo: "IMAGE", hook_text: "", copy_body: "", cta: "", plataforma: "FACEBOOK", angulo: "", file_url: "" });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Criativo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input value={form.nome} onChange={(e) => update("nome", e.target.value)} placeholder="Nome do criativo" />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={form.tipo} onValueChange={(v) => update("tipo", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="IMAGE">Imagem</SelectItem>
                  <SelectItem value="VIDEO">Vídeo</SelectItem>
                  <SelectItem value="CAROUSEL">Carrossel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Hook *</Label>
            <Textarea value={form.hook_text} onChange={(e) => update("hook_text", e.target.value)} placeholder="O hook principal do criativo..." rows={2} />
          </div>

          <div className="space-y-2">
            <Label>Copy Body</Label>
            <Textarea value={form.copy_body} onChange={(e) => update("copy_body", e.target.value)} placeholder="Corpo do texto..." rows={3} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>CTA</Label>
              <Input value={form.cta} onChange={(e) => update("cta", e.target.value)} placeholder="Saiba mais" />
            </div>
            <div className="space-y-2">
              <Label>Plataforma</Label>
              <Select value={form.plataforma} onValueChange={(v) => update("plataforma", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="FACEBOOK">Facebook</SelectItem>
                  <SelectItem value="GOOGLE">Google</SelectItem>
                  <SelectItem value="TIKTOK">TikTok</SelectItem>
                  <SelectItem value="INSTAGRAM">Instagram</SelectItem>
                </SelectContent>
              </Select>
            </div>
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

          <div className="space-y-2">
            <Label>Arquivo (opcional)</Label>
            {form.file_url ? (
              <div className="space-y-2">
                <img src={form.file_url} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                <Button variant="outline" size="sm" onClick={() => update("file_url", "")}>Trocar</Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 cursor-pointer hover:border-primary/50 transition-colors">
                {uploading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : <Upload className="h-5 w-5 text-muted-foreground mb-1" />}
                <span className="text-xs text-muted-foreground">Upload criativo</span>
                <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileUpload} disabled={uploading} />
              </label>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={!form.nome.trim() || !form.hook_text.trim() || createMutation.isPending}>
            {createMutation.isPending ? "Salvando..." : "Criar Criativo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
