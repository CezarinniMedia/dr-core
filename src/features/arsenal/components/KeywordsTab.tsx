import { useState } from "react";
import {
  useArsenalKeywords,
  useCreateKeyword,
  useDeleteKeyword,
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
import { Plus, Star, Trash2, Copy, Key, Loader2, Hash } from "lucide-react";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useToast } from "@/shared/hooks/use-toast";

interface KeywordsTabProps {
  search: string;
}

const tiposKeyword = ["seed", "long-tail", "competitor", "brand", "intent", "question"];
const idiomas = ["PT-BR", "EN-US", "ES", "Multi"];

export function KeywordsTab({ search }: KeywordsTabProps) {
  const { data: keywords, isLoading } = useArsenalKeywords(search || undefined);
  const createMutation = useCreateKeyword();
  const deleteMutation = useDeleteKeyword();
  const toggleFav = useToggleFavorito();
  const incrementUsage = useIncrementUsage();
  const { toast } = useToast();

  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    keyword: "",
    tipo: "",
    plataforma: "",
    idioma: "",
    notas: "",
  });

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleCreate = () => {
    if (!form.keyword.trim()) return;
    createMutation.mutate(
      {
        keyword: form.keyword,
        tipo: form.tipo || null,
        plataforma: form.plataforma || null,
        idioma: form.idioma || null,
        notas: form.notas || null,
      },
      {
        onSuccess: () => {
          setShowCreate(false);
          setForm({ keyword: "", tipo: "", plataforma: "", idioma: "", notas: "" });
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
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-2" /> Nova Keyword
        </Button>
      </div>

      {!keywords?.length ? (
        <EmptyState
          icon={Key}
          title="Nenhuma keyword salva"
          description="Adicione keywords de busca, nichos e termos de monitoramento."
          actionLabel="Nova Keyword"
          onAction={() => setShowCreate(true)}
        />
      ) : (
        <div className="space-y-2">
          {keywords.map((kw) => (
            <Card key={kw.id} className="p-4 hover:border-primary/30 transition-colors group">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <code className="font-mono text-sm text-primary font-medium">{kw.keyword}</code>
                    {kw.tipo && (
                      <Badge variant="secondary" className="text-[10px]">{kw.tipo}</Badge>
                    )}
                    {kw.idioma && (
                      <Badge variant="outline" className="text-[10px]">{kw.idioma}</Badge>
                    )}
                    {kw.plataforma && (
                      <Badge variant="outline" className="text-[10px]">{kw.plataforma}</Badge>
                    )}
                  </div>
                  {kw.notas && (
                    <p className="text-xs text-muted-foreground">{kw.notas}</p>
                  )}
                  {kw.nichos && kw.nichos.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {kw.nichos.map((n: string) => (
                        <Badge key={n} variant="outline" className="text-[9px]">{n}</Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {kw.vezes_usado != null && kw.vezes_usado > 0 && (
                    <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                      <Hash className="h-3 w-3" />{kw.vezes_usado}
                    </span>
                  )}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => toggleFav.mutate({ table: "arsenal_keywords", id: kw.id, current: !!kw.is_favorito })}
                        className="p-1 rounded hover:bg-muted"
                      >
                        <Star className={`h-4 w-4 ${kw.is_favorito ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Favoritar</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => {
                          handleCopy(kw.keyword);
                          incrementUsage.mutate({ table: "arsenal_keywords", id: kw.id, current: kw.vezes_usado || 0 });
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
                        onClick={() => setDeleteId(kw.id)}
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
            <DialogTitle>Nova Keyword</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Keyword *</Label>
              <Input
                value={form.keyword}
                onChange={(e) => update("keyword", e.target.value)}
                placeholder="Ex: como emagrecer rapido"
                className="font-mono text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={form.tipo} onValueChange={(v) => update("tipo", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {tiposKeyword.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Idioma</Label>
                <Select value={form.idioma} onValueChange={(v) => update("idioma", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {idiomas.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Plataforma</Label>
              <Input value={form.plataforma} onChange={(e) => update("plataforma", e.target.value)} placeholder="Google, Semrush, PublicWWW..." />
            </div>
            <div className="space-y-2">
              <Label>Notas</Label>
              <Textarea value={form.notas} onChange={(e) => update("notas", e.target.value)} placeholder="Observações..." rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={!form.keyword.trim() || createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Criar Keyword
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
