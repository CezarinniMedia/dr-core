import { useState, useCallback } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCreateSpiedOffer, useBulkInsertTrafficData } from "@/hooks/useSpiedOffers";
import { useQueryClient } from "@tanstack/react-query";
import {
  classifyCsv, processCsv, detectDelimiter, extractDomain as extractDomainUtil, filterCsvData, getDefaultExcludedColumns,
  type ClassifiedCsv, type CsvType, type ProcessedCsvResult, type ExtractedDomain,
} from "@/lib/csvClassifier";

// Re-export extractPeriodFromFilename for type override
function extractPeriodFromFilename(fileName: string): { date: string; label: string } | null {
  const match = fileName.match(/([a-záéíóúâêîôûãõç]+)\.?\s*(?:de\s+)?(\d{4})/i);
  if (!match) return null;
  const MONTH_MAP: Record<string, number> = {
    jan: 1, janeiro: 1, january: 1, fev: 2, feb: 2, fevereiro: 2, february: 2,
    mar: 3, março: 3, marco: 3, march: 3, abr: 4, apr: 4, abril: 4, april: 4,
    mai: 5, may: 5, maio: 5, jun: 6, junho: 6, june: 6, jul: 7, julho: 7, july: 7,
    ago: 8, aug: 8, agosto: 8, august: 8, set: 9, sep: 9, setembro: 9, september: 9,
    out: 10, oct: 10, outubro: 10, october: 10, nov: 11, novembro: 11, november: 11,
    dez: 12, dec: 12, dezembro: 12, december: 12,
  };
  const monthKey = match[1].toLowerCase().replace(/\.$/, "");
  const month = MONTH_MAP[monthKey];
  if (!month) return null;
  return { date: `${match[2]}-${String(month).padStart(2, "0")}-01`, label: match[0].trim() };
}
import {
  Upload, FileSpreadsheet, CheckCircle, AlertTriangle, ArrowRight, ArrowLeft, Loader2, X,
} from "lucide-react";
import { useDropzone } from "react-dropzone";

interface FileEntry {
  name: string;
  text: string;
  classified: ClassifiedCsv;
  processed: ProcessedCsvResult;
  delimiterOverride?: string;
  excludedColumns?: Set<number>;
  excludedRows?: Set<number>;
}

interface DomainMatchInfo {
  domain: string;
  matched: boolean;
  offerId?: string;
  offerName?: string;
  action: string;
  csvTypes: string[];
  trafficRecords: number;
  newDomains: number;
}

const TYPE_COLORS: Record<CsvType, string> = {
  publicwww: "bg-success/20 text-success",
  semrush_bulk: "bg-info/20 text-info",
  semrush_geo: "bg-warning/20 text-warning",
  semrush_pages: "bg-primary/20 text-primary",
  semrush_subdomains: "bg-accent/20 text-accent",
  semrush_subfolders: "bg-accent/20 text-accent",
  semrush_traffic_trend: "bg-destructive/20 text-destructive",
  semrush_summary: "bg-muted text-muted-foreground",
  semrush_bulk_historical: "bg-info/20 text-info",
  unknown: "bg-muted text-muted-foreground",
};

const ALL_TYPES: { value: CsvType; label: string }[] = [
  { value: "publicwww", label: "PublicWWW" },
  { value: "semrush_bulk", label: "Semrush Bulk" },
  { value: "semrush_geo", label: "Semrush Geo" },
  { value: "semrush_pages", label: "Semrush Páginas" },
  { value: "semrush_subdomains", label: "Semrush Subdomínios" },
  { value: "semrush_subfolders", label: "Semrush Subpastas" },
  { value: "semrush_traffic_trend", label: "Semrush Tendência" },
  { value: "semrush_summary", label: "Semrush Resumo" },
  { value: "semrush_bulk_historical", label: "Semrush Bulk Histórico" },
];

interface UniversalImportModalProps {
  open: boolean;
  onClose: () => void;
}

