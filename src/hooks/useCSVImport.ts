import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export type ImportType = 'PUBLICWWW_EXPORT' | 'SEMRUSH_BULK' | 'SEMRUSH_COMPARISON' | 'MANUAL_CSV';

export interface ParsedRow {
  dominio: string;
  url?: string;
  trafego?: number;
  snippet?: string;
  // Semrush Bulk extras
  visitas_unicas?: number;
  pages_per_visit?: number;
  bounce_rate?: number;
  avg_visit_duration?: number;
  // Semrush Comparison: monthly traffic columns
  monthly?: { date: string; visits: number }[];
  // Manual mapping extras
  nome?: string;
  nicho?: string;
}

export interface ImportResult {
  created: number;
  updated: number;
  skipped: number;
  errors: number;
  dominiosNovos: number;
}

export interface ColumnMapping {
  dominio: number;
  nome?: number;
  trafego?: number;
  nicho?: number;
}

// ─── CSV PARSING ────────────────────────────────────

function splitCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (const char of line) {
    if (char === '"') { inQuotes = !inQuotes; continue; }
    if (!inQuotes && (char === ',' || char === ';' || char === '\t')) {
      result.push(current.trim());
      current = '';
      continue;
    }
    current += char;
  }
  result.push(current.trim());
  return result;
}

function extractDomain(urlOrDomain: string): string {
  let clean = urlOrDomain.trim();
  if (!clean) return '';
  try {
    if (clean.includes('://')) {
      return new URL(clean).hostname.replace(/^www\./, '').toLowerCase();
    }
    // Could be "www.domain.com/path"
    clean = clean.split('/')[0].replace(/^www\./, '').toLowerCase();
    return clean;
  } catch {
    return clean.replace(/^www\./, '').toLowerCase();
  }
}

// ─── PARSERS ─────────────────────────────────────────

function parsePublicWWW(text: string): ParsedRow[] {
  const lines = text.split('\n').filter(l => l.trim());
  // PublicWWW exports: first line is header or just URLs
  const hasHeader = lines[0]?.toLowerCase().includes('url') || lines[0]?.toLowerCase().includes('domain');
  const dataLines = hasHeader ? lines.slice(1) : lines;

  return dataLines.map(line => {
    const cols = splitCSVLine(line);
    // PublicWWW can be just URLs, or URL + snippet
    const url = cols[0] || '';
    const snippet = cols[1] || '';
    const dominio = extractDomain(url);
    return { dominio, url, snippet };
  }).filter(r => r.dominio && r.dominio.includes('.'));
}

function parseSemrushBulk(text: string): ParsedRow[] {
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];

  const headerLine = lines[0].toLowerCase();
  const headers = splitCSVLine(headerLine);

  // Find column indices
  const domIdx = headers.findIndex(h => h.includes('domain') || h.includes('target'));
  const visitsIdx = headers.findIndex(h => h.includes('visits') || h.includes('traffic'));
  const uniqueIdx = headers.findIndex(h => h.includes('unique'));
  const pagesIdx = headers.findIndex(h => h.includes('pages'));
  const bounceIdx = headers.findIndex(h => h.includes('bounce'));
  const durationIdx = headers.findIndex(h => h.includes('duration') || h.includes('time'));

  return lines.slice(1).map(line => {
    const cols = splitCSVLine(line);
    const rawDom = cols[domIdx >= 0 ? domIdx : 0] || '';
    return {
      dominio: extractDomain(rawDom),
      trafego: parseInt(cols[visitsIdx >= 0 ? visitsIdx : 1]?.replace(/[^0-9]/g, '') || '0') || 0,
      visitas_unicas: uniqueIdx >= 0 ? (parseInt(cols[uniqueIdx]?.replace(/[^0-9]/g, '') || '0') || undefined) : undefined,
      pages_per_visit: pagesIdx >= 0 ? (parseFloat(cols[pagesIdx] || '0') || undefined) : undefined,
      bounce_rate: bounceIdx >= 0 ? (parseFloat(cols[bounceIdx]?.replace('%', '') || '0') || undefined) : undefined,
      avg_visit_duration: durationIdx >= 0 ? (parseInt(cols[durationIdx]?.replace(/[^0-9]/g, '') || '0') || undefined) : undefined,
    };
  }).filter(r => r.dominio && r.dominio.includes('.'));
}

