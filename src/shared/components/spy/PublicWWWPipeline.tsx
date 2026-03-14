import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useCreateSpiedOffer, useSpiedOffers } from "@/hooks/useSpiedOffers";
import { supabase } from "@/integrations/supabase/client";
import { extractDomainsFromText } from "@/lib/parseSemrushCSV";
import { CheckCircle, XCircle, Search } from "lucide-react";

interface PipelineItem {
  domain: string;
  selected: boolean;
  exists: boolean;
  existingName?: string;
  existingId?: string;
}

interface PublicWWWPipelineProps {
  open: boolean;
  onClose: () => void;
}

export function PublicWWWPipeline({ open, onClose }: PublicWWWPipelineProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [rawText, setRawText] = useState("");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<PipelineItem[]>([]);
  const [adding, setAdding] = useState(false);
  const { toast } = useToast();
  const createOffer = useCreateSpiedOffer();

  const handleProcess = async () => {
    const domains = extractDomainsFromText(rawText);
    if (domains.length === 0) {
      toast({ title: "Nenhum domínio encontrado", variant: "destructive" });
      return;
    }

    // Check which exist
    const pipelineItems: PipelineItem[] = [];
    for (const domain of domains) {
      const { data: offerMatch } = await supabase
        .from("spied_offers")
        .select("id, nome")
        .eq("main_domain", domain)
        .maybeSingle();

      let exists = false;
      let existingName: string | undefined;
      let existingId: string | undefined;

      if (offerMatch) {
        exists = true;
        existingName = offerMatch.nome;
        existingId = offerMatch.id;
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
            exists = true;
            existingName = offer.nome;
            existingId = offer.id;
          }
        }
      }

      pipelineItems.push({
        domain,
        selected: !exists,
        exists,
        existingName,
        existingId,
      });
    }

    setItems(pipelineItems);
    setStep(2);
  };

  const selectedCount = items.filter((i) => i.selected && !i.exists).length;

  const toggleAll = (selected: boolean) => {
    setItems(items.map((i) => i.exists ? i : { ...i, selected }));
  };

  const removeExisting = () => {
    setItems(items.map((i) => i.exists ? { ...i, selected: false } : i));
  };

  const handleAdd = async () => {
    setAdding(true);
    try {
      const toAdd = items.filter((i) => i.selected && !i.exists);
      for (const item of toAdd) {
        await createOffer.mutateAsync({
          nome: item.domain,
          main_domain: item.domain,
          status: "RADAR",
          discovery_source: "publicwww",
          discovery_query: query || undefined,
        });
      }
      toast({ title: `${toAdd.length} ofertas adicionadas ao radar!` });
      setStep(3);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setAdding(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setRawText("");
    setQuery("");
    setItems([]);
  };

  return (
    <Dialog open={open} onOpenChange={() => { handleReset(); onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" /> Pipeline: PublicWWW → Radar
          </DialogTitle>
          <DialogDescription>Cole os resultados do PublicWWW para triagem rápida</DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Query usada no PublicWWW (opcional)</label>
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder='Ex: scripts.converti AND pay.hotmart.com' />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Domínios</label>
              <Textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder={"Cole os domínios aqui (um por linha)\n\nchabariatrico.fun\nemagrecerja.com\nslimxpro.com.br"}
                className="min-h-[200px] font-mono text-xs"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={onClose}>Cancelar</Button>
              <Button onClick={handleProcess} disabled={!rawText.trim()}>Processar</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => toggleAll(true)}>Selecionar Todos</Button>
              <Button variant="outline" size="sm" onClick={() => toggleAll(false)}>Deselecionar Todos</Button>
              <Button variant="outline" size="sm" onClick={removeExisting}>Remover já existentes</Button>
            </div>

            <div className="border rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">✓</TableHead>
                    <TableHead className="w-10">#</TableHead>
                    <TableHead>Domínio</TableHead>
                    <TableHead>Já no Radar?</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, i) => (
                    <TableRow key={item.domain}>
                      <TableCell>
                        <Checkbox
                          checked={item.selected}
                          disabled={item.exists}
                          onCheckedChange={(checked) => {
                            setItems(items.map((it, idx) => idx === i ? { ...it, selected: !!checked } : it));
                          }}
                        />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="font-mono text-sm">{item.domain}</TableCell>
                      <TableCell>
                        {item.exists ? (
                          <Badge variant="outline" className="bg-success/10 text-success">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Sim ({item.existingName})
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-muted text-muted-foreground">
                            <XCircle className="h-3 w-3 mr-1" /> Não
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <p className="text-sm text-muted-foreground">
              {selectedCount} domínios selecionados para adicionar
            </p>

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={handleReset}>Voltar</Button>
              <Button onClick={handleAdd} disabled={selectedCount === 0 || adding}>
                {adding ? "Adicionando..." : `Adicionar ${selectedCount} ao Radar`}
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-4 space-y-3">
                <p className="font-medium">Próximos passos sugeridos:</p>
                <ol className="list-decimal list-inside space-y-1.5 text-sm text-muted-foreground">
                  <li>Copie os domínios adicionados (200 por vez)</li>
                  <li>Cole no Semrush Bulk Analysis</li>
                  <li>Exporte o CSV do Semrush</li>
                  <li>Use "Importar Tráfego" para importar os dados</li>
                  <li>Ordene por tráfego e analise os mais promissores</li>
                </ol>
              </CardContent>
            </Card>
            <div className="flex justify-end">
              <Button onClick={() => { handleReset(); onClose(); }}>Fechar</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
