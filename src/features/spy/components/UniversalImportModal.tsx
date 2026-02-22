import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/shared/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { FileSpreadsheet, ArrowRight, Clock } from "lucide-react";
import { useImportWorkflow } from "./import-modal/useImportWorkflow";
import { ImportStepUpload } from "./import-modal/ImportStepUpload";
import { ImportStepClassification } from "./import-modal/ImportStepClassification";
import { ImportStepMatching } from "./import-modal/ImportStepMatching";
import { ImportStepResult } from "./import-modal/ImportStepResult";
import { ImportHistoryPanel } from "./import-modal/ImportHistoryPanel";

interface UniversalImportModalProps {
  open: boolean;
  onClose: () => void;
}

export function UniversalImportModal({ open, onClose }: UniversalImportModalProps) {
  const wf = useImportWorkflow();
  const [activeTab, setActiveTab] = useState<"import" | "history">("import");

  const handleClose = () => { wf.handleReset(); setActiveTab("import"); onClose(); };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" /> Importador Universal de CSV
          </DialogTitle>
          <DialogDescription>
            Importe dados do PublicWWW, Semrush Bulk, Geo, Paginas, Subdominios e mais
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "import" | "history")}>
          <TabsList className="w-full">
            <TabsTrigger value="import" className="flex-1 gap-1.5">
              <FileSpreadsheet className="h-3.5 w-3.5" /> Nova Importacao
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1 gap-1.5">
              <Clock className="h-3.5 w-3.5" /> Historico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="mt-3">
            {/* Step indicators */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
              {[1, 2, 3, 4].map(s => (
                <div key={s} className={`flex items-center gap-1 ${wf.step >= s ? "text-primary font-medium" : ""}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${wf.step >= s ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    {s}
                  </span>
                  {s === 1 && "Upload"}
                  {s === 2 && "Classificacao"}
                  {s === 3 && "Matching"}
                  {s === 4 && "Resultado"}
                  {s < 4 && <ArrowRight className="h-3 w-3 ml-1" />}
                </div>
              ))}
            </div>

            {wf.step === 1 && (
              <ImportStepUpload
                files={wf.files}
                uploading={wf.uploading}
                uploadProgress={wf.uploadProgress}
                pasteText={wf.pasteText}
                onPasteTextChange={wf.setPasteText}
                pasteDelimiter={wf.pasteDelimiter}
                onPasteDelimiterChange={wf.setPasteDelimiter}
                footprintQuery={wf.footprintQuery}
                onFootprintQueryChange={wf.setFootprintQuery}
                isDragActive={wf.dropzone.isDragActive}
                getRootProps={wf.dropzone.getRootProps}
                getInputProps={wf.dropzone.getInputProps}
                onAddPaste={wf.handleAddPaste}
                onRemoveFile={wf.removeFile}
                onNext={() => wf.setStep(2)}
                onCancel={handleClose}
              />
            )}

            {wf.step === 2 && (
              <ImportStepClassification
                files={wf.files}
                matching={wf.matching}
                progressLabel={wf.progressLabel}
                onUpdateFileType={wf.updateFileType}
                onUpdateFilePeriod={wf.updateFilePeriod}
                onApplyTypeToAll={wf.applyTypeToAll}
                onApplyPeriodToAll={wf.applyPeriodToAll}
                onToggleColumn={wf.toggleColumn}
                onToggleRow={wf.toggleRow}
                onBack={() => wf.setStep(1)}
                onNext={wf.handleMatchDomains}
              />
            )}

            {wf.step === 3 && (
              <ImportStepMatching
                domainMatches={wf.domainMatches}
                importing={wf.importing}
                progress={wf.progress}
                progressLabel={wf.progressLabel}
                totalDomains={wf.totalDomains}
                matchedDomains={wf.matchedDomains}
                newDomains={wf.newDomains}
                totalTraffic={wf.totalTraffic}
                onBack={() => wf.setStep(2)}
                onImport={wf.handleImport}
              />
            )}

            {wf.step === 4 && wf.importResult && (
              <ImportStepResult result={wf.importResult} onClose={handleClose} />
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-3">
            <ImportHistoryPanel />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
