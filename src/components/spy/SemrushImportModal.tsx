import { useState, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { parseSemrushCSV, detectDelimiter, SemrushTrafficRow } from "@/lib/parseSemrushCSV";
import { useCreateSpiedOffer, useBulkInsertTrafficData } from "@/hooks/useSpiedOffers";
import { supabase } from "@/integrations/supabase/client";
import { Upload, FileSpreadsheet, CheckCircle, AlertTriangle } from "lucide-react";
import { useDropzone } from "react-dropzone";

interface DomainMatch {
  domain: string;
  months: string[];
  totalRecords: number;
  matched: boolean;
  offerId?: string;
  offerName?: string;
}

interface SemrushImportModalProps {
  open: boolean;
  onClose: () => void;
}

export function SemrushImportModal({ open, onClose }: SemrushImportModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [csvText, setCsvText] = useState("");
  const [parsedRows, setParsedRows] = useState<SemrushTrafficRow[]>([]);
  const [domainMatches, setDomainMatches] = useState<DomainMatch[]>([]);
  const [importing, setImporting] = useState(false);
  const [detectedDelimiter, setDetectedDelimiter] = useState<string>("");
  const [selectedDelimiter, setSelectedDelimiter] = useState<string>("auto");
  const { toast } = useToast();
  const createOffer = useCreateSpiedOffer();
  const bulkInsert = useBulkInsertTrafficData();

  const onDrop = useCallback((files: File[]) => {
    if (files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => setCsvText(e.target?.result as string || "");
      reader.readAsText(files[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"], "text/plain": [".txt"] },
    maxFiles: 1,
  });

  // Auto-detect delimiter when csvText changes
  useEffect(() => {
    if (csvText.trim()) {
      const detected = detectDelimiter(csvText);
      setDetectedDelimiter(detected);
    } else {
      setDetectedDelimiter("");
    }
  }, [csvText]);

  const getEffectiveDelimiter = () => {
    if (selectedDelimiter === "auto") return detectedDelimiter || undefined;
    return selectedDelimiter;
  };

  const handleParse = async () => {
    if (!csvText.trim()) return;
    const rows = parseSemrushCSV(csvText, getEffectiveDelimiter());
    if (rows.length === 0) {
      toast({ title: "Nenhum dado encontrado", description: "Verifique o formato do CSV.", variant: "destructive" });
      return;
    }
    setParsedRows(rows);

    // Group by domain
    const domainMap = new Map<string, SemrushTrafficRow[]>();
    for (const r of rows) {
      if (!domainMap.has(r.domain)) domainMap.set(r.domain, []);
      domainMap.get(r.domain)!.push(r);
    }

    // Match against existing offers
    const matches: DomainMatch[] = [];
    for (const [domain, records] of domainMap) {
      const months = [...new Set(records.map((r) => r.period_date))].sort();
      const match: DomainMatch = {
        domain,
        months,
        totalRecords: records.length,
        matched: false,
      };

      // Check spied_offers.main_domain
      const { data: offerMatch } = await supabase
        .from("spied_offers")
        .select("id, nome")
        .eq("main_domain", domain)
        .maybeSingle();

      if (offerMatch) {
        match.matched = true;
        match.offerId = offerMatch.id;
        match.offerName = offerMatch.nome;
      } else {
        // Check offer_domains
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
          }
        }
      }

      matches.push(match);
    }

    setDomainMatches(matches);
    setStep(2);
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      const domainMap = new Map<string, SemrushTrafficRow[]>();
      for (const r of parsedRows) {
        if (!domainMap.has(r.domain)) domainMap.set(r.domain, []);
        domainMap.get(r.domain)!.push(r);
      }

      let imported = 0;
      for (const match of domainMatches) {
        let offerId = match.offerId;

        // Create new offer for unmatched domains
        if (!offerId) {
          const newOffer = await createOffer.mutateAsync({
            nome: match.domain,
            main_domain: match.domain,
            status: "RADAR",
            discovery_source: "semrush",
          });
          offerId = newOffer.id;
        }

        const records = domainMap.get(match.domain) || [];
        if (records.length > 0) {
          await bulkInsert.mutateAsync({
            offerId,
            records: records.map((r) => ({
              domain: r.domain,
              period_date: r.period_date,
              visits: r.visits,
              period_type: r.period_type,
            })),
          });
          imported += records.length;
        }
      }

      toast({ title: `✅ Importação concluída! ${imported} registros para ${domainMatches.length} domínios` });
      handleReset();
      onClose();
    } catch (err: any) {
      toast({ title: "Erro na importação", description: err.message, variant: "destructive" });
    } finally {
      setImporting(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setCsvText("");
    setParsedRows([]);
    setDomainMatches([]);
    setDetectedDelimiter("");
    setSelectedDelimiter("auto");
  };

  const formatDateRange = (months: string[]) => {
    if (months.length === 0) return "—";
    const fmt = (d: string) => {
      const [y, m] = d.split("-");
      const names = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
      return `${names[parseInt(m) - 1]} ${y.slice(2)}`;
    };
    return `${fmt(months[0])} → ${fmt(months[months.length - 1])} (${months.length} meses)`;
  };

  return (
    <Dialog open={open} onOpenChange={() => { handleReset(); onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" /> Importar Dados de Tráfego
          </DialogTitle>
          <DialogDescription>Cole o CSV exportado do Semrush (Bulk Analysis)</DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-primary/50"
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Arraste o arquivo CSV aqui ou clique para selecionar
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Ou cole o conteúdo do CSV aqui:</p>
              <Textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder={"Domain,Oct 2024,Nov 2024,Dec 2024\nchabariatrico.fun,12500,15800,22300\n..."}
                className="min-h-[150px] font-mono text-xs"
              />
            </div>

            {csvText.trim() && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Separador:</span>
                <Select value={selectedDelimiter} onValueChange={setSelectedDelimiter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">
                      Auto-detectado: {detectedDelimiter === "," ? "Vírgula (,)" : detectedDelimiter === ";" ? "Ponto e vírgula (;)" : detectedDelimiter === "\t" ? "Tab" : detectedDelimiter === "|" ? "Pipe (|)" : "..."}
                    </SelectItem>
                    <SelectItem value=",">Vírgula (,)</SelectItem>
                    <SelectItem value=";">Ponto e vírgula (;)</SelectItem>
                    <SelectItem value="&#9;">Tab</SelectItem>
                    <SelectItem value="|">Pipe (|)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={onClose}>Cancelar</Button>
              <Button onClick={handleParse} disabled={!csvText.trim()}>Processar CSV</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Domínio</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Status no Radar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {domainMatches.map((m) => (
                    <TableRow key={m.domain}>
                      <TableCell className="font-mono text-sm">{m.domain}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatDateRange(m.months)}</TableCell>
                      <TableCell>
                        {m.matched ? (
                          <Badge variant="outline" className="bg-success/10 text-success">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Encontrado ({m.offerName})
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-warning/10 text-warning">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Será criado
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="text-sm text-muted-foreground space-y-1">
              <p>{domainMatches.length} domínios, {parsedRows.length} registros de tráfego</p>
              {domainMatches.filter((m) => !m.matched).length > 0 && (
                <p>Novos que serão criados: {domainMatches.filter((m) => !m.matched).length}</p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={handleReset}>Voltar</Button>
              <Button onClick={handleImport} disabled={importing}>
                {importing ? "Importando..." : "Importar"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
