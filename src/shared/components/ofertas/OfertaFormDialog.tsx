import { useState } from "react";
import { useCreateOferta } from "@/hooks/useOfertas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface OfertaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const verticais = ["Saúde", "Finanças", "Relacionamento", "Educação", "Negócios", "Outro"];
const mercados = ["BR", "US", "EU", "LATAM", "Global"];

export function OfertaFormDialog({ open, onOpenChange }: OfertaFormDialogProps) {
  const createMutation = useCreateOferta();
  const [form, setForm] = useState({
    nome: "",
    vertical: "",
    mercado: "",
    ticket_front: "",
    cpa_target: "",
    aov_target: "",
    roas_target: "",
    promessa_principal: "",
    mecanismo_unico: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(
      {
        nome: form.nome,
        slug: "",
        vertical: form.vertical || null,
        mercado: form.mercado || null,
        status: "RESEARCH",
        ticket_front: form.ticket_front ? Number(form.ticket_front) : null,
        cpa_target: form.cpa_target ? Number(form.cpa_target) : null,
        aov_target: form.aov_target ? Number(form.aov_target) : null,
        roas_target: form.roas_target ? Number(form.roas_target) : null,
        promessa_principal: form.promessa_principal || null,
        mecanismo_unico: form.mecanismo_unico || null,
        data_lancamento: null,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setForm({
            nome: "",
            vertical: "",
            mercado: "",
            ticket_front: "",
            cpa_target: "",
            aov_target: "",
            roas_target: "",
            promessa_principal: "",
            mecanismo_unico: "",
          });
        },
      }
    );
  };

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Oferta</DialogTitle>
          <DialogDescription>Preencha os dados básicos da oferta.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Oferta *</Label>
            <Input id="nome" value={form.nome} onChange={(e) => update("nome", e.target.value)} placeholder="Ex: Método Emagrecer 2.0" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Vertical</Label>
              <Select value={form.vertical} onValueChange={(v) => update("vertical", v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {verticais.map((v) => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Mercado</Label>
              <Select value={form.mercado} onValueChange={(v) => update("mercado", v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {mercados.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ticket">Ticket Front (R$)</Label>
              <Input id="ticket" type="number" step="0.01" value={form.ticket_front} onChange={(e) => update("ticket_front", e.target.value)} placeholder="97.00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpa">CPA Target (R$)</Label>
              <Input id="cpa" type="number" step="0.01" value={form.cpa_target} onChange={(e) => update("cpa_target", e.target.value)} placeholder="30.00" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="aov">AOV Target (R$)</Label>
              <Input id="aov" type="number" step="0.01" value={form.aov_target} onChange={(e) => update("aov_target", e.target.value)} placeholder="150.00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="roas">ROAS Target</Label>
              <Input id="roas" type="number" step="0.01" value={form.roas_target} onChange={(e) => update("roas_target", e.target.value)} placeholder="3.00" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="promessa">Promessa Principal</Label>
            <Textarea id="promessa" value={form.promessa_principal} onChange={(e) => update("promessa_principal", e.target.value)} placeholder="A grande promessa da oferta..." rows={2} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mecanismo">Mecanismo Único</Label>
            <Textarea id="mecanismo" value={form.mecanismo_unico} onChange={(e) => update("mecanismo_unico", e.target.value)} placeholder="O que torna esta oferta única..." rows={2} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={createMutation.isPending || !form.nome.trim()}>
              {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Criar Oferta
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
