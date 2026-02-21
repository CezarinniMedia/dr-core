import { useState } from "react";
import { useOfertas } from "@/hooks/useOfertas";
import { useCriativos } from "@/hooks/useCriativos";
import { KanbanBoard } from "@/components/criativos/KanbanBoard";
import { HookGeneratorModal } from "@/components/criativos/HookGeneratorModal";
import { CriativoFormDialog } from "@/components/criativos/CriativoFormDialog";
import { HooksList } from "@/components/criativos/HooksList";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Sparkles, LayoutList, Target } from "lucide-react";

export default function CriativosPage() {
  const [selectedOferta, setSelectedOferta] = useState<string>("");
  const [showHookGenerator, setShowHookGenerator] = useState(false);
  const [showCriativoForm, setShowCriativoForm] = useState(false);
  const { data: ofertas } = useOfertas();
  const { data: criativos } = useCriativos(selectedOferta || undefined);

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Sparkles className="h-6 w-6" /> Criativos</h1>
          <p className="text-muted-foreground text-sm">
            Produza hooks em batch, gerencie criativos e acompanhe performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowHookGenerator(true)}
            disabled={!selectedOferta}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Gerar Hooks
          </Button>
          <Button onClick={() => setShowCriativoForm(true)} disabled={!selectedOferta}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Criativo
          </Button>
        </div>
      </div>

      {/* Oferta selector */}
      <div className="max-w-xs">
        <Select value={selectedOferta} onValueChange={setSelectedOferta}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma oferta..." />
          </SelectTrigger>
          <SelectContent>
            {ofertas?.map((o) => (
              <SelectItem key={o.id} value={o.id}>
                {o.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedOferta ? (
        <Tabs defaultValue="kanban">
          <TabsList>
            <TabsTrigger value="kanban" className="flex items-center gap-1.5"><LayoutList className="h-4 w-4" /> Kanban</TabsTrigger>
            <TabsTrigger value="hooks" className="flex items-center gap-1.5"><Target className="h-4 w-4" /> Hooks</TabsTrigger>
          </TabsList>

          <TabsContent value="kanban" className="mt-4">
            {criativos && criativos.length > 0 ? (
              <KanbanBoard criativos={criativos as any} />
            ) : (
              <div className="border border-dashed rounded-lg p-12 text-center space-y-4">
                <p className="text-muted-foreground">
                  Nenhum criativo ainda. Crie o primeiro ou gere hooks para começar.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={() => setShowHookGenerator(true)}>
                    <Sparkles className="h-4 w-4 mr-2" /> Gerar Hooks
                  </Button>
                  <Button onClick={() => setShowCriativoForm(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Novo Criativo
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="hooks" className="mt-4">
            <HooksList ofertaId={selectedOferta} />
          </TabsContent>
        </Tabs>
      ) : (
        <div className="border border-dashed rounded-lg p-12 text-center">
          <p className="text-muted-foreground">
            Selecione uma oferta para ver os criativos e hooks.
          </p>
        </div>
      )}

      {selectedOferta && (
        <>
          <HookGeneratorModal
            open={showHookGenerator}
            onClose={() => setShowHookGenerator(false)}
            ofertaId={selectedOferta}
          />
          <CriativoFormDialog
            open={showCriativoForm}
            onClose={() => setShowCriativoForm(false)}
            ofertaId={selectedOferta}
          />
        </>
      )}
    </div>
  );
}
