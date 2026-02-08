import { useState } from 'react';
import { useImportBatches } from '@/hooks/useImportBatches';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, FileSpreadsheet, RefreshCw } from 'lucide-react';
import { formatDate, formatNumber } from '@/lib/utils';

const tipoLabels: Record<string, string> = {
  PUBLICWWW_EXPORT: 'PublicWWW',
  SEMRUSH_BULK: 'Semrush Bulk',
  SEMRUSH_COMPARISON: 'Semrush Comparison',
  MANUAL_CSV: 'CSV Manual',
};

const statusColors: Record<string, string> = {
  DONE: 'bg-green-500/15 text-green-600',
  PROCESSING: 'bg-primary/15 text-primary',
  PENDENTE: 'bg-muted text-muted-foreground',
  ERRO: 'bg-destructive/15 text-destructive',
};

interface ImportHistoryPanelProps {
  onReimport?: (tipo: string) => void;
}

export function ImportHistoryPanel({ onReimport }: ImportHistoryPanelProps) {
  const { data: batches, isLoading } = useImportBatches(20);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading) {
    return <p className="text-xs text-muted-foreground py-4 text-center">Carregando histórico...</p>;
  }

  if (!batches?.length) {
    return (
      <div className="border border-dashed rounded-lg p-8 text-center">
        <FileSpreadsheet className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">Nenhuma importação registrada</p>
      </div>
    );
  }

  return (
    <ScrollArea className="max-h-[400px]">
      <div className="space-y-2">
        {batches.map(batch => (
          <Collapsible
            key={batch.id}
            open={expandedId === batch.id}
            onOpenChange={(open) => setExpandedId(open ? batch.id : null)}
          >
            <Card className="overflow-hidden">
              <CollapsibleTrigger asChild>
                <CardContent className="p-3 cursor-pointer hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileSpreadsheet className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{batch.arquivo_nome || 'Import'}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(batch.created_at || '', true)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className="text-[10px]">
                        {tipoLabels[batch.tipo] || batch.tipo}
                      </Badge>
                      <Badge className={`text-[10px] ${statusColors[batch.status || 'PENDENTE'] || ''}`}>
                        {batch.status}
                      </Badge>
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform data-[state=open]:rotate-180" />
                    </div>
                  </div>
                </CardContent>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="px-3 pb-3 pt-0 space-y-2 border-t">
                  <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                    <div className="text-center">
                      <p className="font-semibold text-green-500">{batch.ofertas_novas_criadas || 0}</p>
                      <p className="text-muted-foreground">Criadas</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-primary">{batch.ofertas_existentes_atualizadas || 0}</p>
                      <p className="text-muted-foreground">Atualizadas</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-muted-foreground">{batch.linhas_ignoradas || 0}</p>
                      <p className="text-muted-foreground">Ignoradas</p>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <p>Total linhas: {batch.total_linhas || 0}</p>
                    {batch.erro_msg && (
                      <p className="text-destructive">Erro: {batch.erro_msg}</p>
                    )}
                  </div>

                  {onReimport && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => onReimport(batch.tipo)}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" /> Re-importar
                    </Button>
                  )}
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
      </div>
    </ScrollArea>
  );
}
