import { useState, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Upload, FileSpreadsheet, CheckCircle2, AlertCircle,
  ArrowRight, ArrowLeft, X, Loader2,
} from 'lucide-react';
import { useCSVImport, type ImportType, type ColumnMapping, getCSVHeaders } from '@/hooks/useCSVImport';
import { cn, formatNumber } from '@/lib/utils';

type Step = 'upload' | 'preview' | 'config' | 'processing' | 'result';

const IMPORT_TYPES: { value: ImportType; label: string; desc: string }[] = [
  { value: 'PUBLICWWW_EXPORT', label: 'PublicWWW Export', desc: 'URLs + snippets de código fonte' },
  { value: 'SEMRUSH_BULK', label: 'Semrush Bulk', desc: 'Análise em massa de 200 domínios' },
  { value: 'SEMRUSH_COMPARISON', label: 'Semrush Comparison', desc: 'Comparação mensal de 5 sites' },
  { value: 'MANUAL_CSV', label: 'CSV Manual', desc: 'Formato livre com mapeamento de colunas' },
];

interface CsvImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CsvImportDialog({ open, onOpenChange }: CsvImportDialogProps) {
  const [step, setStep] = useState<Step>('upload');
  const [importType, setImportType] = useState<ImportType>('PUBLICWWW_EXPORT');
  const [footprint, setFootprint] = useState('');
  const [filtroTrafegoMin, setFiltroTrafegoMin] = useState<number>(0);
  const [mapping, setMapping] = useState<ColumnMapping>({ dominio: 0 });

  const csv = useCSVImport();

  const handleClose = useCallback(() => {
    csv.reset();
    setStep('upload');
    setFootprint('');
    setFiltroTrafegoMin(0);
    setMapping({ dominio: 0 });
    onOpenChange(false);
  }, [csv, onOpenChange]);

