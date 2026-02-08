import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Zap } from 'lucide-react';
import { useCreateOferta } from '@/hooks/useOfertas';

const NICHOS = [
  'Emagrecimento', 'Diabetes', 'Dor', 'Próstata', 'Visão', 'Audição',
  'Cabelo', 'Pele/Anti-aging', 'Energia/Libido', 'Ansiedade/Sono',
  'Renda Extra', 'Relacionamento', 'Manifestação', 'Pet', 'Outro'
];

const CHECKOUT_PROVIDERS = [
  'Hotmart', 'Kiwify', 'Eduzz', 'Monetizze', 'Pepper', 'Yampi',
  'Ticto', 'Cakto', 'Kirvano', 'Braip', 'Lastlink', 'Hubla',
  'PerfectPay', 'HeroSpark', 'ClickBank', 'ClickFunnels', 'SamCart',
  'ThriveCart', 'Stripe', 'CartPanda', 'Outro'
];

const VSL_PLAYERS = [
  'Vturb', 'Panda Video', 'Wistia', 'YouTube', 'Vimeo',
  'ConverteAI', 'Vidyard', 'Custom', 'Nenhum'
];

interface QuickAddForm {
  nome: string;
  dominio_principal: string;
  nicho: string;
  checkout_provider: string;
  vsl_player: string;
  prioridade: string;
  trafego_atual: number | null;
  trafego_tendencia: number | null;
  tem_quiz: boolean;
  notas_spy: string;
  ticket_front: number | null;
}

export function QuickAddOferta() {
  const [open, setOpen] = useState(false);
  const createMutation = useCreateOferta();
  const { register, handleSubmit, reset, setValue, watch } = useForm<QuickAddForm>({
    defaultValues: {
      prioridade: 'MEDIA',
      tem_quiz: false,
      notas_spy: '',
    }
  });

  const onSubmit = (data: QuickAddForm) => {
    createMutation.mutate({
      ...data,
      status_spy: 'RADAR',
      slug: data.dominio_principal?.replace(/[^a-z0-9]/gi, '-').toLowerCase() || data.nome.replace(/[^a-z0-9]/gi, '-').toLowerCase(),
    } as any, {
      onSuccess: () => {
        reset();
        setOpen(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" /> Quick Add
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Add Oferta ao Radar
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Row 1: Nome + Domínio */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Nome da Oferta *</Label>
              <Input {...register('nome', { required: true })} placeholder="Ex: Diabetes Freedom" />
            </div>
            <div>
              <Label className="text-xs">Domínio Principal</Label>
              <Input {...register('dominio_principal')} placeholder="Ex: diabetesfreedom.com" />
            </div>
          </div>

          {/* Row 2: Nicho + Checkout */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Nicho</Label>
              <Select onValueChange={(v) => setValue('nicho', v)}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {NICHOS.map(n => (
                    <SelectItem key={n} value={n}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Checkout</Label>
              <Select onValueChange={(v) => setValue('checkout_provider', v)}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {CHECKOUT_PROVIDERS.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 3: Tráfego + Tendência + Ticket */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Tráfego 30d</Label>
              <Input type="number" {...register('trafego_atual', { valueAsNumber: true })} placeholder="50000" />
            </div>
            <div>
              <Label className="text-xs">Tendência %</Label>
              <Input type="number" {...register('trafego_tendencia', { valueAsNumber: true })} placeholder="+15" />
            </div>
            <div>
              <Label className="text-xs">Ticket R$</Label>
              <Input type="number" {...register('ticket_front', { valueAsNumber: true })} placeholder="97" />
            </div>
          </div>

          {/* Row 4: VSL Player + Prioridade + Quiz */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">VSL Player</Label>
              <Select onValueChange={(v) => setValue('vsl_player', v)}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {VSL_PLAYERS.map(v => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Prioridade</Label>
              <Select onValueChange={(v) => setValue('prioridade', v)} defaultValue="MEDIA">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="URGENTE">🔴 Urgente</SelectItem>
                  <SelectItem value="ALTA">🟠 Alta</SelectItem>
                  <SelectItem value="MEDIA">🟡 Média</SelectItem>
                  <SelectItem value="BAIXA">🟢 Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2 pb-1">
              <input type="checkbox" {...register('tem_quiz')} id="tem_quiz" className="rounded" />
              <Label htmlFor="tem_quiz" className="text-xs cursor-pointer">Tem Quiz?</Label>
            </div>
          </div>

          {/* Notas */}
          <div>
            <Label className="text-xs">Notas rápidas</Label>
            <Textarea {...register('notas_spy')} placeholder="Observações sobre essa oferta..." rows={2} />
          </div>

          {/* Submit */}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Salvando...' : '⚡ Adicionar ao Radar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
