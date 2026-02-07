import { useState } from "react";
import { useOfertas, useDeleteOferta, type OfertaStatus } from "@/hooks/useOfertas";
import { OfertaCard } from "@/components/ofertas/OfertaCard";
import { OfertaFormDialog } from "@/components/ofertas/OfertaFormDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Package, Loader2 } from "lucide-react";
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

const statusFilters: { label: string; value: OfertaStatus | "ALL" }[] = [
  { label: "Todas", value: "ALL" },
  { label: "🔬 Research", value: "RESEARCH" },
  { label: "⚗️ Testando", value: "TEST" },
  { label: "⚡ Ativas", value: "ATIVA" },
  { label: "⏸️ Pausadas", value: "PAUSE" },
  { label: "☠️ Mortas", value: "MORTA" },
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
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : !ofertas?.length ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Package className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">Nenhuma oferta encontrada</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">Crie sua primeira oferta para começar.</p>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Nova Oferta
          </Button>
        </div>
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
