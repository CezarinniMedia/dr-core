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
import { useCreateCompetitor } from "@/hooks/useCompetitors";
import { Flame, Zap, Snowflake } from "lucide-react";

interface CompetitorFormDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CompetitorFormDialog({ open, onClose }: CompetitorFormDialogProps) {
  const createMutation = useCreateCompetitor();
  const [form, setForm] = useState({
    nome: "",
    dominio: "",
    vertical: "",
    status_tracking: "WARM",
    traffic_score: "",
    fb_page_url: "",
    ig_handle: "",
    tiktok_handle: "",
    notas: "",
  });

  const handleSubmit = () => {
    if (!form.nome.trim()) return;
    createMutation.mutate(
      {
        nome: form.nome,
        dominio: form.dominio || undefined,
        vertical: form.vertical || undefined,
        status_tracking: form.status_tracking,
        traffic_score: form.traffic_score ? parseInt(form.traffic_score) : undefined,
        fb_page_url: form.fb_page_url || undefined,
        ig_handle: form.ig_handle || undefined,
        tiktok_handle: form.tiktok_handle || undefined,
        notas: form.notas || undefined,
      },
      {
        onSuccess: () => {
          onClose();
          setForm({ nome: "", dominio: "", vertical: "", status_tracking: "WARM", traffic_score: "", fb_page_url: "", ig_handle: "", tiktok_handle: "", notas: "" });
        },
      }
    );
  };

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Competitor</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input value={form.nome} onChange={(e) => update("nome", e.target.value)} placeholder="Nome do competitor" />
            </div>
            <div className="space-y-2">
              <Label>Domínio</Label>
              <Input value={form.dominio} onChange={(e) => update("dominio", e.target.value)} placeholder="exemplo.com" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Vertical</Label>
              <Select value={form.vertical} onValueChange={(v) => update("vertical", v)}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="nutra">Nutra</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="tech">Tech</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="ecom">E-commerce</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status Tracking</Label>
              <Select value={form.status_tracking} onValueChange={(v) => update("status_tracking", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="HOT"><span className="inline-flex items-center gap-1"><Flame className="h-3 w-3" /> HOT</span></SelectItem>
                  <SelectItem value="WARM"><span className="inline-flex items-center gap-1"><Zap className="h-3 w-3" /> WARM</span></SelectItem>
                  <SelectItem value="COLD"><span className="inline-flex items-center gap-1"><Snowflake className="h-3 w-3" /> COLD</span></SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Traffic Score (1-10)</Label>
            <Input type="number" min={1} max={10} value={form.traffic_score} onChange={(e) => update("traffic_score", e.target.value)} placeholder="Estimativa SimilarWeb" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Facebook</Label>
              <Input value={form.fb_page_url} onChange={(e) => update("fb_page_url", e.target.value)} placeholder="URL" />
            </div>
            <div className="space-y-2">
              <Label>Instagram</Label>
              <Input value={form.ig_handle} onChange={(e) => update("ig_handle", e.target.value)} placeholder="@handle" />
            </div>
            <div className="space-y-2">
              <Label>TikTok</Label>
              <Input value={form.tiktok_handle} onChange={(e) => update("tiktok_handle", e.target.value)} placeholder="@handle" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notas</Label>
            <Textarea value={form.notas} onChange={(e) => update("notas", e.target.value)} placeholder="Observações sobre o competitor..." rows={3} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={!form.nome.trim() || createMutation.isPending}>
            {createMutation.isPending ? "Salvando..." : "Adicionar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
