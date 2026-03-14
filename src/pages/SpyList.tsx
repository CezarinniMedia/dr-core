import { useState } from "react";
import { useCompetitors, useDeleteCompetitor } from "@/features/spy/hooks/useCompetitors";
import { CompetitorCard } from "@/features/spy/components/CompetitorCard";
import { CompetitorFormDialog } from "@/features/spy/components/CompetitorFormDialog";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Plus, Search, Flame, Zap, Snowflake } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";

export default function SpyPage() {
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const { data: competitors, isLoading } = useCompetitors(statusFilter);
  const deleteMutation = useDeleteCompetitor();
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Search className="h-6 w-6" /> Espionagem</h1>
          <p className="text-muted-foreground text-sm">
            Monitore concorrentes, salve ads e mapeie funis
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Competitor
        </Button>
      </div>

      <Tabs defaultValue="all" onValueChange={(v) => setStatusFilter(v === "all" ? undefined : v)}>
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="HOT" className="flex items-center gap-1.5"><Flame className="h-4 w-4" /> HOT</TabsTrigger>
          <TabsTrigger value="WARM" className="flex items-center gap-1.5"><Zap className="h-4 w-4" /> WARM</TabsTrigger>
          <TabsTrigger value="COLD" className="flex items-center gap-1.5"><Snowflake className="h-4 w-4" /> COLD</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <CompetitorGrid competitors={competitors} isLoading={isLoading} onDelete={setDeleteId} onAdd={() => setShowForm(true)} />
        </TabsContent>
        <TabsContent value="HOT" className="mt-4">
          <CompetitorGrid competitors={competitors} isLoading={isLoading} onDelete={setDeleteId} onAdd={() => setShowForm(true)} />
        </TabsContent>
        <TabsContent value="WARM" className="mt-4">
          <CompetitorGrid competitors={competitors} isLoading={isLoading} onDelete={setDeleteId} onAdd={() => setShowForm(true)} />
        </TabsContent>
        <TabsContent value="COLD" className="mt-4">
          <CompetitorGrid competitors={competitors} isLoading={isLoading} onDelete={setDeleteId} onAdd={() => setShowForm(true)} />
        </TabsContent>
      </Tabs>

      <CompetitorFormDialog open={showForm} onClose={() => setShowForm(false)} />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar competitor?</AlertDialogTitle>
            <AlertDialogDescription>
              Todos os ads e funnel maps associados serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) deleteMutation.mutate(deleteId);
                setDeleteId(null);
              }}
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CompetitorGrid({
  competitors,
  isLoading,
  onDelete,
  onAdd,
}: {
  competitors: any[] | undefined;
  isLoading: boolean;
  onDelete: (id: string) => void;
  onAdd: () => void;
}) {
  if (isLoading) return <p className="text-muted-foreground">Carregando...</p>;

  if (!competitors || competitors.length === 0) {
    return (
      <div className="border border-dashed rounded-lg p-12 text-center space-y-4">
        <Search className="h-10 w-10 text-muted-foreground mx-auto" />
        <p className="text-muted-foreground">Nenhum competitor encontrado.</p>
        <Button onClick={onAdd}>
          <Plus className="h-4 w-4 mr-2" /> Adicionar Primeiro Competitor
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {competitors.map((c: any) => (
        <CompetitorCard key={c.id} competitor={c} onDelete={onDelete} />
      ))}
    </div>
  );
}