function parseSemrushComparison(text: string): ParsedRow[] {
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];

  const headers = splitCSVLine(lines[0]);
  // First column = Domain, remaining = month columns (e.g., "Jan 2025", "Feb 2025")
  const monthHeaders = headers.slice(1);

  // Parse month headers to dates (first day of month)
  const monthDates = monthHeaders.map(h => {
    const parts = h.trim().match(/(\w+)\s+(\d{4})/);
    if (!parts) return null;
    const monthMap: Record<string, string> = {
      jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
      jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
      janeiro: '01', fevereiro: '02', março: '03', abril: '04', maio: '05', junho: '06',
      julho: '07', agosto: '08', setembro: '09', outubro: '10', novembro: '11', dezembro: '12',
    };
    const m = monthMap[parts[1].toLowerCase().substring(0, 3)] || '01';
    return `${parts[2]}-${m}-01`;
  });

  return lines.slice(1).map(line => {
    const cols = splitCSVLine(line);
    const dominio = extractDomain(cols[0] || '');
    const monthly = monthDates
      .map((date, i) => ({
        date: date || `2025-${String(i + 1).padStart(2, '0')}-01`,
        visits: parseInt(cols[i + 1]?.replace(/[^0-9]/g, '') || '0') || 0,
      }))
      .filter(m => m.visits > 0);

    const latestTraffic = monthly.length > 0 ? monthly[monthly.length - 1].visits : 0;

    return { dominio, trafego: latestTraffic, monthly };
  }).filter(r => r.dominio && r.dominio.includes('.'));
}

function parseManualCSV(text: string, mapping: ColumnMapping): ParsedRow[] {
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];

  return lines.slice(1).map(line => {
    const cols = splitCSVLine(line);
    const rawDom = cols[mapping.dominio] || '';
    return {
      dominio: extractDomain(rawDom),
      nome: mapping.nome != null ? cols[mapping.nome] : undefined,
      trafego: mapping.trafego != null ? (parseInt(cols[mapping.trafego]?.replace(/[^0-9]/g, '') || '0') || undefined) : undefined,
      nicho: mapping.nicho != null ? cols[mapping.nicho] : undefined,
    };
  }).filter(r => r.dominio && r.dominio.includes('.'));
}

// ─── DEDUPLICATION ──────────────────────────────────