  const handleFileDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) await csv.loadFile(f);
  }, [csv]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) await csv.loadFile(f);
  }, [csv]);

  const handleParse = useCallback(() => {
    const rows = csv.parseFile(importType, importType === 'MANUAL_CSV' ? mapping : undefined);
    if (rows.length > 0) setStep('preview');
  }, [csv, importType, mapping]);

  const handleProcess = useCallback(async () => {
    setStep('processing');
    await csv.processImport(importType, csv.parsed, { footprint, filtroTrafegoMin });
    setStep('result');
  }, [csv, importType, footprint, filtroTrafegoMin]);

  const stepIndex = ['upload', 'preview', 'config', 'processing', 'result'].indexOf(step);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-card">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Import CSV → Radar</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-1 px-6 py-3 border-b bg-muted/30">
          {['Upload', 'Preview', 'Config', 'Processar', 'Resultado'].map((label, i) => (
            <div key={label} className="flex items-center gap-1">
              <div className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors',
                i === stepIndex ? 'bg-primary text-primary-foreground' :
                i < stepIndex ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
              )}>
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold border border-current/30">
                  {i < stepIndex ? '✓' : i + 1}
                </span>
                {label}
              </div>
              {i < 4 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
            </div>
          ))}
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 max-h-[60vh]">
          <div className="p-6 space-y-5">
            {/* STEP: Upload */}
            {step === 'upload' && (
              <>
                {/* Type selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo de CSV</label>
                  <div className="grid grid-cols-2 gap-2">
                    {IMPORT_TYPES.map(t => (
                      <button
                        key={t.value}
                        onClick={() => setImportType(t.value)}
                        className={cn(
                          'text-left p-3 rounded-lg border-2 transition-all',
                          importType === t.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/30'
                        )}
                      >
                        <p className="text-sm font-medium">{t.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{t.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Drop zone */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                >
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm font-medium">Arraste o CSV aqui</p>
                  <p className="text-xs text-muted-foreground mt-1">ou clique para selecionar</p>
                  <input
                    type="file"
                    accept=".csv,.txt,.tsv"
                    onChange={handleFileSelect}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    style={{ position: 'relative', marginTop: '8px' }}
                  />
                  {csv.file && (
                    <div className="mt-3 inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {csv.file.name} ({(csv.file.size / 1024).toFixed(0)}KB)
                    </div>
                  )}
                </div>

                {/* Manual CSV mapping */}
                {importType === 'MANUAL_CSV' && csv.headers.length > 0 && (
                  <div className="space-y-3 rounded-lg border p-4">
                    <p className="text-sm font-medium">Mapeamento de Colunas</p>
                    <div className="grid grid-cols-2 gap-3">
                      {(['dominio', 'nome', 'trafego', 'nicho'] as const).map(field => (
                        <div key={field}>
                          <label className="text-xs text-muted-foreground capitalize">{field} *</label>
                          <Select
                            value={String(mapping[field] ?? '')}
                            onValueChange={(v) => setMapping(prev => ({ ...prev, [field]: v !== '' ? parseInt(v) : undefined }))}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Selecionar coluna" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">—</SelectItem>
                              {csv.headers.map((h, i) => (
                                <SelectItem key={i} value={String(i)}>{h || `Coluna ${i + 1}`}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* STEP: Preview */}
            {step === 'preview' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{csv.parsed.length} domínios encontrados</p>
                    <p className="text-xs text-muted-foreground">Deduplicados e validados</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {IMPORT_TYPES.find(t => t.value === importType)?.label}
                  </Badge>
                </div>

                {/* Preview table */}
                <div className="rounded-lg border overflow-hidden">
                  <div className="grid grid-cols-[40px_1fr_100px] gap-2 px-3 py-2 bg-muted/50 text-xs font-medium text-muted-foreground">
                    <span>#</span>
                    <span>Domínio</span>
                    <span className="text-right">Tráfego</span>
                  </div>
                  <ScrollArea className="max-h-60">
                    {csv.parsed.slice(0, 50).map((row, i) => (
                      <div key={i} className="grid grid-cols-[40px_1fr_100px] gap-2 px-3 py-1.5 text-xs border-t items-center">
                        <span className="text-muted-foreground">{i + 1}</span>
                        <span className="font-mono truncate">{row.dominio}</span>
                        <span className="text-right text-muted-foreground">
                          {row.trafego ? formatNumber(row.trafego) : '—'}
                        </span>
                      </div>
                    ))}
                    {csv.parsed.length > 50 && (
                      <p className="text-xs text-muted-foreground text-center py-2">
                        +{csv.parsed.length - 50} domínios não exibidos
                      </p>
                    )}
                  </ScrollArea>
                </div>

                {/* Semrush Comparison: monthly chart placeholder */}
                {importType === 'SEMRUSH_COMPARISON' && csv.parsed.some(r => r.monthly?.length) && (
                  <div className="rounded-lg border p-3">
                    <p className="text-xs font-medium mb-2">📊 Dados mensais detectados</p>
                    {csv.parsed.map((row, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs py-1">
                        <span className="font-mono w-40 truncate">{row.dominio}</span>
                        <span className="text-muted-foreground">{row.monthly?.length || 0} meses</span>
                        {row.monthly && row.monthly.length > 0 && (
                          <div className="flex gap-1 flex-1">
                            {row.monthly.map((m, j) => (
                              <div
                                key={j}
                                className="bg-primary/20 rounded-sm"
                                style={{
                                  height: `${Math.max(4, (m.visits / Math.max(...row.monthly!.map(x => x.visits))) * 24)}px`,
                                  width: '8px',
                                }}
                                title={`${m.date}: ${formatNumber(m.visits)}`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STEP: Config */}
            {step === 'config' && (
              <div className="space-y-4">
                <p className="text-sm font-medium">Configurações de Importação</p>

                {(importType === 'PUBLICWWW_EXPORT') && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Footprint / Query usada</label>
                    <Input
                      value={footprint}
                      onChange={(e) => setFootprint(e.target.value)}
                      placeholder='Ex: "pay.hotmart.com" "scripts.converti"'
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Será registrado em fontes_captura para rastreabilidade
                    </p>
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium text-muted-foreground">Filtro: tráfego mínimo</label>
                  <Input
                    type="number"
                    value={filtroTrafegoMin || ''}
                    onChange={(e) => setFiltroTrafegoMin(parseInt(e.target.value) || 0)}
                    placeholder="0 (sem filtro)"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Domínios abaixo desse tráfego serão ignorados
                  </p>
                </div>

                <div className="rounded-lg border p-4 bg-muted/30 space-y-2">
                  <p className="text-xs font-semibold">Resumo</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <span className="text-muted-foreground">Tipo:</span>
                    <span>{IMPORT_TYPES.find(t => t.value === importType)?.label}</span>
                    <span className="text-muted-foreground">Total domínios:</span>
                    <span>{csv.parsed.length}</span>
                    <span className="text-muted-foreground">Arquivo:</span>
                    <span className="truncate">{csv.file?.name}</span>
                    {footprint && <>
                      <span className="text-muted-foreground">Footprint:</span>
                      <span className="font-mono truncate">{footprint}</span>
                    </>}
                    {filtroTrafegoMin > 0 && <>
                      <span className="text-muted-foreground">Filtro tráfego:</span>
                      <span>≥ {formatNumber(filtroTrafegoMin)}</span>
                    </>}
                  </div>
                </div>
              </div>
            )}

            {/* STEP: Processing */}
            {step === 'processing' && (
              <div className="space-y-6 py-8 text-center">
                <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin" />
                <div>
                  <p className="text-sm font-medium">Processando {csv.parsed.length} domínios...</p>
                  <p className="text-xs text-muted-foreground mt-1">Criando ofertas e registrando dados</p>
                </div>
                <Progress value={csv.progress} className="w-64 mx-auto" />
                <p className="text-xs text-muted-foreground">{csv.progress}%</p>
              </div>
            )}

            {/* STEP: Result */}
            {step === 'result' && csv.result && (
              <div className="space-y-4 py-4">
                <div className="text-center space-y-2">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-green-500" />
                  <p className="text-lg font-semibold">Import Concluído!</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <ResultCard label="Ofertas Criadas" value={csv.result.created} color="text-green-500" />
                  <ResultCard label="Ofertas Atualizadas" value={csv.result.updated} color="text-primary" />
                  <ResultCard label="Ignoradas" value={csv.result.skipped} color="text-muted-foreground" />
                  <ResultCard label="Erros" value={csv.result.errors} color="text-destructive" />
                </div>

                {csv.error && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-xs">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    {csv.error}
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-card">
          <div>
            {step !== 'upload' && step !== 'processing' && step !== 'result' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const steps: Step[] = ['upload', 'preview', 'config'];
                  setStep(steps[Math.max(0, stepIndex - 1)]);
                }}
              >
                <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            {step === 'upload' && (
              <Button onClick={handleParse} disabled={!csv.file} size="sm">
                Parsear Arquivo <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}
            {step === 'preview' && (
              <Button onClick={() => setStep('config')} size="sm">
                Configurar <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}
            {step === 'config' && (
              <Button onClick={handleProcess} size="sm">
                📥 Processar {csv.parsed.length} domínios
              </Button>
            )}
            {step === 'result' && (
              <Button onClick={handleClose} size="sm">
                Fechar
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ResultCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-lg border p-3 text-center">
      <p className={cn('text-2xl font-bold', color)}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
