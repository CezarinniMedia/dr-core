import { useState } from "react";
import {
  Bookmark, Plus, Pin, Trash2, Check, MoreHorizontal,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel,
} from "@/shared/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogDescription,
} from "@/shared/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { Input } from "@/shared/components/ui/input";
import { useToast } from "@/shared/hooks/use-toast";
import {
  useSavedViews, useCreateSavedView, useDeleteSavedView, useUpdateSavedView,
  type SpyViewFilters, type SavedView,
} from "@/features/spy/hooks/useSavedViews";

interface SavedViewsDropdownProps {
  currentFilters: SpyViewFilters;
  visibleColumns: string[];
  onApplyView: (view: SavedView) => void;
  activeViewId?: string | null;
}

export function SavedViewsDropdown({
  currentFilters, visibleColumns, onApplyView, activeViewId,
}: SavedViewsDropdownProps) {
  const { toast } = useToast();
  const { data: views = [] } = useSavedViews("spy");
  const createView = useCreateSavedView();
  const deleteView = useDeleteSavedView();
  const updateView = useUpdateSavedView();

  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newName, setNewName] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  const handleSave = async () => {
    if (!newName.trim()) return;
    try {
      await createView.mutateAsync({
        name: newName.trim(),
        filters: currentFilters,
        visible_columns: [...visibleColumns],
      });
      toast({ title: "View salva!" });
      setNewName("");
      setShowSaveDialog(false);
    } catch (err: any) {
      toast({ title: "Erro ao salvar view", description: err.message, variant: "destructive" });
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteView.mutateAsync(deleteConfirm.id);
      toast({ title: `View "${deleteConfirm.name}" removida` });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleTogglePin = async (view: SavedView) => {
    try {
      await updateView.mutateAsync({ id: view.id, is_pinned: !view.is_pinned });
    } catch {
      // silent
    }
  };

  const pinnedViews = views.filter(v => v.is_pinned);
  const otherViews = views.filter(v => !v.is_pinned);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs border-[var(--border-default)] text-[color:var(--text-secondary)]"
            title="Views salvas"
          >
            <Bookmark className="h-3.5 w-3.5" />
            Views
            {views.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[var(--accent-primary-muted)] text-[var(--accent-primary)] text-[10px]">
                {views.length}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-64">
          {pinnedViews.length > 0 && (
            <>
              <DropdownMenuLabel className="text-[10px] text-[var(--text-muted)]">
                Fixadas
              </DropdownMenuLabel>
              {pinnedViews.map(view => (
                <ViewItem
                  key={view.id}
                  view={view}
                  isActive={activeViewId === view.id}
                  onSelect={() => onApplyView(view)}
                  onDelete={() => setDeleteConfirm({ id: view.id, name: view.name })}
                  onTogglePin={() => handleTogglePin(view)}
                />
              ))}
              <DropdownMenuSeparator />
            </>
          )}

          {otherViews.length > 0 && (
            <>
              <DropdownMenuLabel className="text-[10px] text-[var(--text-muted)]">
                Salvas
              </DropdownMenuLabel>
              {otherViews.map(view => (
                <ViewItem
                  key={view.id}
                  view={view}
                  isActive={activeViewId === view.id}
                  onSelect={() => onApplyView(view)}
                  onDelete={() => setDeleteConfirm({ id: view.id, name: view.name })}
                  onTogglePin={() => handleTogglePin(view)}
                />
              ))}
              <DropdownMenuSeparator />
            </>
          )}

          {views.length === 0 && (
            <div className="px-3 py-4 text-center text-xs text-[var(--text-muted)]">
              Nenhuma view salva. Clique abaixo para salvar os filtros atuais.
            </div>
          )}

          <DropdownMenuItem
            className="gap-2 text-[var(--accent-primary)]"
            onSelect={() => setShowSaveDialog(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            Salvar filtros atuais
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => { if (!open) setDeleteConfirm(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover view salva?</AlertDialogTitle>
            <AlertDialogDescription>
              A view &ldquo;{deleteConfirm?.name}&rdquo; sera removida permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirmed}>
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Salvar View</DialogTitle>
            <DialogDescription>
              Salve os filtros e colunas atuais como uma view reutilizavel.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Nome da view (ex: Hot Nutra BR)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowSaveDialog(false)}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!newName.trim() || createView.isPending}>
              {createView.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ViewItem({
  view, isActive, onSelect, onDelete, onTogglePin,
}: {
  view: SavedView;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
}) {
  return (
    <DropdownMenuItem className="flex items-center gap-2 group" onSelect={onSelect}>
      {isActive && <Check className="h-3.5 w-3.5 text-[var(--accent-primary)] shrink-0" />}
      {!isActive && <div className="w-3.5" />}
      <span className="flex-1 truncate text-sm">{view.name}</span>
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          className={`p-0.5 rounded hover:bg-[var(--bg-subtle)] ${view.is_pinned ? "text-[var(--accent-amber)]" : "text-[var(--text-muted)]"}`}
          onClick={(e) => { e.stopPropagation(); onTogglePin(); }}
          title={view.is_pinned ? "Desafixar" : "Fixar"}
          aria-label={view.is_pinned ? "Desafixar view" : "Fixar view"}
        >
          <Pin className="h-3 w-3" />
        </button>
        <button
          className="p-0.5 rounded hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--semantic-error)]"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          title="Remover view"
          aria-label="Remover view"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </DropdownMenuItem>
  );
}