export function UniversalImportModal({ open, onClose }: UniversalImportModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [pasteText, setPasteText] = useState("");
  const [pasteDelimiter, setPasteDelimiter] = useState("auto");
  const [footprintQuery, setFootprintQuery] = useState("");
  const [domainMatches, setDomainMatches] = useState<DomainMatchInfo[]>([]);
  const [importing, setImporting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [progress, setProgress] = useState(0);
  const [importResult, setImportResult] = useState<{ newOffers: number; updated: number; trafficRecords: number } | null>(null);
  const { toast } = useToast();
  const createOffer = useCreateSpiedOffer();
  const bulkInsert = useBulkInsertTrafficData();
  const queryClient = useQueryClient();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploading(true);
    setUploadProgress(0);
    let loaded = 0;
    const total = acceptedFiles.length;

    for (const file of acceptedFiles) {
      const reader = new FileReader();
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          setUploadProgress(Math.round(((loaded + e.loaded / e.total) / total) * 100));
        }
      };
      reader.onload = (e) => {
        loaded++;
        setUploadProgress(Math.round((loaded / total) * 100));
        const text = e.target?.result as string || "";
        const classified = classifyCsv(text, file.name);
        // Auto-exclude irrelevant columns based on CSV type
        const autoExcluded = getDefaultExcludedColumns(classified.type, classified.headers);
        const filtered = autoExcluded.size > 0 ? filterCsvData(classified, autoExcluded, new Set()) : classified;
        const processed = processCsv(filtered);
        setFiles(prev => [...prev, {
          name: file.name, text, classified, processed,
          excludedColumns: autoExcluded.size > 0 ? autoExcluded : undefined,
        }]);
        if (classified.discoveryQuery && !footprintQuery) {
          setFootprintQuery(classified.discoveryQuery);
        }
        if (loaded === total) setUploading(false);
      };
      reader.onerror = () => {
        loaded++;
        if (loaded === total) setUploading(false);
      };
      reader.readAsText(file);
    }
  }, [footprintQuery]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"], "text/plain": [".txt"] },
    multiple: true,
  });

  const handleAddPaste = () => {
    if (!pasteText.trim()) return;
    const delim = pasteDelimiter === "auto" ? undefined : pasteDelimiter;
    const classified = classifyCsv(pasteText, undefined, delim);
    const processed = processCsv(classified);
    setFiles(prev => [...prev, { name: "Colado", text: pasteText, classified, processed }]);
    if (classified.discoveryQuery && !footprintQuery) {
      setFootprintQuery(classified.discoveryQuery);
    }
    setPasteText("");
  };

  const removeFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const updateFileType = (idx: number, newType: CsvType) => {
    setFiles(prev => prev.map((f, i) => {
      if (i !== idx) return f;
      const reclassified = { ...f.classified, type: newType, label: ALL_TYPES.find(t => t.value === newType)?.label || newType };
      // Re-extract period from filename when type changes
      if (f.name && f.name !== "Colado") {
        const periodInfo = extractPeriodFromFilename(f.name);
        if (periodInfo) {
          reclassified.periodDate = periodInfo.date;
          reclassified.periodLabel = periodInfo.label;
        }
      }
      return { ...f, classified: reclassified, processed: processCsv(reclassified) };
    }));
  };

  const updateFilePeriod = (idx: number, period: string) => {
    setFiles(prev => prev.map((f, i) => {
      if (i !== idx) return f;
      const updated = { ...f.classified, periodDate: period };
      return { ...f, classified: updated, processed: processCsv(updated) };
    }));
  };

  const toggleColumn = (fileIdx: number, colIdx: number) => {
    setFiles(prev => prev.map((f, i) => {
      if (i !== fileIdx) return f;
      const exc = new Set(f.excludedColumns || []);
      if (exc.has(colIdx)) exc.delete(colIdx); else exc.add(colIdx);
      // Reprocess with filtered data
      const filtered = filterCsvData(f.classified, exc, f.excludedRows || new Set());
      return { ...f, excludedColumns: exc, processed: processCsv(filtered) };
    }));
  };

  const toggleRow = (fileIdx: number, rowIdx: number) => {
    setFiles(prev => prev.map((f, i) => {
      if (i !== fileIdx) return f;
      const exc = new Set(f.excludedRows || []);
      if (exc.has(rowIdx)) exc.delete(rowIdx); else exc.add(rowIdx);
      const filtered = filterCsvData(f.classified, f.excludedColumns || new Set(), exc);
      return { ...f, excludedRows: exc, processed: processCsv(filtered) };
    }));
  };

  // Step 2 -> 3: Match domains
  const handleMatchDomains = async () => {
    const allDomains = new Map<string, { csvTypes: Set<string>; trafficRecords: number; newDomains: number }>();

    for (const file of files) {
      const p = file.processed;
      for (const d of p.domains) {
        if (!allDomains.has(d.domain)) {
          allDomains.set(d.domain, { csvTypes: new Set(), trafficRecords: 0, newDomains: 0 });
        }
        allDomains.get(d.domain)!.csvTypes.add(file.classified.label);
        allDomains.get(d.domain)!.newDomains++;
      }
      for (const t of p.trafficRecords) {
        if (!allDomains.has(t.domain)) {
          allDomains.set(t.domain, { csvTypes: new Set(), trafficRecords: 0, newDomains: 0 });
        }
        allDomains.get(t.domain)!.csvTypes.add(file.classified.label);
        allDomains.get(t.domain)!.trafficRecords++;
      }
      for (const g of p.geoData) {
        if (!allDomains.has(g.domain)) {
          allDomains.set(g.domain, { csvTypes: new Set(), trafficRecords: 0, newDomains: 0 });
        }
        allDomains.get(g.domain)!.csvTypes.add(file.classified.label);
      }
    }

    const matches: DomainMatchInfo[] = [];
    for (const [domain, info] of allDomains) {
      const match: DomainMatchInfo = {
        domain,
        matched: false,
        action: "Criar nova oferta",
        csvTypes: [...info.csvTypes],
        trafficRecords: info.trafficRecords,
        newDomains: info.newDomains,
      };

      const { data: offerMatch } = await supabase
        .from("spied_offers")
        .select("id, nome")
        .eq("main_domain", domain)
        .maybeSingle();

      if (offerMatch) {
        match.matched = true;
        match.offerId = offerMatch.id;
        match.offerName = offerMatch.nome;
        match.action = "Atualizar existente";
      } else {
        const { data: domainMatch } = await supabase
          .from("offer_domains")
          .select("spied_offer_id")
          .eq("domain", domain)
          .maybeSingle();
        if (domainMatch) {
          const { data: offer } = await supabase
            .from("spied_offers")
            .select("id, nome")
            .eq("id", domainMatch.spied_offer_id)
            .maybeSingle();
          if (offer) {
            match.matched = true;
            match.offerId = offer.id;
            match.offerName = offer.nome;
            match.action = "Atualizar existente";
          }
        }
      }
      matches.push(match);
    }

    setDomainMatches(matches);
    setStep(3);
  };

  const handleImport = async () => {
    setImporting(true);
    setProgress(0);
    let newOffers = 0;
    let updated = 0;
    let trafficCount = 0;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: member } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", user?.id ?? "")
        .single();
      const workspaceId = member?.workspace_id;
      if (!workspaceId) throw new Error("Workspace não encontrado");

      // Build offerId map
      const offerIdMap = new Map<string, string>();
      const totalSteps = domainMatches.length + files.length;
      let currentStep = 0;

      // Create missing offers
      for (const match of domainMatches) {
        if (match.matched && match.offerId) {
          offerIdMap.set(match.domain, match.offerId);
          updated++;
        } else {
          const newOffer = await createOffer.mutateAsync({
            nome: match.domain,
            main_domain: match.domain,
            status: "RADAR",
            discovery_source: files[0]?.classified.type || "manual",
            discovery_query: footprintQuery || undefined,
          });
          offerIdMap.set(match.domain, newOffer.id);
          newOffers++;
        }
        currentStep++;
        setProgress(Math.round((currentStep / totalSteps) * 100));
      }

      // Process each file: domains FIRST, then traffic, then geo
      for (const file of files) {
        const p = file.processed;

        // 1. Insert domains first
        for (const d of p.domains) {
          const offerId = offerIdMap.get(d.domain) || findOfferForSubdomain(d.domain, offerIdMap);
          if (!offerId) continue;

          // Check if domain already exists (dedup by domain string OR url)
          const { data: existing } = await supabase
            .from("offer_domains")
            .select("id, first_seen")
            .eq("spied_offer_id", offerId)
            .eq("domain", d.domain)
            .maybeSingle();

          if (!existing) {
            // Also check by URL for subfolders
            let existsByUrl = false;
            if (d.url) {
              const { data: urlMatch } = await supabase
                .from("offer_domains")
                .select("id")
                .eq("spied_offer_id", offerId)
                .eq("url", d.url)
                .maybeSingle();
              existsByUrl = !!urlMatch;
            }

            if (!existsByUrl) {
              await supabase.from("offer_domains").insert({
                spied_offer_id: offerId,
                workspace_id: workspaceId,
                domain: d.domain,
                domain_type: d.domain_type,
                url: d.url || null,
                discovery_source: d.discovery_source,
                discovery_query: d.discovery_query || footprintQuery || null,
                first_seen: d.first_seen || null,
                traffic_share: d.traffic_share || null,
                notas: d.notas || null,
              } as any);
            }
          } else if (d.first_seen && existing.first_seen && d.first_seen < existing.first_seen) {
            // Update first_seen if imported date is older
            await supabase.from("offer_domains").update({
              first_seen: d.first_seen,
            } as any).eq("id", existing.id);
          }
        }

        // 2. Insert traffic data
        for (const [domain, records] of groupBy(p.trafficRecords, r => r.domain)) {
          const offerId = offerIdMap.get(domain) || findOfferForSubdomain(domain, offerIdMap);
          if (!offerId) continue;
          await bulkInsert.mutateAsync({
            offerId,
            records: records.map(r => ({
              domain: r.domain,
              period_date: r.period_date,
              visits: r.visits,
              unique_visitors: r.unique_visitors,
              pages_per_visit: r.pages_per_visit,
              avg_visit_duration: r.avg_visit_duration,
              bounce_rate: r.bounce_rate,
              source: r.source,
            })),
          });
          trafficCount += records.length;
        }

        // 3. Update geo data with multi-country support
        for (const geo of p.geoData) {
          const offerId = offerIdMap.get(geo.domain);
          if (!offerId || !geo.mainGeo) continue;

          // Build geo value: main + secondary (if any)
          const geoValue = geo.secondaryGeos && geo.secondaryGeos.length > 0
            ? `${geo.mainGeo}, ${geo.secondaryGeos.join(", ")}`
            : geo.mainGeo;

          // Append geo notes to existing notes
          const { data: currentOffer } = await supabase
            .from("spied_offers")
            .select("notas")
            .eq("id", offerId)
            .maybeSingle();

          const existingNotes = (currentOffer as any)?.notas || "";
          const newNotes = existingNotes
            ? `${existingNotes}\n\n${geo.geoNotes || ""}`
            : geo.geoNotes || "";

          await supabase.from("spied_offers").update({
            geo: geoValue,
            notas: newNotes.trim(),
          } as any).eq("id", offerId);
        }

        currentStep++;
        setProgress(Math.round((currentStep / totalSteps) * 100));
      }

      setImportResult({ newOffers, updated, trafficRecords: trafficCount });
      queryClient.invalidateQueries({ queryKey: ["spied-offers"] });
      setStep(4);
      toast({ title: `✅ Importação concluída!` });
    } catch (err: any) {
      toast({ title: "Erro na importação", description: err.message, variant: "destructive" });
    } finally {
      setImporting(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setFiles([]);
    setPasteText("");
    setPasteDelimiter("auto");
    setFootprintQuery("");
    setDomainMatches([]);
    setImportResult(null);
    setProgress(0);
  };

  const totalDomains = domainMatches.length;
  const matchedDomains = domainMatches.filter(m => m.matched).length;
  const newDomains = totalDomains - matchedDomains;
  const totalTraffic = domainMatches.reduce((s, m) => s + m.trafficRecords, 0);

  return (
    <Dialog open={open} onOpenChange={() => { handleReset(); onClose(); }}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" /> Importador Universal de CSV
          </DialogTitle>
          <DialogDescription>
            Importe dados do PublicWWW, Semrush Bulk, Geo, Páginas, Subdomínios e mais
          </DialogDescription>
        </DialogHeader>

        {/* Step indicators */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`flex items-center gap-1 ${step >= s ? "text-primary font-medium" : ""}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= s ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                {s}
              </span>
              {s === 1 && "Upload"}
              {s === 2 && "Classificação"}
              {s === 3 && "Matching"}
              {s === 4 && "Resultado"}
              {s < 4 && <ArrowRight className="h-3 w-3 ml-1" />}
            </div>
          ))}
        </div>

        {/* Step 1: Upload */}
        {step === 1 && (
          <div className="space-y-4">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-primary/50"
              }`}
            >
              <input {...getInputProps()} />
              {uploading ? (
                <>
                  <Loader2 className="h-8 w-8 mx-auto text-primary mb-2 animate-spin" />
                  <p className="text-sm text-muted-foreground">Processando arquivos... {uploadProgress}%</p>
                  <Progress value={uploadProgress} className="h-2 max-w-[200px] mx-auto" />
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Arraste arquivos CSV aqui ou clique para selecionar (múltiplos)
                  </p>
                </>
              )}
            </div>

            {files.length > 0 && (
              <div className="space-y-1">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 border rounded text-sm">
                    <FileSpreadsheet className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="flex-1 truncate">{f.name}</span>
                    <Badge variant="outline" className={TYPE_COLORS[f.classified.type]}>{f.classified.label}</Badge>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFile(i)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Ou cole o CSV:</p>
              <Textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder="Cole o conteúdo do CSV aqui..."
                className="min-h-[100px] font-mono text-xs"
              />
              {pasteText.trim() && (
                <div className="flex items-center gap-3">
                  <Select value={pasteDelimiter} onValueChange={setPasteDelimiter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto-detectar</SelectItem>
                      <SelectItem value=",">Vírgula (,)</SelectItem>
                      <SelectItem value=";">Ponto e vírgula (;)</SelectItem>
                      <SelectItem value="&#9;">Tab</SelectItem>
                      <SelectItem value="|">Pipe (|)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" onClick={handleAddPaste}>Adicionar</Button>
                </div>
              )}
            </div>

            <div>
              <Label className="text-xs">Query/Footprint usado (opcional)</Label>
              <Input value={footprintQuery} onChange={(e) => setFootprintQuery(e.target.value)} placeholder="Ex: cdn.utmify.com.br" />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => { handleReset(); onClose(); }}>Cancelar</Button>
              <Button onClick={() => setStep(2)} disabled={files.length === 0}>
                Próximo <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Classification */}
        {step === 2 && (
          <div className="space-y-4">
            {files.map((f, i) => (
              <div key={i} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium flex-1 truncate">{f.name}</span>
                  <Select value={f.classified.type} onValueChange={(v) => updateFileType(i, v as CsvType)}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_TYPES.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {f.classified.type !== "publicwww" && f.classified.type !== "unknown" && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <Label className="text-xs whitespace-nowrap">Período:</Label>
                    <Select
                      value={f.classified.periodDate ? new Date(f.classified.periodDate + "T00:00:00").toISOString().slice(5, 7) : ""}
                      onValueChange={(month) => {
                        const year = f.classified.periodDate ? f.classified.periodDate.slice(0, 4) : new Date().getFullYear().toString();
                        updateFilePeriod(i, `${year}-${month}-01`);
                      }}
                    >
                      <SelectTrigger className="w-[110px] text-xs h-8">
                        <SelectValue placeholder="Mês" />
                      </SelectTrigger>
                      <SelectContent>
                        {["01","02","03","04","05","06","07","08","09","10","11","12"].map(m => (
                          <SelectItem key={m} value={m}>
                            {new Date(2026, parseInt(m) - 1).toLocaleDateString("pt-BR", { month: "long" })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={f.classified.periodDate ? f.classified.periodDate.slice(0, 4) : ""}
                      onValueChange={(year) => {
                        const month = f.classified.periodDate ? f.classified.periodDate.slice(5, 7) : "01";
                        updateFilePeriod(i, `${year}-${month}-01`);
                      }}
                    >
                      <SelectTrigger className="w-[90px] text-xs h-8">
                        <SelectValue placeholder="Ano" />
                      </SelectTrigger>
                      <SelectContent>
                        {["2024", "2025", "2026", "2027"].map(y => (
                          <SelectItem key={y} value={y}>{y}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {f.classified.periodLabel && (
                      <span className="text-[10px] text-muted-foreground">({f.classified.periodLabel})</span>
                    )}
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  {f.processed.summary.totalDomains > 0 && `${f.processed.summary.totalDomains} domínios`}
                  {f.processed.summary.totalTrafficRecords > 0 && ` · ${f.processed.summary.totalTrafficRecords} registros de tráfego`}
                  {f.processed.geoData.length > 0 && ` · ${f.processed.geoData.length} dados de geo`}
                </div>

                {/* Preview with column/row selection */}
                {f.classified.previewRows.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground">Clique nos cabeçalhos ou linhas para excluir/incluir:</p>
                    <div className="border rounded overflow-x-auto max-h-[160px] overflow-y-auto">
                      <table className="text-[10px] w-full">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="px-1 py-0.5 w-6"></th>
                            {(f.classified.headers.length > 0 ? f.classified.headers : f.classified.previewRows[0]?.map((_, ci) => `Col ${ci + 1}`))
                              .map((h, hi) => (
                                <th
                                  key={hi}
                                  className={`px-1.5 py-0.5 text-left font-medium truncate max-w-[120px] cursor-pointer hover:bg-primary/10 transition-colors ${f.excludedColumns?.has(hi) ? "line-through opacity-40" : ""}`}
                                  onClick={() => toggleColumn(i, hi)}
                                  title={f.excludedColumns?.has(hi) ? "Clique para incluir" : "Clique para excluir"}
                                >
                                  {h}
                                </th>
                              ))}
                          </tr>
                        </thead>
                        <tbody>
                          {f.classified.previewRows.map((row, ri) => (
                            <tr key={ri} className={`border-t border-muted/30 ${f.excludedRows?.has(ri) ? "opacity-40 line-through" : ""}`}>
                              <td
                                className="px-1 py-0.5 cursor-pointer hover:bg-destructive/10 text-center"
                                onClick={() => toggleRow(i, ri)}
                                title={f.excludedRows?.has(ri) ? "Incluir linha" : "Excluir linha"}
                              >
                                {f.excludedRows?.has(ri) ? "✗" : "✓"}
                              </td>
                              {row.map((cell, ci) => (
                                <td key={ci} className={`px-1.5 py-0.5 truncate max-w-[120px] ${f.excludedColumns?.has(ci) ? "opacity-40" : ""}`}>{cell}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
              </Button>
              <Button onClick={handleMatchDomains}>
                Próximo <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Matching & Preview */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="border rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Domínio</TableHead>
                    <TableHead>Tipo CSV</TableHead>
                    <TableHead>No Radar?</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead className="text-right">Dados</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {domainMatches.map(m => (
                    <TableRow key={m.domain}>
                      <TableCell className="font-mono text-xs">{m.domain}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {m.csvTypes.map(t => (
                            <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {m.matched ? (
                          <Badge variant="outline" className="bg-success/10 text-success text-[10px]">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {m.offerName}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-warning/10 text-warning text-[10px]">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Novo
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs">{m.action}</TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {m.trafficRecords > 0 && `${m.trafficRecords} tráfego`}
                        {m.newDomains > 0 && ` · ${m.newDomains} dom.`}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="text-sm text-muted-foreground space-y-1">
              <p>📊 {totalDomains} domínios · {newDomains} novos · {matchedDomains} existentes · {totalTraffic} registros de tráfego</p>
            </div>

            {importing && <Progress value={progress} className="h-2" />}

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(2)} disabled={importing}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
              </Button>
              <Button onClick={handleImport} disabled={importing}>
                {importing ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Importando... {progress}%</>
                ) : (
                  "Importar"
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Result */}
        {step === 4 && importResult && (
          <div className="space-y-4">
            <div className="border rounded-lg p-6 text-center space-y-3">
              <CheckCircle className="h-12 w-12 text-success mx-auto" />
              <h3 className="text-lg font-semibold">Importação Concluída!</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>✅ {importResult.newOffers} ofertas criadas</p>
                <p>🔄 {importResult.updated} ofertas atualizadas</p>
                <p>📊 {importResult.trafficRecords} registros de tráfego importados</p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => { handleReset(); onClose(); }}>Fechar</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Helpers
function groupBy<T>(arr: T[], keyFn: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of arr) {
    const key = keyFn(item);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  }
  return map;
}

function findOfferForSubdomain(domain: string, offerIdMap: Map<string, string>): string | undefined {
  // Try to find parent domain: app.megadedicados.com.br -> megadedicados.com.br
  const parts = domain.split(".");
  for (let i = 1; i < parts.length - 1; i++) {
    const parent = parts.slice(i).join(".");
    if (offerIdMap.has(parent)) return offerIdMap.get(parent);
  }
  return undefined;
}
