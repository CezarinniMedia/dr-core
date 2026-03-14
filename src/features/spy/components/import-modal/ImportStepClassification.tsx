import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { ALL_TYPES, type FileEntry } from "./types";
import type { CsvType } from "@/shared/lib/csvClassifier";

interface ImportStepClassificationProps {
  files: FileEntry[];
  matching: boolean;
  progressLabel: string;
  onUpdateFileType: (idx: number, newType: CsvType) => void;
  onUpdateFilePeriod: (idx: number, period: string) => void;
  onApplyTypeToAll: (newType: CsvType) => void;
  onApplyPeriodToAll: (period: string) => void;
  onToggleColumn: (fileIdx: number, colIdx: number) => void;
  onToggleRow: (fileIdx: number, rowIdx: number) => void;
  onBack: () => void;
  onNext: () => void;
}

export function ImportStepClassification({
  files, matching, progressLabel,
  onUpdateFileType, onUpdateFilePeriod, onApplyTypeToAll, onApplyPeriodToAll,
  onToggleColumn, onToggleRow, onBack, onNext,
}: ImportStepClassificationProps) {
  return (
    <div className="space-y-4">
      {files.map((f, i) => (
        <div key={i} className="border rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium flex-1 truncate">{f.name}</span>
            <Select value={f.classified.type} onValueChange={(v) => onUpdateFileType(i, v as CsvType)}>
              <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ALL_TYPES.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {files.length > 1 && (
              <Button variant="ghost" size="sm" className="text-[10px] h-7 px-2 whitespace-nowrap" onClick={() => onApplyTypeToAll(f.classified.type)}>
                Aplicar a todos
              </Button>
            )}
          </div>

          {f.classified.type !== "publicwww" && f.classified.type !== "unknown" && f.classified.type !== "similarweb" && (
            <div className="flex items-center gap-2 flex-wrap">
              <Label className="text-xs whitespace-nowrap">Período:</Label>
              <Select
                value={f.classified.periodDate ? new Date(f.classified.periodDate + "T00:00:00").toISOString().slice(5, 7) : ""}
                onValueChange={(month) => {
                  const year = f.classified.periodDate ? f.classified.periodDate.slice(0, 4) : new Date().getFullYear().toString();
                  onUpdateFilePeriod(i, `${year}-${month}-01`);
                }}
              >
                <SelectTrigger className="w-[110px] text-xs h-8"><SelectValue placeholder="Mês" /></SelectTrigger>
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
                  onUpdateFilePeriod(i, `${year}-${month}-01`);
                }}
              >
                <SelectTrigger className="w-[90px] text-xs h-8"><SelectValue placeholder="Ano" /></SelectTrigger>
                <SelectContent>
                  {["2024", "2025", "2026", "2027"].map(y => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {f.classified.periodLabel && (
                <span className="text-[10px] text-muted-foreground">({f.classified.periodLabel})</span>
              )}
              {files.length > 1 && f.classified.periodDate && (
                <Button variant="ghost" size="sm" className="text-[10px] h-7 px-2 whitespace-nowrap" onClick={() => onApplyPeriodToAll(f.classified.periodDate!)}>
                  Aplicar a todos
                </Button>
              )}
            </div>
          )}

          {f.classified.type === "similarweb" && (() => {
            const monthHeaders = f.classified.headers
              .filter(h => h.toLowerCase().startsWith("estimatedmonthlyvisits/"))
              .map(h => { const m = h.match(/(\d{4})-(\d{2})/); return m ? `${m[1]}-${m[2]}-01` : null; })
              .filter(Boolean).sort() as string[];
            if (monthHeaders.length === 0) return null;
            const MONTH_NAMES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
            const fmtDate = (d: string) => { const [y, mo] = d.split("-"); return `${MONTH_NAMES[parseInt(mo) - 1]} ${y}`; };
            return (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Períodos detectados: <span className="font-medium text-foreground">{fmtDate(monthHeaders[0])} – {fmtDate(monthHeaders[monthHeaders.length - 1])}</span> ({monthHeaders.length} {monthHeaders.length === 1 ? "mês" : "meses"})
                </span>
              </div>
            );
          })()}

          <div className="text-xs text-muted-foreground">
            {f.processed.summary.totalDomains > 0 && `${f.processed.summary.totalDomains} domínios`}
            {f.processed.summary.totalTrafficRecords > 0 && ` · ${f.processed.summary.totalTrafficRecords} registros de tráfego`}
            {f.processed.geoData.length > 0 && ` · ${f.processed.geoData.length} dados de geo`}
          </div>

          {f.classified.previewRows.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground">Clique nos cabeçalhos ou linhas para excluir/incluir:</p>
              <div className="border rounded overflow-x-auto max-h-[160px] overflow-y-auto">
                <table className="text-[10px] w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="px-1 py-0.5 w-6"></th>
                      {(f.classified.headers.length > 0 ? f.classified.headers : (f.classified.previewRows[0] ?? []).map((_, ci) => `Col ${ci + 1}`))
                        .map((h, hi) => (
                          <th
                            key={hi}
                            className={`px-1.5 py-0.5 text-left font-medium truncate max-w-[120px] cursor-pointer hover:bg-primary/10 transition-colors ${f.excludedColumns?.has(hi) ? "line-through opacity-40" : ""}`}
                            onClick={() => onToggleColumn(i, hi)}
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
                          onClick={() => onToggleRow(i, ri)}
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

      {matching && progressLabel && (
        <p className="text-xs text-muted-foreground text-center">{progressLabel}</p>
      )}

      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack} disabled={matching}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
        </Button>
        <Button onClick={onNext} disabled={matching}>
          {matching ? (
            <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Analisando...</>
          ) : (
            <>Próximo <ArrowRight className="h-4 w-4 ml-1" /></>
          )}
        </Button>
      </div>
    </div>
  );
}
