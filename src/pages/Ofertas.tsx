import { useState } from "react";
import { useOfertas, useDeleteOferta, type OfertaStatus } from "@/hooks/useOfertas";
import { OfertaCard } from "@/components/ofertas/OfertaCard";
import { OfertaFormDialog } from "@/components/ofertas/OfertaFormDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Package, FlaskConical, Zap, Pause, Skull } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const statusFilters: { label: React.ReactNode; value: OfertaStatus | "ALL" }[] = [
  { label: "Todas", value: "ALL" },
  { label: <><FlaskConical className="h-3.5 w-3.5 inline mr-1" />Research</>, value: "RESEARCH" },
  { label: <><FlaskConical className="h-3.5 w-3.5 inline mr-1" />Testando</>, value: "TEST" },
  { label: <><Zap className="h-3.5 w-3.5 inline mr-1" />Ativas</>, value: "ATIVA" },
  { label: <><Pause className="h-3.5 w-3.5 inline mr-1" />Pausadas</>, value: "PAUSE" },
  { label: <><Skull className="h-3.5 w-3.5 inline mr-1" />Mortas</>, value: "MORTA" },
];

export default function OfertasPage() {
  const [statusFilter, setStatusFilter] = useState<OfertaStatus | "ALL">("ALL");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: ofertas, isLoading } = useOfertas(statusFilter === "ALL" ? undefined : statusFilter);
  const deleteMutation = useDeleteOferta();

  const handleDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId, { onSettled: () => setDeleteId(null) });
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ofertas</h1>
          <p className="text-muted-foreground mt-1">Gerencie suas ofertas de Direct Response</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Nova Oferta
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {statusFilters.map((f) => (
          <Badge
            key={f.value}
            variant={statusFilter === f.value ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setStatusFilter(f.value)}
          >
            {f.label}
          </Badge>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-20 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-12 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : !ofertas?.length ? (
        <EmptyState
          icon={Package}
          title="Nenhuma oferta encontrada"
          description="Crie sua primeira oferta para começar."
          actionLabel="Nova Oferta"
          onAction={() => setFormOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ofertas.map((oferta) => (
            <OfertaCard key={oferta.id} oferta={oferta} onDelete={setDeleteId} />
          ))}
        </div>
      )}

      {/* Create dialog */}
      <OfertaFormDialog open={formOpen} onOpenChange={setFormOpen} />

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar oferta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Todos os dados da oferta, funil e brief serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
