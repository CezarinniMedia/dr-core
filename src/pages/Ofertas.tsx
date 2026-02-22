import { useState } from "react";
import { useOfertas, useDeleteOferta, useUpdateOferta, type OfertaStatus, type Oferta } from "@/features/offers/hooks/useOfertas";
import { OfertaCard } from "@/features/offers/components/OfertaCard";
import { OfertaFormDialog } from "@/features/offers/components/OfertaFormDialog";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/shared/components/ui/tooltip";
import {
  Plus, Package, FlaskConical, Zap, Pause, Skull,
  LayoutGrid, Table2, Columns3,
  ArrowUpDown, Globe, DollarSign,
} from "lucide-react";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { useNavigate } from "react-router-dom";
import { formatCurrency, formatDate } from "@/shared/lib/utils";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

type ViewMode = "cards" | "table" | "kanban";

const statusFilters: { label: React.ReactNode; value: OfertaStatus | "ALL" }[] = [
  { label: "Todas", value: "ALL" },
  { label: <><FlaskConical className="h-3.5 w-3.5 inline mr-1" />Research</>, value: "RESEARCH" },
  { label: <><FlaskConical className="h-3.5 w-3.5 inline mr-1" />Testando</>, value: "TEST" },
  { label: <><Zap className="h-3.5 w-3.5 inline mr-1" />Ativas</>, value: "ATIVA" },
  { label: <><Pause className="h-3.5 w-3.5 inline mr-1" />Pausadas</>, value: "PAUSE" },
  { label: <><Skull className="h-3.5 w-3.5 inline mr-1" />Mortas</>, value: "MORTA" },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  RESEARCH: { label: "Research", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  TEST: { label: "Testando", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  ATIVA: { label: "Ativa", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  PAUSE: { label: "Pausada", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  MORTA: { label: "Morta", color: "bg-red-500/20 text-red-400 border-red-500/30" },
};

const kanbanColumns: OfertaStatus[] = ["RESEARCH", "TEST", "ATIVA", "PAUSE", "MORTA"];

const LS_KEY_OFERTAS_FILTER = "ofertas-status-filter";
const LS_KEY_OFERTAS_VIEW = "ofertas-view-mode";

const viewModes: { value: ViewMode; icon: typeof LayoutGrid; label: string }[] = [
  { value: "cards", icon: LayoutGrid, label: "Cards" },
  { value: "table", icon: Table2, label: "Tabela" },
  { value: "kanban", icon: Columns3, label: "Kanban" },
];

function OfertaTableView({ ofertas, onDelete }: { ofertas: Oferta[]; onDelete: (id: string) => void }) {
  const navigate = useNavigate();

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Vertical</TableHead>
            <TableHead>Mercado</TableHead>
            <TableHead className="text-right">Ticket</TableHead>
            <TableHead className="text-right">CPA</TableHead>
            <TableHead className="text-right">ROAS</TableHead>
            <TableHead>Dominio</TableHead>
            <TableHead>Criada</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ofertas.map((o) => {
            const st = statusConfig[o.status] || statusConfig.RESEARCH;
            return (
              <TableRow
                key={o.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => navigate(`/ofertas/${o.id}`)}
              >
                <TableCell className="font-medium max-w-[200px] truncate">{o.nome}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${st.color}`}>
                    {st.label}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">{o.vertical || "—"}</TableCell>
                <TableCell className="text-muted-foreground">{o.mercado || "—"}</TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {o.ticket_front ? formatCurrency(o.ticket_front) : "—"}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {o.cpa_target ? formatCurrency(o.cpa_target) : "—"}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {o.roas_target ? `${o.roas_target}x` : "—"}
                </TableCell>
                <TableCell className="text-muted-foreground text-xs max-w-[150px] truncate">
                  {o.dominio_principal || "—"}
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {formatDate(o.created_at)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function OfertaKanbanView({
  ofertas,
  onDelete,
  onStatusChange,
}: {
  ofertas: Oferta[];
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: OfertaStatus) => void;
}) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-5 gap-3 min-w-[900px] overflow-x-auto">
      {kanbanColumns.map((status) => {
        const st = statusConfig[status];
        const items = ofertas.filter((o) => o.status === status);
        return (
          <div
            key={status}
            className="flex flex-col rounded-lg border bg-muted/20 min-h-[300px]"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const id = e.dataTransfer.getData("oferta-id");
              if (id) onStatusChange(id, status);
            }}
          >
            <div className="flex items-center justify-between px-3 py-2 border-b">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${st.color}`}>
                {st.label}
              </span>
              <span className="text-xs text-muted-foreground">{items.length}</span>
            </div>
            <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[60vh]">
              {items.map((o) => (
                <div
                  key={o.id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("oferta-id", o.id)}
                  className="rounded-md border bg-card p-3 cursor-grab active:cursor-grabbing hover:border-primary/40 transition-colors space-y-1.5"
                  onClick={() => navigate(`/ofertas/${o.id}`)}
                >
                  <p className="text-sm font-medium truncate">{o.nome}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {o.vertical && <span>{o.vertical}</span>}
                    {o.ticket_front && (
                      <span className="font-mono">{formatCurrency(o.ticket_front)}</span>
                    )}
                  </div>
                  {o.dominio_principal && (
                    <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                      <Globe className="h-3 w-3" /> {o.dominio_principal}
                    </p>
                  )}
                </div>
              ))}
              {items.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-8 italic">Vazio</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function OfertasPage() {
  const [statusFilter, setStatusFilter] = useState<OfertaStatus | "ALL">(() => {
    try {
      return (localStorage.getItem(LS_KEY_OFERTAS_FILTER) as OfertaStatus | "ALL") || "ALL";
    } catch {
      return "ALL";
    }
  });
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    try {
      return (localStorage.getItem(LS_KEY_OFERTAS_VIEW) as ViewMode) || "cards";
    } catch {
      return "cards";
    }
  });
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: ofertas, isLoading } = useOfertas(statusFilter === "ALL" ? undefined : statusFilter);
  const deleteMutation = useDeleteOferta();
  const updateMutation = useUpdateOferta();

  const handleDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId, { onSettled: () => setDeleteId(null) });
  };

  const handleStatusChange = (id: string, status: OfertaStatus) => {
    updateMutation.mutate({ id, data: { status } });
  };

  const allOfertas = useOfertas();

  return (
    <div className="space-y-6 max-w-[1400px]">
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

      {/* Filters + View Toggle */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {viewMode !== "kanban" && statusFilters.map((f) => (
            <Badge
              key={f.value}
              variant={statusFilter === f.value ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => {
                setStatusFilter(f.value);
                try { localStorage.setItem(LS_KEY_OFERTAS_FILTER, f.value); } catch {}
              }}
            >
              {f.label}
            </Badge>
          ))}
          {viewMode === "kanban" && (
            <p className="text-sm text-muted-foreground">Arraste ofertas entre colunas para mudar status</p>
          )}
        </div>
        <div className="flex items-center gap-1 border rounded-lg p-0.5">
          {viewModes.map((vm) => (
            <Tooltip key={vm.value}>
              <TooltipTrigger asChild>
                <button
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === vm.value
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => {
                    setViewMode(vm.value);
                    try { localStorage.setItem(LS_KEY_OFERTAS_VIEW, vm.value); } catch {}
                  }}
                >
                  <vm.icon className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>{vm.label}</TooltipContent>
            </Tooltip>
          ))}
        </div>
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
      ) : viewMode === "kanban" ? (
        <OfertaKanbanView
          ofertas={allOfertas.data || []}
          onDelete={setDeleteId}
          onStatusChange={handleStatusChange}
        />
      ) : !ofertas?.length ? (
        <EmptyState
          icon={Package}
          title="Nenhuma oferta encontrada"
          description="Crie sua primeira oferta para começar."
          actionLabel="Nova Oferta"
          onAction={() => setFormOpen(true)}
        />
      ) : viewMode === "table" ? (
        <OfertaTableView ofertas={ofertas} onDelete={setDeleteId} />
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
