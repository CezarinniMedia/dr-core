import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useCreateAvatar } from "@/features/avatar/hooks/useAvatares";
import { useOfertas } from "@/features/offers/hooks/useOfertas";
import { Loader2, UserPlus } from "lucide-react";

interface AvatarCreateModalProps {
  open: boolean;
  onClose: () => void;
}

export function AvatarCreateModal({ open, onClose }: AvatarCreateModalProps) {
  const createMutation = useCreateAvatar();
  const { data: ofertas } = useOfertas();

  const [form, setForm] = useState({
    nome: "",
    oferta_id: "",
    estado_atual: "",
    estado_desejado: "",
    demographics: "",
    linguagem_avatar: "",
    notas: "",
  });

  const update = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleCreate = () => {
    if (!form.nome.trim() || !form.oferta_id) return;

    createMutation.mutate(
      {
        oferta_id: form.oferta_id,
        nome: form.nome,
        estado_atual: form.estado_atual || undefined,
        estado_desejado: form.estado_desejado || undefined,
        demographics: form.demographics || undefined,
        linguagem_avatar: form.linguagem_avatar || undefined,
        notas: form.notas || undefined,
        pain_matrix: [],
        desire_matrix: [],
        objecoes: [],
        gatilhos_emocionais: [],
      },
      {
        onSuccess: () => {
          onClose();
          setForm({
            nome: "",
            oferta_id: "",
            estado_atual: "",
            estado_desejado: "",
            demographics: "",
            linguagem_avatar: "",
            notas: "",
          });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Criar Avatar Manual
          </DialogTitle>
          <DialogDescription>
            Crie um avatar manualmente. Você pode preencher Pain Matrix, desejos e objeções depois no detalhe.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Nome do Avatar *</Label>
            <Input
              value={form.nome}
              onChange={(e) => update("nome", e.target.value)}
              placeholder="Ex: Mulher 35-50 que quer emagrecer"
            />
          </div>

          <div className="space-y-2">
            <Label>Oferta *</Label>
            <Select value={form.oferta_id} onValueChange={(v) => update("oferta_id", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a oferta..." />
              </SelectTrigger>
              <SelectContent>
                {ofertas?.map((o) => (
                  <SelectItem key={o.id} value={o.id}>{o.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Demographics</Label>
            <Textarea
              value={form.demographics}
              onChange={(e) => update("demographics", e.target.value)}
              placeholder="Idade, genero, renda, localizacao..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Estado Atual</Label>
              <Textarea
                value={form.estado_atual}
                onChange={(e) => update("estado_atual", e.target.value)}
                placeholder="Onde o avatar esta agora..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Estado Desejado</Label>
              <Textarea
                value={form.estado_desejado}
                onChange={(e) => update("estado_desejado", e.target.value)}
                placeholder="Onde quer estar..."
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Linguagem / Girias</Label>
            <Textarea
              value={form.linguagem_avatar}
              onChange={(e) => update("linguagem_avatar", e.target.value)}
              placeholder="Palavras e expressoes que o avatar usa..."
              rows={2}
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label>Notas</Label>
            <Textarea
              value={form.notas}
              onChange={(e) => update("notas", e.target.value)}
              placeholder="Observacoes gerais..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button
            onClick={handleCreate}
            disabled={createMutation.isPending || !form.nome.trim() || !form.oferta_id}
          >
            {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Criar Avatar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
