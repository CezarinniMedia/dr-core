import { Button } from "@/shared/components/ui/button";
import { CheckCircle, RotateCw, BarChart3 } from "lucide-react";
import type { ImportResult } from "./types";

interface ImportStepResultProps {
  result: ImportResult;
  onClose: () => void;
}

export function ImportStepResult({ result, onClose }: ImportStepResultProps) {
  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-6 text-center space-y-3">
        <CheckCircle className="h-12 w-12 text-success mx-auto" />
        <h3 className="text-lg font-semibold">Importação Concluída!</h3>
        <div className="text-sm text-muted-foreground space-y-1">
          <p>{result.newOffers} ofertas criadas</p>
          <p className="flex items-center justify-center gap-1"><RotateCw className="h-3.5 w-3.5" /> {result.updated} ofertas atualizadas</p>
          <p className="flex items-center justify-center gap-1"><BarChart3 className="h-3.5 w-3.5" /> {result.trafficRecords} registros de tráfego importados</p>
        </div>
      </div>
      <div className="flex justify-end">
        <Button onClick={onClose}>Fechar</Button>
      </div>
    </div>
  );
}
