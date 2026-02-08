import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useAvailableDomains } from '@/hooks/useTrafficData';

interface ManualTrafficEntryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDominio?: string;
}

export function ManualTrafficEntry({ open, onOpenChange, defaultDominio }: ManualTrafficEntryProps) {
  const [dominio, setDominio] = useState(defaultDominio || '');
  const [date, setDate] = useState<Date>(new Date());
  const [periodoTipo, setPeriodoTipo] = useState('MENSAL');
  const [visitas, setVisitas] = useState('');
  const [fonteDados, setFonteDados] = useState('manual');
  const [adding, setAdding] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: domains } = useAvailableDomains();

  const handleAdd = async () => {
    if (!dominio || !visitas) return;
    setAdding(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const { data: member } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', user.id)
        .limit(1)
        .single();

      if (!member) throw new Error('Workspace não encontrado');

      const cleanDomain = dominio.replace(/^www\./, '').toLowerCase();

      // Find oferta_id by domain
      const { data: oferta } = await supabase
        .from('ofertas')
        .select('id')
        .eq('dominio_principal', cleanDomain)
        .eq('workspace_id', member.workspace_id)
        .maybeSingle();

      await supabase.from('trafego_historico').insert({
        workspace_id: member.workspace_id,
        dominio: cleanDomain,
        periodo_tipo: periodoTipo,
        periodo_data: format(date, 'yyyy-MM-dd'),
        visitas: parseInt(visitas),
        fonte_dados: fonteDados,
        oferta_id: oferta?.id || null,
      });

      // Update oferta trafego_atual
      if (oferta) {
        await supabase.from('ofertas').update({
          trafego_atual: parseInt(visitas),
          trafego_atualizado_em: new Date().toISOString(),
        }).eq('id', oferta.id);
      }

      toast({ title: '✅ Dado adicionado', description: `${cleanDomain}: ${visitas} visitas` });
      queryClient.invalidateQueries({ queryKey: ['traffic-data'] });
      queryClient.invalidateQueries({ queryKey: ['traffic-sparkline'] });

      // Reset for next entry
      setVisitas('');
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally {
      setAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>📊 Adicionar Dado de Tráfego</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Domain */}
          <div className="space-y-1.5">
            <Label className="text-xs">Domínio</Label>
            <Input
              value={dominio}
              onChange={(e) => setDominio(e.target.value)}
              placeholder="exemplo.com"
              list="domain-suggestions"
            />
            <datalist id="domain-suggestions">
              {domains?.map(d => (
                <option key={d.id} value={d.dominio_principal || ''} />
              ))}
            </datalist>
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label className="text-xs">Data</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !date && 'text-muted-foreground')}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'dd/MM/yyyy') : 'Selecionar data'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Period type */}
            <div className="space-y-1.5">
              <Label className="text-xs">Período</Label>
              <Select value={periodoTipo} onValueChange={setPeriodoTipo}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MENSAL">Mensal</SelectItem>
                  <SelectItem value="SEMANAL">Semanal</SelectItem>
                  <SelectItem value="DIARIO">Diário</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Source */}
            <div className="space-y-1.5">
              <Label className="text-xs">Fonte</Label>
              <Select value={fonteDados} onValueChange={setFonteDados}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="semrush">Semrush</SelectItem>
                  <SelectItem value="similarweb">SimilarWeb</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Visits */}
          <div className="space-y-1.5">
            <Label className="text-xs">Visitas</Label>
            <Input
              type="number"
              value={visitas}
              onChange={(e) => setVisitas(e.target.value)}
              placeholder="150000"
            />
          </div>

          <Button onClick={handleAdd} disabled={adding || !dominio || !visitas} className="w-full">
            <Plus className="h-4 w-4 mr-1" />
            {adding ? 'Adicionando...' : 'Adicionar'}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Pode adicionar múltiplos — o modal não fecha automaticamente
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