function deduplicateRows(rows: ParsedRow[]): ParsedRow[] {
  const seen = new Set<string>();
  return rows.filter(r => {
    const key = r.dominio.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ─── GET HEADERS ────────────────────────────────────

export function getCSVHeaders(text: string): string[] {
  const firstLine = text.split('\n')[0] || '';
  return splitCSVLine(firstLine);
}

// ─── MAIN HOOK ──────────────────────────────────────

export function useCSVImport() {
  const [file, setFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState('');
  const [parsed, setParsed] = useState<ParsedRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const loadFile = useCallback(async (f: File) => {
    setFile(f);
    setResult(null);
    setError(null);
    const text = await f.text();
    setRawText(text);
    setHeaders(getCSVHeaders(text));
  }, []);

  const parseFile = useCallback((tipo: ImportType, mapping?: ColumnMapping) => {
    if (!rawText) return [];

    let rows: ParsedRow[];
    switch (tipo) {
      case 'PUBLICWWW_EXPORT':
        rows = parsePublicWWW(rawText);
        break;
      case 'SEMRUSH_BULK':
        rows = parseSemrushBulk(rawText);
        break;
      case 'SEMRUSH_COMPARISON':
        rows = parseSemrushComparison(rawText);
        break;
      case 'MANUAL_CSV':
        rows = parseManualCSV(rawText, mapping || { dominio: 0 });
        break;
      default:
        rows = [];
    }

    const deduped = deduplicateRows(rows);
    setParsed(deduped);
    return deduped;
  }, [rawText]);

  const processImport = useCallback(async (
    tipo: ImportType,
    rows: ParsedRow[],
    config: { footprint?: string; filtroTrafegoMin?: number } = {}
  ) => {
    setProcessing(true);
    setProgress(0);
    setError(null);

    try {
      // Get workspace
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const { data: member } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', user.id)
        .limit(1)
        .single();

      if (!member) throw new Error('Workspace não encontrado');
      const wsId = member.workspace_id;

      // Get existing ofertas by domain
      const allDomains = rows.map(r => r.dominio);
      const { data: existentes } = await supabase
        .from('ofertas')
        .select('id, dominio_principal, trafego_atual')
        .eq('workspace_id', wsId)
        .in('dominio_principal', allDomains);

      const existMap = new Map((existentes || []).map(e => [e.dominio_principal, e]));
      setProgress(10);

      const res: ImportResult = { created: 0, updated: 0, skipped: 0, errors: 0, dominiosNovos: 0 };

      // Batch processing
      const BATCH = 50;
      const toCreate: any[] = [];
      const toUpdate: { id: string; data: any }[] = [];
      const fontesCaptura: any[] = [];
      const trafegoEntries: any[] = [];

      for (const row of rows) {
        // Traffic filter
        if (config.filtroTrafegoMin && row.trafego && row.trafego < config.filtroTrafegoMin) {
          res.skipped++;
          continue;
        }

        const existing = existMap.get(row.dominio);

        if (existing) {
          // Update trafego if we have new data
          if (row.trafego && row.trafego > 0) {
            toUpdate.push({
              id: existing.id,
              data: {
                trafego_atual: row.trafego,
                trafego_atualizado_em: new Date().toISOString(),
              },
            });
            res.updated++;
          } else {
            res.skipped++;
          }

          // Add fonte_captura if PublicWWW
          if (tipo === 'PUBLICWWW_EXPORT' && row.url) {
            fontesCaptura.push({
              workspace_id: wsId,
              oferta_id: existing.id,
              metodo: 'PUBLICWWW',
              query_usada: config.footprint || null,
              footprint_usado: config.footprint || null,
              resultado_bruto: row.snippet || null,
            });
          }
        } else {
          // Create new oferta
          const nome = row.nome || row.dominio.split('.')[0];
          toCreate.push({
            workspace_id: wsId,
            nome,
            slug: nome.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
            dominio_principal: row.dominio,
            status_spy: 'RADAR',
            prioridade: 'MEDIA',
            nicho: row.nicho || null,
            trafego_atual: row.trafego || null,
            trafego_atualizado_em: row.trafego ? new Date().toISOString() : null,
          });
          res.created++;
          res.dominiosNovos++;
        }

        // Semrush Bulk → trafego_historico
        if (tipo === 'SEMRUSH_BULK' && row.trafego) {
          trafegoEntries.push({
            workspace_id: wsId,
            dominio: row.dominio,
            periodo_tipo: 'MENSAL',
            periodo_data: new Date().toISOString().split('T')[0],
            fonte_dados: 'semrush_csv',
            visitas: row.trafego,
            visitas_unicas: row.visitas_unicas || null,
            pages_per_visit: row.pages_per_visit || null,
            bounce_rate: row.bounce_rate || null,
            avg_visit_duration: row.avg_visit_duration || null,
          });
        }

        // Semrush Comparison → trafego_historico (monthly)
        if (tipo === 'SEMRUSH_COMPARISON' && row.monthly) {
          for (const m of row.monthly) {
            trafegoEntries.push({
              workspace_id: wsId,
              dominio: row.dominio,
              periodo_tipo: 'MENSAL',
              periodo_data: m.date,
              fonte_dados: 'semrush_csv',
              visitas: m.visits,
            });
          }
        }
      }

      setProgress(30);

      // Batch insert new ofertas
      if (toCreate.length > 0) {
        for (let i = 0; i < toCreate.length; i += BATCH) {
          const batch = toCreate.slice(i, i + BATCH);
          const { data: created, error: err } = await supabase
            .from('ofertas')
            .insert(batch)
            .select('id, dominio_principal');

          if (err) {
            console.error('Batch insert error:', err);
            res.errors += batch.length;
            res.created -= batch.length;
          } else if (created) {
            // Map created IDs back for fontes_captura
            created.forEach(o => existMap.set(o.dominio_principal!, o as any));

            // Add fontes_captura for PublicWWW new entries
            if (tipo === 'PUBLICWWW_EXPORT') {
              for (const o of created) {
                const row = rows.find(r => r.dominio === o.dominio_principal);
                if (row?.url) {
                  fontesCaptura.push({
                    workspace_id: wsId,
                    oferta_id: o.id,
                    metodo: 'PUBLICWWW',
                    query_usada: config.footprint || null,
                    footprint_usado: config.footprint || null,
                    resultado_bruto: row.snippet || null,
                  });
                }
              }
            }

            // Add trafego_historico entries for new ofertas (Semrush)
            if (tipo === 'SEMRUSH_BULK') {
              for (const o of created) {
                const existingEntries = trafegoEntries.filter(t => t.dominio === o.dominio_principal);
                existingEntries.forEach(t => t.oferta_id = o.id);
              }
            }
          }

          setProgress(30 + Math.round(((i + batch.length) / toCreate.length) * 30));
        }
      }

      setProgress(65);

      // Batch update existing ofertas
      for (const upd of toUpdate) {
        await supabase.from('ofertas').update(upd.data).eq('id', upd.id);
      }
      setProgress(75);

      // Insert fontes_captura
      if (fontesCaptura.length > 0) {
        for (let i = 0; i < fontesCaptura.length; i += BATCH) {
          await supabase.from('fontes_captura').insert(fontesCaptura.slice(i, i + BATCH));
        }
      }
      setProgress(85);

      // Insert trafego_historico
      if (trafegoEntries.length > 0) {
        for (let i = 0; i < trafegoEntries.length; i += BATCH) {
          await supabase.from('trafego_historico').insert(trafegoEntries.slice(i, i + BATCH));
        }
      }
      setProgress(90);

      // Create comparacao_batch for Semrush Comparison
      if (tipo === 'SEMRUSH_COMPARISON' && rows.length > 0) {
        await supabase.from('comparacao_batches').insert({
          workspace_id: wsId,
          nome: `Comparação ${new Date().toLocaleDateString('pt-BR')}`,
          dominios: rows.map(r => r.dominio),
        });
      }

      // Register import_batch
      await supabase.from('import_batches').insert({
        workspace_id: wsId,
        tipo,
        arquivo_nome: file?.name || 'unknown',
        total_linhas: rows.length,
        linhas_importadas: res.created + res.updated,
        linhas_ignoradas: res.skipped,
        linhas_erro: res.errors,
        ofertas_novas_criadas: res.created,
        ofertas_existentes_atualizadas: res.updated,
        dominios_novos: res.dominiosNovos,
        config: { footprint: config.footprint, filtro_trafego_min: config.filtroTrafegoMin },
        status: 'DONE',
      });

      setProgress(100);
      setResult(res);

      queryClient.invalidateQueries({ queryKey: ['ofertas'] });
      queryClient.invalidateQueries({ queryKey: ['import-batches'] });

      toast({
        title: '✅ Import concluído!',
        description: `${res.created} criadas, ${res.updated} atualizadas, ${res.skipped} ignoradas`,
      });
    } catch (err: any) {
      setError(err.message);
      toast({ title: 'Erro no import', description: err.message, variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  }, [file, queryClient, toast]);

  const reset = useCallback(() => {
    setFile(null);
    setRawText('');
    setParsed([]);
    setHeaders([]);
    setProgress(0);
    setResult(null);
    setError(null);
  }, []);

  return {
    file, rawText, parsed, headers,
    processing, progress, result, error,
    loadFile, parseFile, processImport, reset,
  };
}
