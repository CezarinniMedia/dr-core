import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { useHooks, useUpdateHookStatus, useDeleteHook } from "@/features/creatives/hooks/useCriativos";
import { Check, Copy, Trash2, X } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";

interface HooksListProps {
  ofertaId: string;
}

const anguloColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  DOR: "destructive",
  DESEJO: "default",
  CURIOSIDADE: "secondary",
  PROVA_SOCIAL: "outline",
  AUTORIDADE: "outline",
};

export function HooksList({ ofertaId }: HooksListProps) {
  const { data: hooks, isLoading } = useHooks(ofertaId);
  const updateStatus = useUpdateHookStatus();
  const deleteHook = useDeleteHook();
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Hook copiado!" });
  };

  if (isLoading) return <p className="text-muted-foreground text-sm">Carregando hooks...</p>;
  if (!hooks || hooks.length === 0) {
    return (
      <div className="border border-dashed rounded-lg p-6 text-center">
        <p className="text-muted-foreground text-sm">
          Nenhum hook gerado. Use o gerador de hooks para criar em batch.
        </p>
      </div>
    );
  }

  const draftHooks = hooks.filter((h) => h.status === "DRAFT");
  const usedHooks = hooks.filter((h) => h.status === "USADO");
  const discardedHooks = hooks.filter((h) => h.status === "DESCARTADO");

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {hooks.length} hooks · {draftHooks.length} draft · {usedHooks.length} usados · {discardedHooks.length} descartados
      </p>

      <div className="space-y-2">
        {hooks.map((hook) => (
          <Card key={hook.id} className={hook.status === "DESCARTADO" ? "opacity-50" : ""}>
            <CardContent className="p-3 flex items-start gap-3">
              <div className="flex-1 space-y-1">
                <p className="text-sm">{hook.texto}</p>
                <div className="flex gap-1">
                  {hook.angulo && (
                    <Badge variant={anguloColors[hook.angulo] || "outline"} className="text-[10px]">
                      {hook.angulo}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-[10px]">
                    {hook.status}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => copyToClipboard(hook.texto)}
                  title="Copiar"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                {hook.status === "DRAFT" && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-primary"
                      onClick={() => updateStatus.mutate({ id: hook.id, status: "USADO" })}
                      title="Marcar como usado"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground"
                      onClick={() => updateStatus.mutate({ id: hook.id, status: "DESCARTADO" })}
                      title="Descartar"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive"
                  onClick={() => deleteHook.mutate(hook.id)}
                  title="Deletar"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
