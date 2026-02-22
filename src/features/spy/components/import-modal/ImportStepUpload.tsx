import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Label } from "@/shared/components/ui/label";
import { Progress } from "@/shared/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Upload, FileSpreadsheet, ArrowRight, Loader2, X } from "lucide-react";
import { TYPE_COLORS, type FileEntry } from "./types";

interface ImportStepUploadProps {
  files: FileEntry[];
  uploading: boolean;
  uploadProgress: number;
  pasteText: string;
  onPasteTextChange: (v: string) => void;
  pasteDelimiter: string;
  onPasteDelimiterChange: (v: string) => void;
  footprintQuery: string;
  onFootprintQueryChange: (v: string) => void;
  isDragActive: boolean;
  getRootProps: () => any;
  getInputProps: () => any;
  onAddPaste: () => void;
  onRemoveFile: (idx: number) => void;
  onNext: () => void;
  onCancel: () => void;
}

export function ImportStepUpload({
  files, uploading, uploadProgress,
  pasteText, onPasteTextChange, pasteDelimiter, onPasteDelimiterChange,
  footprintQuery, onFootprintQueryChange,
  isDragActive, getRootProps, getInputProps,
  onAddPaste, onRemoveFile, onNext, onCancel,
}: ImportStepUploadProps) {
  return (
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
              <Badge variant="outline" className={`${TYPE_COLORS[f.classified.type]} whitespace-nowrap`}>{f.classified.label}</Badge>
              <Button variant="ghost" size="icon" className="h-6 w-6" aria-label="Remover arquivo" onClick={() => onRemoveFile(i)}>
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
          onChange={(e) => onPasteTextChange(e.target.value)}
          placeholder="Cole o conteúdo do CSV aqui..."
          className="min-h-[100px] font-mono text-xs"
        />
        {pasteText.trim() && (
          <div className="flex items-center gap-3">
            <Select value={pasteDelimiter} onValueChange={onPasteDelimiterChange}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto-detectar</SelectItem>
                <SelectItem value=",">Vírgula (,)</SelectItem>
                <SelectItem value=";">Ponto e vírgula (;)</SelectItem>
                <SelectItem value="&#9;">Tab</SelectItem>
                <SelectItem value="|">Pipe (|)</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" onClick={onAddPaste}>Adicionar</Button>
          </div>
        )}
      </div>

      <div>
        <Label className="text-xs">Query/Footprint usado (opcional)</Label>
        <Input value={footprintQuery} onChange={(e) => onFootprintQueryChange(e.target.value)} placeholder="Ex: cdn.utmify.com.br" />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button onClick={onNext} disabled={files.length === 0}>
          Próximo <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
