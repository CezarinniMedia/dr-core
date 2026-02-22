import { useState } from "react";
import {
  useArsenalDorks,
  useCreateDork,
  useDeleteDork,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/shared/components/ui/tooltip";
import { Plus, Star, Trash2, Copy, SearchIcon, Loader2, Hash } from "lucide-react";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useToast } from "@/shared/hooks/use-toast";

interface DorksTabProps {
  search: string;
}

const ferramentas = ["PublicWWW", "Google Dorks", "BuiltWith", "Wappalyzer", "Outro"];
const tipos = ["checkout", "tracker", "cloaker", "plataforma", "pagamento", "geral"];

export function DorksTab({ search }: DorksTabProps) {
  const { data: dorks, isLoading } = useArsenalDorks(search || undefined);
  const createMutation = useCreateDork();
  const deleteMutation = useDeleteDork();
  const toggleFav = useToggleFavorito();
  const incrementUsage = useIncrementUsage();
  const { toast } = useToast();

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    dork_query: "",
    nome: "",
    tipo: "",
    ferramenta: "",
    objetivo: "",
    notas: "",
  });

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleCreate = () => {
    if (!form.dork_query.trim()) return;
    createMutation.mutate(
      {
        dork_query: form.dork_query,
        nome: form.nome || null,
        tipo: form.tipo || null,
        ferramenta: form.ferramenta || null,
        objetivo: form.objetivo || null,
        notas: form.notas || null,
      },
      {
        onSuccess: () => {
          setShowCreate(false);
          setForm({ dork_query: "", nome: "", tipo: "", ferramenta: "", objetivo: "", notas: "" });
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
          <Plus className="h-4 w-4 mr-2" /> Novo Dork
        </Button>
      </div>

      {!dorks?.length ? (
        <EmptyState
          icon={SearchIcon}
          title="Nenhum dork salvo"
          description="Adicione queries de busca para PublicWWW, Google Dorks e mais."
          actionLabel="Novo Dork"
          onAction={() => setShowCreate(true)}
        />
      ) : (
        <div className="space-y-2">
          {dorks.map((dork) => (
            <Card key={dork.id} className="p-4 hover:border-primary/30 transition-colors group">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    {dork.nome && <span className="font-medium text-sm">{dork.nome}</span>}
                    {dork.ferramenta && (
                      <Badge variant="outline" className="text-[10px]">{dork.ferramenta}</Badge>
                    )}
                    {dork.tipo && (
                      <Badge variant="secondary" className="text-[10px]">{dork.tipo}</Badge>
                    )}
                  </div>
                  <code className="text-sm font-mono text-primary block truncate">{dork.dork_query}</code>
                  {dork.objetivo && (
                    <p className="text-xs text-muted-foreground">{dork.objetivo}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {dork.vezes_usado != null && dork.vezes_usado > 0 && (
                    <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                      <Hash className="h-3 w-3" />{dork.vezes_usado}
                    </span>
                  )}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => toggleFav.mutate({ table: "arsenal_dorks", id: dork.id, current: !!dork.is_favorito })}
                        className="p-1 rounded hover:bg-muted"
                      >
                        <Star className={`h-4 w-4 ${dork.is_favorito ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Favoritar</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => {
                          handleCopy(dork.dork_query);
                          incrementUsage.mutate({ table: "arsenal_dorks", id: dork.id, current: dork.vezes_usado || 0 });
                        }}
                        className="p-1 rounded hover:bg-muted"
                      >
                        <Copy className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Copiar e incrementar uso</TooltipContent>
                  </Tooltip>
                  <button
                    onClick={() => deleteMutation.mutate(dork.id)}
                    className="p-1 rounded hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Dork</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Query *</Label>
              <Textarea
                value={form.dork_query}
                onChange={(e) => update("dork_query", e.target.value)}
                placeholder='Ex: "checkout.kiwify.com.br" type:html'
                rows={2}
                className="font-mono text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input value={form.nome} onChange={(e) => update("nome", e.target.value)} placeholder="Nome descritivo" />
              </div>
              <div className="space-y-2">
                <Label>Ferramenta</Label>
                <Select value={form.ferramenta} onValueChange={(v) => update("ferramenta", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {ferramentas.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={form.tipo} onValueChange={(v) => update("tipo", v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {tipos.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Objetivo</Label>
              <Input value={form.objetivo} onChange={(e) => update("objetivo", e.target.value)} placeholder="O que esta query encontra" />
            </div>
            <div className="space-y-2">
              <Label>Notas</Label>
              <Textarea value={form.notas} onChange={(e) => update("notas", e.target.value)} placeholder="Observações..." rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={!form.dork_query.trim() || createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Criar Dork
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
