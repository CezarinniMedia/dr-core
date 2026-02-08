import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

type ImportType = 'PUBLICWWW_EXPORT' | 'SEMRUSH_BULK' | 'SEMRUSH_COMPARISON' | 'MANUAL_CSV';

interface ParsedRow {
  dominio: string;
  url?: string;
  trafego?: number;
  trafego_m1?: number;
  trafego_m2?: number;
  trafego_m3?: number;
  snippet?: string;
}

const parsers: Record<ImportType, (text: string) => ParsedRow[]> = {
  PUBLICWWW_EXPORT: (text) => {
    return text.split('\n').slice(1).filter(Boolean).map(line => {
      const [url, snippet] = line.split(',').map(s => s?.trim().replace(/"/g, ''));
      let dominio = '';
      try {
        dominio = url ? new URL(url.startsWith('http') ? url : `https://${url}`).hostname : '';
      } catch { dominio = url || ''; }
      return { dominio, url, snippet };
    }).filter(r => r.dominio);
  },

  SEMRUSH_BULK: (text) => {
    return text.split('\n').slice(1).filter(Boolean).map(line => {
      const cols = line.split(/[,;\t]/).map(s => s?.trim().replace(/"/g, ''));
      return { dominio: cols[0] || '', trafego: parseInt(cols[1]) || 0 };
    }).filter(r => r.dominio);
  },

  SEMRUSH_COMPARISON: (text) => {
    return text.split('\n').slice(1).filter(Boolean).map(line => {
      const cols = line.split(/[,;\t]/).map(s => s?.trim().replace(/"/g, ''));
      return {
        dominio: cols[0] || '',
        trafego: parseInt(cols[1]) || 0,
        trafego_m1: parseInt(cols[2]) || undefined,
        trafego_m2: parseInt(cols[3]) || undefined,
        trafego_m3: parseInt(cols[4]) || undefined,
      };
    }).filter(r => r.dominio);
  },

  MANUAL_CSV: (text) => {
    return text.split('\n').slice(1).filter(Boolean).map(line => {
      const cols = line.split(/[,;\t]/).map(s => s?.trim().replace(/"/g, ''));
      return { dominio: cols[0] || '' };
    }).filter(r => r.dominio);
  },
};

export function CsvImporter() {
  const [open, setOpen] = useState(false);
  const [importType, setImportType] = useState<ImportType>('PUBLICWWW_EXPORT');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ParsedRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ created: number; updated: number; skipped: number } | null>(null);
  const [footprintUsado, setFootprintUsado] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deduplicate = (parsed: ParsedRow[]) => {
    const seen = new Set<string>();
    return parsed.filter(r => {
      const d = r.dominio.toLowerCase().replace(/^www\./, '');
      if (seen.has(d)) return false;
      seen.add(d);
      return true;
    });
  };

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setResult(null);

    const text = await f.text();
    const parsed = parsers[importType](text);
    const deduped = deduplicate(parsed);

    setPreview(deduped.slice(0, 20));
    toast({
      title: `${deduped.length} domínios parseados`,
      description: `(${parsed.length - deduped.length} duplicatas removidas)`,
    });
  }, [importType, toast]);

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);

    try {
      const text = await file.text();
      const parsed = parsers[importType](text);
      const deduped = deduplicate(parsed);

      const { data: { user } } = await supabase.auth.getUser();
      const { data: member } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', user?.id as string)
        .single();

      if (!member) throw new Error('Workspace não encontrado');

      const dominios = deduped.map(r => r.dominio.toLowerCase().replace(/^www\./, ''));
      const { data: existentes } = await (supabase as any)
        .from('ofertas')
        .select('id, dominio_principal')
        .eq('workspace_id', member.workspace_id)
        .in('dominio_principal', dominios);

      const existentesMap = new Map((existentes || []).map((e: any) => [e.dominio_principal, e.id]));

      let created = 0, updated = 0, skipped = 0;

      for (const row of deduped) {
        const domClean = row.dominio.toLowerCase().replace(/^www\./, '');
        const existingId = existentesMap.get(domClean);

        if (existingId) {
          if (row.trafego) {
            await (supabase as any).from('ofertas').update({
              trafego_atual: row.trafego,
              trafego_atualizado_em: new Date().toISOString(),
            }).eq('id', existingId);
            updated++;
          } else {
            skipped++;
          }
        } else {
          if (row.trafego && row.trafego < 100) { skipped++; continue; }

          const { error } = await (supabase as any).from('ofertas').insert({
            workspace_id: member.workspace_id,
            nome: domClean.split('.')[0],
            slug: domClean.replace(/[^a-z0-9]/gi, '-'),
            dominio_principal: domClean,
            status_spy: 'RADAR',
            prioridade: 'MEDIA',
            trafego_atual: row.trafego || null,
            trafego_atualizado_em: row.trafego ? new Date().toISOString() : null,
          });

          if (!error) created++;
          else skipped++;
        }
      }

      // Registrar batch
      await (supabase as any).from('import_batches').insert({
        workspace_id: member.workspace_id,
        tipo: importType,
        arquivo_nome: file.name,
        total_linhas: parsed.length,
        linhas_importadas: created + updated,
        linhas_ignoradas: skipped,
        ofertas_novas_criadas: created,
        ofertas_existentes_atualizadas: updated,
        contexto: { footprint: footprintUsado || null, deduped_count: deduped.length },
        status: 'DONE',
      });

      setResult({ created, updated, skipped });
      queryClient.invalidateQueries({ queryKey: ['ofertas'] });

      toast({
        title: '✅ Import concluído!',
        description: `${created} novas, ${updated} atualizadas, ${skipped} ignoradas`,
      });
    } catch (error: any) {
      toast({ title: 'Erro no import', description: error.message, variant: 'destructive' });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Upload className="h-4 w-4 mr-1" /> Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>📥 Import CSV → Radar</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tipo de Import */}
          <div>
            <label className="text-xs font-medium">Tipo de CSV</label>
            <Select value={importType} onValueChange={(v) => setImportType(v as ImportType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PUBLICWWW_EXPORT">PublicWWW Export (URL, Snippet)</SelectItem>
                <SelectItem value="SEMRUSH_BULK">Semrush Bulk Analysis (200 sites)</SelectItem>
                <SelectItem value="SEMRUSH_COMPARISON">Semrush Comparison (5 sites detalhado)</SelectItem>
                <SelectItem value="MANUAL_CSV">CSV Manual (domínio por linha)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Footprint usado */}
          <div>
            <label className="text-xs font-medium">Footprint/Query usado (opcional)</label>
            <Input
              value={footprintUsado}
              onChange={(e) => setFootprintUsado(e.target.value)}
              placeholder='Ex: "pay.hotmart.com" "scripts.converti"'
            />
          </div>

          {/* File Upload */}
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <FileSpreadsheet className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <input type="file" accept=".csv,.txt,.tsv" onChange={handleFileSelect} className="block w-full text-sm" />
            <p className="text-xs text-muted-foreground mt-1">Arraste CSV aqui ou clique para selecionar</p>
            {file && (
              <p className="text-xs text-primary mt-2">✅ {file.name} ({(file.size / 1024).toFixed(1)}KB)</p>
            )}
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium">Preview (primeiros 20 de {preview.length}+):</p>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {preview.map((row, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs bg-muted/50 rounded px-2 py-1">
                    <span className="text-muted-foreground w-6">{i + 1}</span>
                    <span className="font-mono flex-1 truncate">{row.dominio}</span>
                    {row.trafego !== undefined && (
                      <Badge variant="outline" className="text-[10px]">{row.trafego?.toLocaleString()}</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resultado */}
          {result && (
            <div className="space-y-1 rounded-lg border p-3">
              <div className="flex items-center gap-2 text-xs text-green-500">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {result.created} ofertas novas criadas
              </div>
              <div className="flex items-center gap-2 text-xs text-blue-500">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {result.updated} ofertas atualizadas (tráfego)
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <AlertCircle className="h-3.5 w-3.5" />
                {result.skipped} ignoradas (duplicata/baixo tráfego)
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>Fechar</Button>
            <Button onClick={handleImport} disabled={importing || !file}>
              {importing ? 'Importando...' : `📥 Importar ${preview.length}+ domínios`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
