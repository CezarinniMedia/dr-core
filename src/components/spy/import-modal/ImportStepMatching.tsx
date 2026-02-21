import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, AlertTriangle, ArrowLeft, Loader2, BarChart3 } from "lucide-react";
import type { DomainMatchInfo } from "./types";

interface ImportStepMatchingProps {
  domainMatches: DomainMatchInfo[];
  importing: boolean;
  progress: number;
  progressLabel: string;
  totalDomains: number;
  matchedDomains: number;
  newDomains: number;
  totalTraffic: number;
  onBack: () => void;
  onImport: () => void;
}

export function ImportStepMatching({
  domainMatches, importing, progress, progressLabel,
  totalDomains, matchedDomains, newDomains, totalTraffic,
  onBack, onImport,
}: ImportStepMatchingProps) {
  return (
    <div className="space-y-4">
      {domainMatches.length > 500 && (
        <p className="text-xs text-muted-foreground bg-muted/50 rounded px-3 py-1.5">
          Mostrando 500 de {domainMatches.length} domínios na prévia. Todos serão importados.
        </p>
      )}
      <div className="border rounded-lg overflow-x-auto max-h-[400px] overflow-y-auto">
        <Table style={{ minWidth: "710px" }}>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Domínio</TableHead>
              <TableHead className="w-[160px]">Tipo CSV</TableHead>
              <TableHead className="w-[150px]">No Radar?</TableHead>
              <TableHead className="w-[120px]">Ação</TableHead>
              <TableHead className="w-[100px] text-right">Dados</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {domainMatches.slice(0, 500).map(m => (
              <TableRow key={m.domain}>
                <TableCell className="font-mono text-xs truncate max-w-[180px]">{m.domain}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {m.csvTypes.map(t => (
                      <Badge key={t} variant="outline" className="text-[10px] whitespace-nowrap">{t}</Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  {m.matched ? (
                    <Badge variant="outline" className="bg-success/10 text-success text-[10px] whitespace-nowrap max-w-[140px] truncate">
                      <CheckCircle className="h-3 w-3 mr-1 shrink-0" />
                      <span className="truncate">{m.offerName}</span>
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-warning/10 text-warning text-[10px] whitespace-nowrap">
                      <AlertTriangle className="h-3 w-3 mr-1 shrink-0" />
                      Novo
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-xs whitespace-nowrap">{m.action}</TableCell>
                <TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap">
                  {m.trafficRecords > 0 && `${m.trafficRecords} tráfego`}
                  {m.newDomains > 0 && ` · ${m.newDomains} dom.`}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-muted-foreground space-y-1">
        <p className="flex items-center gap-1">
          <BarChart3 className="h-3.5 w-3.5" /> {totalDomains} domínios · {newDomains} novos · {matchedDomains} existentes · {totalTraffic} registros de tráfego
        </p>
      </div>

      {importing && (
        <div className="space-y-1">
          <Progress value={progress} className="h-2" />
          {progressLabel && <p className="text-xs text-muted-foreground text-center">{progressLabel}</p>}
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack} disabled={importing}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
        </Button>
        <Button onClick={onImport} disabled={importing}>
          {importing ? (
            <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Importando... {progress}%</>
          ) : (
            "Importar"
          )}
        </Button>
      </div>
    </div>
  );
}
