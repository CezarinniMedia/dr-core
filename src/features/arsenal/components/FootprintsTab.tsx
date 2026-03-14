import { useState } from "react";
import {
  useArsenalFootprints,
  useCreateFootprint,
  useDeleteFootprint,
  useToggleFavorito,
  useIncrementUsage,
} from "@/features/arsenal/hooks/useArsenal";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Badge } from "@/shared/components/ui/badge";
import { Card } from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/shared/components/ui/tooltip";
import { Plus, Star, Trash2, Copy, Fingerprint, Loader2, Hash } from "lucide-react";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useToast } from "@/shared/hooks/use-toast";

interface FootprintsTabProps {
  search: string;
}

const ferramentas = ["PublicWWW", "Google", "BuiltWith", "Outro"];
const categorias = ["checkout", "tracker", "cloaker", "cms", "cdn", "analytics", "geral"];

export function FootprintsTab({ search }: FootprintsTabProps) {
  const { data: footprints, isLoading } = useArsenalFootprints(search || undefined);
  const createMutation = useCreateFootprint();
  const deleteMutation = useDeleteFootprint();
  const toggleFav = useToggleFavorito();
  const incrementUsage = useIncrementUsage();
  const { toast } = useToast();

  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    footprint: "",
    nome: "",
    categoria: "",
    ferramenta: "",
    query_publicwww: "",
    query_google_dorks: "",
    plataforma: "",
    notas: "",
  });

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleCreate = () => {
    if (!form.footprint.trim()) return;
    createMutation.mutate(
      {
        footprint: form.footprint,
        nome: form.nome || null,
        categoria: form.categoria || null,
        ferramenta: form.ferramenta || null,
        query_publicwww: form.query_publicwww || null,
        query_google_dorks: form.query_google_dorks || null,
        plataforma: form.plataforma || null,
        notas: form.notas || null,
      },
      {
        onSuccess: () => {
          setShowCreate(false);
          setForm({ footprint: "", nome: "", categoria: "", ferramenta: "", query_publicwww: "", query_google_dorks: "", plataforma: "", notas: "" });
        },
      }
    );
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado!" });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-2" /> Novo Footprint
        </Button>
      </div>

      {!footprints?.length ? (
        <EmptyState
          icon={Fingerprint}
          title="Nenhum footprint salvo"
          description="Adicione footprints de checkout, tracker, cloaker e mais."
          actionLabel="Novo Footprint"
          onAction={() => setShowCreate(true)}
        />
      ) : (
        <div className="space-y-2">
          {footprints.map((fp) => (
            <Card key={fp.id} className="p-4 hover:border-primary/30 transition-colors group">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    {fp.nome && <span className="font-medium text-sm">{fp.nome}</span>}
                    {fp.categoria && (
                      <Badge variant="secondary" className="text-[10px]">{fp.categoria}</Badge>
                    )}
                    {fp.ferramenta && (
                      <Badge variant="outline" className="text-[10px]">{fp.ferramenta}</Badge>
                    )}
                    {fp.plataforma && (
                      <Badge variant="outline" className="text-[10px]">{fp.plataforma}</Badge>
                    )}
                  </div>
                  <code className="text-sm font-mono text-primary block truncate">{fp.footprint}</code>
                  {fp.query_publicwww && (
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">PublicWWW:</span> {fp.query_publicwww}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {fp.vezes_usado != null && fp.vezes_usado > 0 && (
                    <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                      <Hash className="h-3 w-3" />{fp.vezes_usado}
                    </span>
                  )}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => toggleFav.mutate({ table: "arsenal_footprints", id: fp.id, current: !!fp.is_favorito })}
                        className="p-1 rounded hover:bg-muted"
                      >
                        <Star className={`h-4 w-4 ${fp.is_favorito ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Favoritar</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => {
                          handleCopy(fp.footprint);
                          incrementUsage.mutate({ table: "arsenal_footprints", id: fp.id, current: fp.vezes_usado || 0 });
                        }}
                        className="p-1 rounded hover:bg-muted"
                      >
                        <Copy className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Copiar e incrementar uso</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setDeleteId(fp.id)}
                        className="p-1 rounded hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Deletar</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) deleteMutation.mutate(deleteId);
                setDeleteId(null);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Footprint</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Footprint *</Label>
              <Input
                value={form.footprint}
                onChange={(e) => update("footprint", e.target.value)}
                placeholder='Ex: checkout.kiwify.com.br'
                className="font-mono text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input value={form.nome} onChange={(e) => update("nome", e.target.value)} placeholder="Nome descritivo" />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={form.categoria} onValueChange={(v) => update("categoria", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {categorias.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ferramenta</Label>
                <Select value={form.ferramenta} onValueChange={(v) => update("ferramenta", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {ferramentas.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Plataforma</Label>
                <Input value={form.plataforma} onChange={(e) => update("plataforma", e.target.value)} placeholder="Hotmart, Kiwify..." />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Query PublicWWW</Label>
              <Input value={form.query_publicwww} onChange={(e) => update("query_publicwww", e.target.value)} placeholder="Query pronta para PublicWWW" className="font-mono text-sm" />
            </div>
            <div className="space-y-2">
              <Label>Query Google Dorks</Label>
              <Input value={form.query_google_dorks} onChange={(e) => update("query_google_dorks", e.target.value)} placeholder="Query pronta para Google" className="font-mono text-sm" />
            </div>
            <div className="space-y-2">
              <Label>Notas</Label>
              <Textarea value={form.notas} onChange={(e) => update("notas", e.target.value)} placeholder="Observações..." rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={!form.footprint.trim() || createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Criar Footprint
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
